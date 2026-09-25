// Supabase Edge Function: chấm câu tiếng Anh người học đặt với một từ mục tiêu,
// dùng một endpoint chat completions tương thích OpenAI (mặc định DeepSeek).
//
// Secrets (Supabase → Edge Functions → Secrets):
//   AI_API_KEY   (bắt buộc) khóa API của nhà cung cấp
//   AI_BASE_URL  (tùy chọn) mặc định https://api.deepseek.com
//   AI_MODEL     (tùy chọn) mặc định deepseek-chat

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `Bạn là giáo viên tiếng Anh cho người Việt. Học viên vừa học một từ và phải đặt một câu tiếng Anh có dùng từ đó. Nhiệm vụ của bạn là chấm câu đó.

Nguyên tắc:
- Chỉ chấm dựa trên từ mục tiêu và nghĩa đã cho; không bịa thêm ngữ cảnh.
- Nêu lỗi cụ thể (ngữ pháp, chính tả, dùng từ, collocation, thì, mạo từ…). Không bắt lỗi phong cách nếu câu vẫn đúng.
- Nếu câu đúng và tự nhiên: khen ngắn gọn, cho điểm cao, "errors" có thể rỗng.
- "corrected" là câu hoàn chỉnh đã sửa, giữ tối đa ý của học viên; nếu câu đã đúng thì lặp lại chính câu đó.
- "alternatives" là 2–3 câu mẫu tự nhiên ở ngữ cảnh khác nhau (trình độ B1–B2).
- "usedWord" = câu có thực sự dùng từ mục tiêu (kể cả biến thể đúng dạng) hay không.
- "score" 0–100: 0–40 sai nặng hoặc không dùng từ; 41–69 hiểu đúng nhưng nhiều lỗi; 70–89 đúng, còn lỗi nhỏ; 90–100 tự nhiên và chính xác.
- "level" CHỈ chọn một trong các giá trị sau (khớp với score): "Xuất sắc" (90–100), "Tốt" (80–89), "Khá" (60–79), "Cần cố gắng" (<60), "Không dùng từ mục tiêu" (khi usedWord = false). Không dùng nhãn CEFR như "B1".
- Toàn bộ nhận xét viết bằng TIẾNG VIỆT, ngắn gọn, dễ hiểu.

CHỈ trả về một object JSON đúng định dạng sau, không thêm chữ nào khác:
{
  "score": number,
  "level": string,
  "verdict": string,
  "usedWord": boolean,
  "errors": [{ "type": string, "excerpt": string, "explain": string, "fix": string }],
  "corrected": string,
  "alternatives": [string],
  "tip": string
}`

interface RequestBody {
  word?: unknown
  meaning?: unknown
  example?: unknown
  note?: unknown
  sentence?: unknown
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Cổng function chấp nhận cả request chỉ có `apikey` (khóa public nằm trong bundle),
 * nên phải tự chặn: chỉ người đã đăng nhập mới được gọi để khỏi đốt credit AI.
 * Trả về thông báo lỗi, hoặc null khi hợp lệ.
 */
async function requireUser(req: Request): Promise<string | null> {
  const header = req.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return 'Thiếu phiên đăng nhập.'

  const base = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!base || !anonKey) return null // thiếu thông tin nền tảng → không kiểm tra được

  let user: { id?: unknown } | null = null
  try {
    const response = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    })
    if (response.ok) user = (await response.json()) as { id?: unknown }
  } catch {
    return 'Không xác thực được phiên đăng nhập. Thử lại giúp.'
  }
  return typeof user?.id === 'string' ? null : 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
}

/** Lấy object JSON từ nội dung model trả về (chịu được ```json … ``` và văn bản thừa). */
function extractJson(content: string): unknown {
  const cleaned = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

async function callModel(
  baseUrl: string,
  apiKey: string,
  model: string,
  userPrompt: string,
  jsonMode: boolean,
): Promise<{ content: string | null; status: number; detail: string | null }> {
  const payload: Record<string, unknown> = {
    model,
    temperature: 0.3,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  }
  if (jsonMode) payload.response_format = { type: 'json_object' }

  let response: Response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    })
  } catch (cause) {
    return { content: null, status: 502, detail: `Không gọi được nhà cung cấp AI: ${String(cause)}` }
  }

  if (!response.ok) {
    const detail = await response.text()
    return { content: null, status: response.status, detail: detail.slice(0, 400) }
  }

  const data = (await response.json()) as { choices?: { message?: { content?: unknown } }[] }
  return { content: text(data.choices?.[0]?.message?.content), status: 200, detail: null }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Chỉ nhận POST.' }, 405)

  const authError = await requireUser(req)
  if (authError) return json({ error: authError }, 401)

  const apiKey = Deno.env.get('AI_API_KEY')
  if (!apiKey) {
    return json({ error: 'Máy chấm chưa được cấu hình: thiếu secret AI_API_KEY của project.' }, 500)
  }
  const baseUrl = (Deno.env.get('AI_BASE_URL') ?? 'https://api.deepseek.com').replace(/\/+$/, '')
  const model = Deno.env.get('AI_MODEL') ?? 'deepseek-chat'

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return json({ error: 'Body không phải JSON hợp lệ.' }, 400)
  }

  const word = text(body.word)
  const meaning = text(body.meaning)
  const sentence = text(body.sentence)
  if (!word || !sentence) return json({ error: 'Thiếu từ mục tiêu hoặc câu cần chấm.' }, 400)
  if (sentence.length > 1000) return json({ error: 'Câu quá dài (tối đa 1000 ký tự).' }, 400)

  const lines = [`Từ mục tiêu: ${word}`, `Nghĩa: ${meaning || '(không có)'}`]
  const note = text(body.note)
  const example = text(body.example)
  if (note) lines.push(`Khái niệm / ghi chú: ${note}`)
  if (example) lines.push(`Ví dụ có sẵn: ${example}`)
  lines.push('', `Câu học viên viết: ${sentence}`)
  const userPrompt = lines.join('\n')

  let attempt = await callModel(baseUrl, apiKey, model, userPrompt, true)
  // Vài nhà cung cấp tương thích OpenAI không hỗ trợ response_format → thử lại khi lỗi 4xx.
  if (attempt.status >= 400 && attempt.status < 500) {
    attempt = await callModel(baseUrl, apiKey, model, userPrompt, false)
  }

  if (attempt.content === null) {
    return json({ error: `Máy chấm lỗi (${attempt.status}). ${attempt.detail ?? ''}`.trim() }, 502)
  }

  const grade = extractJson(attempt.content)
  if (!grade || typeof grade !== 'object') {
    return json({ error: 'Máy chấm trả về định dạng không đọc được. Thử lại giúp.' }, 502)
  }

  return json(grade)
})

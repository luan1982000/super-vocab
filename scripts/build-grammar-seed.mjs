import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Gộp nội dung ngữ pháp trong `supabase/grammar/*.json` thành một file SQL upsert
 * (`supabase/grammar-seed.sql`) để chạy trong SQL Editor hoặc qua migration.
 *
 * Chạy: npm run seed:grammar
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const grammarDir = join(root, 'supabase', 'grammar')
const outputPath = join(root, 'supabase', 'grammar-seed.sql')

const files = ['stage1.json', 'stage2.json', 'stage3.json', 'stage4.json', 'stage5.json']
const topics = []

for (const file of files) {
  const pack = JSON.parse(readFileSync(join(grammarDir, file), 'utf8'))
  if (!Number.isInteger(pack.stage) || !Array.isArray(pack.topics)) {
    throw new Error(`${file}: thiếu stage hoặc topics`)
  }
  pack.topics.forEach((topic, index) => {
    if (!topic.slug || !topic.title || !topic.summary || !topic.content) {
      throw new Error(`${file}: topic ${index + 1} thiếu trường bắt buộc`)
    }
    if (topic.examples?.length !== 3) {
      throw new Error(`${file}: ${topic.slug} phải có đúng 3 ví dụ`)
    }
    if (topic.exercises?.length !== 3) {
      throw new Error(`${file}: ${topic.slug} phải có đúng 3 bài tập`)
    }
    for (const exercise of topic.exercises) {
      if (exercise.options?.length !== 4 || new Set(exercise.options).size !== 4) {
        throw new Error(`${file}: ${topic.slug} có bài tập không đủ 4 lựa chọn khác nhau`)
      }
      if (!Number.isInteger(exercise.answer) || exercise.answer < 0 || exercise.answer > 3) {
        throw new Error(`${file}: ${topic.slug} có đáp án ngoài 0–3`)
      }
    }
    topics.push({
      slug: topic.slug,
      stage: pack.stage,
      position: index + 1,
      title: topic.title,
      title_en: topic.titleEn ?? null,
      summary: topic.summary,
      content: topic.content,
      examples: topic.examples,
      exercises: topic.exercises,
      is_new: Boolean(topic.isNew),
    })
  })
}

const slugs = new Set(topics.map((topic) => topic.slug))
if (slugs.size !== topics.length) throw new Error('Có slug trùng giữa các chủ đề')
if (topics.length === 0) throw new Error('Không có chủ đề nào để seed')

const payload = JSON.stringify(topics)
if (payload.includes('$seed$')) throw new Error('Nội dung chứa $seed$ — đổi delimiter trước khi seed')

const sql = `-- Tự sinh bởi scripts/build-grammar-seed.mjs — đừng sửa tay.
-- Nội dung ngữ pháp dùng chung cho mọi user; tiến độ nằm ở bảng grammar_progress.
with payload as (select $seed$${payload}$seed$::jsonb as data)
insert into public.grammar_topics
  (slug, stage, position, title, title_en, summary, content, examples, exercises, is_new, updated_at)
select x.slug, x.stage, x.position, x.title, x.title_en, x.summary, x.content,
       x.examples, x.exercises, x.is_new, now()
from payload, jsonb_to_recordset(payload.data) as x(
  slug text, stage smallint, position smallint, title text, title_en text, summary text,
  content text, examples jsonb, exercises jsonb, is_new boolean
)
on conflict (slug) do update set
  stage = excluded.stage,
  position = excluded.position,
  title = excluded.title,
  title_en = excluded.title_en,
  summary = excluded.summary,
  content = excluded.content,
  examples = excluded.examples,
  exercises = excluded.exercises,
  is_new = excluded.is_new,
  updated_at = now();
`

writeFileSync(outputPath, sql)
console.log(`Đã ghi ${outputPath}: ${topics.length} chủ đề, ${payload.length} ký tự JSON.`)

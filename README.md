# Super Vocab

Web học từ vựng cá nhân: lưu từ và ôn bằng flashcard theo thuật toán spaced repetition (FSRS).

- **Trang:** Login (`#/login`) · Thêm từ (`#/vocab`) · Danh sách từ vựng (`#/vocab/list`) · Ngữ pháp (`#/grammar`) · Ôn tập (`#/practice` → chọn chế độ)
- **2 chế độ ôn:** Flashcard (`#/practice/flashcard`) · Viết câu (`#/practice/writing`, chấm bằng AI)
- **Ngữ pháp:** 49 chủ đề / 5 giai đoạn, mỗi chủ đề có bài học, ví dụ và **3 bài tập**; tiến độ (trạng thái, mức nắm 1–5, ngày học, ngày ôn tiếp) lưu riêng theo user
- **Bộ từ (collection):** gom từ theo chủ đề; phiên ôn tập chỉ gồm từ trong bộ đang chọn
- **Stack:** Vite + React + TypeScript · Tailwind CSS · react-router-dom (HashRouter) · Supabase (DB + Auth) · ts-fsrs · `@phosphor-icons/react` (icon) · `page-mascot` (linh vật ở góc)
- **Giao diện:** xem [`design.md`](./design.md) — hệ token, bảng màu, thang chữ, thành phần dùng chung

## 1. Cài đặt

```bash
npm install
cp .env.example .env.local   # rồi điền Supabase URL + public key (publishable hoặc anon)
npm run dev
```

### Backend Supabase

Project `qqtpselvrnkfcahdarbn` **đã được cấu hình sẵn**: `collections`, `cards`, `grammar_topics` (49 chủ đề đã seed), `grammar_progress`, index và RLS đã được apply qua MCP. Việc còn lại chỉ là điền key vào `.env.local`.

Nếu dựng project khác:

1. Tạo project tại [supabase.com](https://supabase.com).
2. Chạy `supabase/schema.sql` (SQL Editor, hoặc `apply_migration` qua Supabase MCP). File này tạo `collections`, `cards`, `grammar_topics`, `grammar_progress`, index và **bật RLS**.
3. Nạp nội dung ngữ pháp: chạy `supabase/grammar-seed.sql` trong SQL Editor (upsert 49 chủ đề, chạy lại nhiều lần vẫn an toàn). File này sinh từ `supabase/grammar/*.json` bằng `npm run seed:grammar`; sửa nội dung trong app sẽ ghi thẳng vào bảng `grammar_topics`.
4. Lấy key ở **Project Settings → API**: dùng **publishable key** (`sb_publishable_…`, khuyến nghị) hoặc legacy `anon` key — cả hai đã được kiểm chứng hoạt động với app này.
5. **Authentication → Providers → Email**: tắt *Enable email confirmations* nếu không muốn xác nhận email (tiện khi dùng cá nhân), hoặc để bật và xác nhận qua mail.
6. Chỉ dùng public key ở frontend. Không bao giờ đưa `service_role key` vào code hay biến `VITE_*`.

Nếu build thiếu biến môi trường, app hiện màn hình hướng dẫn thay vì trắng trang.

### Máy chấm AI (chế độ Viết câu)

Chế độ **Viết câu** gọi Edge Function `grade-writing` (`supabase/functions/grade-writing/index.ts`), function này gọi một endpoint chat completions **tương thích OpenAI** (OpenAI, OpenRouter, Groq, DeepSeek, Together…). Khóa API nằm ở server, **không** đưa vào bundle frontend.

Đặt secret trong **Project Settings → Edge Functions → Secrets** (hoặc `supabase secrets set`):

| Secret | Bắt buộc | Mặc định | Ý nghĩa |
|---|---|---|---|
| `AI_API_KEY` | ✅ | — | khóa API của nhà cung cấp |
| `AI_BASE_URL` | — | `https://api.deepseek.com` | đổi sang nhà cung cấp khác |
| `AI_MODEL` | — | `deepseek-chat` | model dùng để chấm |

Project này dùng **DeepSeek** nên chỉ cần thêm `AI_API_KEY` là chạy. Muốn đổi nhà cung cấp khác (OpenAI, OpenRouter, Groq, Together… đều tương thích OpenAI) thì set thêm `AI_BASE_URL` + `AI_MODEL`, ví dụ OpenAI: `AI_BASE_URL=https://api.openai.com/v1`, `AI_MODEL=gpt-4o-mini`.

Deploy function (chọn một cách):

```bash
supabase functions deploy grade-writing            # cần Supabase CLI
```

hoặc dùng Supabase MCP `deploy_edge_function` (file `supabase/functions/grade-writing/index.ts`, `verify_jwt: true`).

Function **tự chặn** request không có phiên đăng nhập (401), vì khóa publishable nằm công khai trong bundle — nếu không chặn thì bất kỳ ai cũng gọi được và đốt credit AI. Thiếu `AI_API_KEY`, function trả lỗi rõ ràng và màn Viết câu hiện banner tương ứng (không có chấm giả).

> Supabase MCP đã khai báo trong `.omp/mcp.json` (project-scoped). Auth lần đầu: `/mcp reload` → `/mcp list` →
> omp tự mở browser để OAuth → `/mcp reauth supabase` khi cần đổi account. Credential nằm trong profile
> (`~/.omp/agent/agent.db`), không nằm trong file config nên commit `.omp/mcp.json` là an toàn.

## 2. Scripts

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck (`tsc -b`) + build ra `dist/` |
| `npm run preview` | Xem thử bản build |
| `npm run seed:grammar` | Gộp `supabase/grammar/*.json` → `supabase/grammar-seed.sql` (validate 3 ví dụ + 3 bài tập/chủ đề) |
| `npm run lint` | oxlint |

## 3. Deploy lên GitHub Pages

1. Push repo lên GitHub (nhánh `main`).
2. **Settings → Secrets and variables → Actions**: thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
3. **Settings → Pages → Source**: chọn **GitHub Actions**.
4. Chạy workflow `Deploy to GitHub Pages` (tự chạy khi push `main`, hoặc bấm *Run workflow*).
5. **Supabase → Authentication → URL Configuration**: thêm URL Pages (`https://<user>.github.io/<repo>/`) vào *Site URL* và *Redirect URLs*.

`base` của Vite lấy từ biến `BASE_PATH` do `actions/configure-pages` cung cấp, nên không cần hardcode tên repo. Khi preview bản build có sub-path:

```bash
BASE_PATH=/super-vocab/ npm run build && npm run preview
```

Router dùng `HashRouter` nên reload ở route con (`#/vocab`) vẫn hoạt động trên Pages.

## 4. Kiểm tra RLS

Policy `own cards` là `for all to authenticated using ((select auth.uid()) = user_id)` — user chỉ thấy card của mình, khách chưa đăng nhập không thấy gì. Kiểm tra bằng curl:

```bash
# 1) không kèm token → phải []
curl "$URL/rest/v1/cards?select=*" -H "apikey: $KEY"

# 2) không kèm token, thử ghi → phải 401, mã 42501
curl -X POST "$URL/rest/v1/cards" -H "apikey: $KEY" -H 'content-type: application/json' -d '{"word":"x","meaning":"y"}'

# 3) kèm token user B, thử đọc/sửa card của user A → phải [] (0 row)
curl "$URL/rest/v1/cards?select=*" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN_B"
```

Nếu (1) trả về dữ liệu thì RLS chưa bật — kiểm tra lại `alter table ... enable row level security`.

Bảng `collections` cũng có policy riêng (`own collections`). Kiểm tra thêm: user B đọc/sửa/xóa bộ từ của user A ⇒ `[]` / `[]` / `204` nhưng 0 row; và B gắn từ vào bộ của A ⇒ `409` với mã `23503` (FK tổ hợp `(collection_id, user_id)`).

## 5. Cách dùng

- **Menu & khung trang:** menu dọc bên trái (Từ vựng · Ôn tập · tài khoản), bấm **Ẩn menu** để thu gọn — trạng thái được nhớ. Dưới 768px menu thành drawer mở bằng nút **Menu** (đóng bằng `Esc`, bấm nền, hoặc khi chuyển trang). Có **linh vật** ở góc dưới phải (nhìn theo con trỏ, bấm để nó phản ứng) — chỉ hiện khi màn đủ rộng để không đè lên nội dung.
- **Bộ từ (collection):** mỗi bộ chứa nhiều từ. Chip “Bộ từ:” có ở cả trang thêm từ, trang danh sách và các chế độ ôn; nút **＋ Quản lý bộ từ** (trang thêm từ và trang danh sách) để tạo / đổi tên / xóa. Tên bộ không được trùng nhau (không phân biệt hoa/thường). Xóa bộ **không xóa từ** — các từ rơi về “Chưa phân loại” (`on delete set null`).
- **Thêm từ (`#/vocab`):** form thêm từ (từ, nghĩa, phát âm, ví dụ, ghi chú, bộ từ). Chọn bộ ở dải chip vừa để lọc vừa **đặt bộ mặc định cho từ mới** (form tự xoá sau mỗi lần thêm, giữ nguyên bộ đang chọn). Từ mới mặc định đến hạn ngay (`due = now()`). Chặn thêm trùng từ (không phân biệt hoa/thường). Sau khi thêm có dòng `Đã thêm {từ}. Xem trong danh sách`.
- **Danh sách từ vựng (`#/vocab/list`):** lọc theo bộ + tìm kiếm client-side theo từ/nghĩa, **phân trang 50 mục/trang** (số trang + `Trước`/`Sau`, chỗ nhảy có `…`, hiện `1–50 trong N từ`), sửa qua modal (đổi được cả bộ từ), xóa có xác nhận.
- **Ngữ pháp (`#/grammar`):** 49 chủ đề nhóm theo 5 giai đoạn. Lọc theo trạng thái (**Đến hạn · Chưa học · Đang học · Cần ôn · Đã nắm**), tìm theo tên/tóm tắt. Mỗi dòng hiện tên, trạng thái, **ngày học gần nhất**, **ngày ôn tiếp** (nền `highlighter` khi quá hạn) và mức nắm 1–5; nút **Đã ôn** ghi ngày hôm nay và tự tính lịch mới.
- **Chi tiết ngữ pháp (`#/grammar/:slug`):** bài học (Markdown-lite), 3 ví dụ, **3 bài tập trắc nghiệm** chấm ngay kèm giải thích. Cột/bảng **Tiến độ** cho chọn trạng thái, mức nắm 1–5, và hai ô **date picker** cho `Ngày học gần nhất` và `Ôn tiếp` (không phải select); nút **Đã ôn hôm nay** tăng số lần ôn và đặt lịch. Nút **Sửa nội dung** mở form sửa tiêu đề, tóm tắt, bài học, ví dụ và 3 bài tập — nội dung dùng chung cho mọi tài khoản.
- **Quy tắc lịch ngữ pháp:** Đang học → ôn sau 1 ngày; Cần ôn → sau 3 ngày; Đã nắm → sau 7 ngày (học lại nếu thật sự cần). Đổi trạng thái đặt lại ngày ôn tiếp; ngày vẫn sửa tay được bằng date picker.
- **Ôn tập (`#/practice`):** chọn bộ ở chip trên cùng, rồi chọn chế độ. Bộ đang chọn được nhớ trong `localStorage`, **dùng chung cho cả hai chế độ**. Phiên ôn chỉ gồm từ trong bộ đó, lấy tối đa 30 card có `due <= now()` sắp theo `due` tăng dần.
- **Chế độ Flashcard (`#/practice/flashcard`):** lật thẻ để xem nghĩa, chấm **Again / Hard / Good / Easy** (phím `1`–`4`, `Space` để lật). Mỗi nút hiện khoảng thời gian ôn lại thật, lấy từ chính kết quả FSRS dùng để ghi DB.
- **Chế độ Viết câu (`#/practice/writing`):** hiện từ, phiên âm, nghĩa, khái niệm; bạn viết một câu tiếng Anh có dùng từ đó rồi bấm **Chấm điểm** (`⌘/Ctrl + Enter`). AI trả về điểm 0–100, nhận xét, danh sách lỗi (loại lỗi · đoạn sai · giải thích · cách sửa), **câu đúng** đã sửa, vài câu mẫu khác và một mẹo. Sau khi chấm, bạn chấm mức độ nhớ **Again / Hard / Good / Easy** (`1`–`4`) y như flashcard — mỗi nút hiện khoảng thời gian ôn lại thật và lượt chấm ghi lịch FSRS; nút **Từ tiếp theo** bỏ qua mà không ghi lịch. Có thể **Viết lại** để viết lại chính từ đó.
- Nếu ghi DB lỗi, card không bị chuyển và bạn chấm lại được.
- Khi hết card đến hạn: hiện "Hôm nay đã xong" kèm bộ đang ôn, số từ và thời điểm đến hạn gần nhất **trong bộ đó**.

### Cấp tài khoản mới

App không có màn đăng ký (đã bỏ) — chỉ tài khoản do bạn tạo mới vào được:

1. Dashboard → **Authentication → Users → Add user**: nhập email + password, tick *Auto Confirm User*.
2. Hoặc qua SQL (đã dùng để tạo `owner@super-vocab.invalid`): insert vào `auth.users` với `email_confirmed_at = now()` và `crypt(password, gen_salt('bf'))`, kèm 1 row trong `auth.identities`.
3. Nên tắt hẳn signup: **Authentication → Sign In / Providers → Email → Enable email signups = off**. Kiểm tra bằng
   `curl "$VITE_SUPABASE_URL/auth/v1/settings" -H "apikey: $KEY"` → `disable_signup: true`.
   Bật thêm **Leaked password protection** ([doc](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)) — hiện advisor đang cảnh báo mục này.

## 6. Cấu trúc

```
src/
├── main.tsx / App.tsx          # Router + AuthProvider + route guard
├── lib/
│   ├── supabase.ts             # client (đọc env, cảnh báo khi thiếu config)
│   ├── collections.ts          # scope chip + CRUD bộ từ
│   ├── practice.ts             # nạp phiên ôn (thẻ đến hạn) + đếm thẻ đến hạn
│   ├── writing.ts              # gọi edge function grade-writing, chuẩn hoá kết quả chấm
│   ├── fsrs.ts                 # map row ⇄ Card của ts-fsrs, lịch 4 mức chấm
│   ├── format.ts               # format ngày giờ, khoảng thời gian, nhãn trạng thái
│   ├── grammar.ts              # trạng thái/mức nắm, lịch ôn 1/3/7 ngày, so sánh ngày
│   └── types.ts                # kiểu CardRow / CollectionRow / Grammar*
├── hooks/
│   ├── AuthProvider.tsx        # subscribe session Supabase, expose signIn/signOut
│   ├── useAuth.ts              # context + hook useAuth()
│   ├── useCollections.ts       # nạp danh sách bộ từ
│   ├── useCards.ts             # nạp toàn bộ từ (dùng chung 2 trang từ vựng)
│   ├── useGrammar.ts           # nạp chủ đề + tiến độ, lưu tiến độ/nội dung
│   └── useCollectionScope.ts   # scope bộ từ dùng chung giữa các chế độ ôn
├── components/                 # AppShell, Breadcrumb, Modal, CollectionBar, VocabForm, FlashCard, GrammarProgressPanel, GrammarExercises, GrammarTopicEditor, …
├── assets/mascot/              # knight-directions.webp + knight-reactions.webp (2 sheet 3×3 của page-mascot)
└── pages/                      # LoginPage, VocabPage, VocabListPage, GrammarListPage, GrammarDetailPage, PracticePage, FlashcardPage, WritingPage
supabase/schema.sql             # collections + cards + grammar_* + index + RLS
supabase/grammar/*.json         # nội dung nguồn 49 chủ đề (5 giai đoạn)
supabase/grammar-seed.sql       # SQL upsert sinh từ JSON bằng npm run seed:grammar
supabase/functions/grade-writing/index.ts  # edge function chấm câu bằng AI
scripts/build-grammar-seed.mjs  # gộp JSON + validate (3 ví dụ, 3 bài tập) → seed SQL
.github/workflows/deploy.yml    # build → GitHub Pages
```

## 7. Ghi chú kỹ thuật

- `due` luôn lưu/so sánh bằng UTC (`timestamptz`), hiển thị theo giờ máy.
- Cột `learning_steps` được thêm so với bản thiết kế ban đầu vì `Card` của ts-fsrs v5 cần trường này.
- Cột `state`: 0 New, 1 Learning, 2 Review, 3 Relearning (khớp enum `State` của ts-fsrs).
- `cards.collection_id` là FK tổ hợp `(collection_id, user_id) → collections (id, user_id)` với `on delete set null (collection_id)`: RLS không bảo vệ được FK, nên ràng buộc này chặn việc gắn từ vào bộ của user khác.
- Ngữ pháp tách hai tầng: `grammar_topics` là nội dung dùng chung (mọi user đã đăng nhập đọc/sửa được), `grammar_progress` là tiến độ riêng từng user (RLS `own grammar progress`, unique `(user_id, topic_id)`).
- `last_studied_on` / `next_review_on` là cột `date` dạng `YYYY-MM-DD` (đúng ngữ nghĩa lịch chọn ngày), không phải `timestamptz`; so sánh với ngày hôm nay theo giờ máy. `reviewed_at` mới là `timestamptz`.
- Quy tắc lịch: `learning` +1 ngày, `needs_review` +3 ngày, `mastered` +7 ngày, `not_started` chưa đặt lịch. `reviewedPatch` là nguồn duy nhất cho nút **Đã ôn**; `statusPatch`/`nextReviewFor` dùng khi đổi trạng thái, nên lịch trong DB luôn khớp nhãn hiển thị.
- Supabase free tier tự pause sau ~1 tuần không hoạt động; vào dashboard bấm *Resume*.
- Chế độ Viết câu **không lưu lịch sử chấm**: điểm và lỗi chỉ hiện trong phiên rồi mất (chỉ lịch FSRS của card được ghi, giống flashcard). Lưu lịch sử chấm cần thêm bảng (ngoài phạm vi hiện tại).
- `grade-writing` yêu cầu JWT hợp lệ (kiểm tra cả ở gateway và trong function): chỉ người đã đăng nhập gọi được, tránh lộ endpoint công khai và đốt credit AI.

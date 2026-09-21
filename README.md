# Super Vocab

Web học từ vựng cá nhân: lưu từ và ôn bằng flashcard theo thuật toán spaced repetition (FSRS).

- **3 trang:** Login (`#/login`) · Quản lý từ vựng (`#/vocab`) · Ôn tập (`#/practice`)
- **Bộ từ (collection):** gom từ theo chủ đề; phiên ôn tập chỉ gồm từ trong bộ đang chọn
- **Stack:** Vite + React + TypeScript · Tailwind CSS · react-router-dom (HashRouter) · Supabase (DB + Auth) · ts-fsrs

## 1. Cài đặt

```bash
npm install
cp .env.example .env.local   # rồi điền Supabase URL + public key (publishable hoặc anon)
npm run dev
```

### Backend Supabase

Project `qqtpselvrnkfcahdarbn` **đã được cấu hình sẵn**: bảng `cards` + 2 index + RLS (`own cards`) đã được apply qua MCP, security/performance advisors không còn cảnh báo. Việc còn lại chỉ là điền key vào `.env.local`.

Nếu dựng project khác:

1. Tạo project tại [supabase.com](https://supabase.com).
2. Chạy `supabase/schema.sql` (SQL Editor, hoặc `apply_migration` qua Supabase MCP). File này tạo bảng `cards`, index và **bật RLS** (mỗi user chỉ đọc/ghi được card của mình).
3. Lấy key ở **Project Settings → API**: dùng **publishable key** (`sb_publishable_…`, khuyến nghị) hoặc legacy `anon` key — cả hai đã được kiểm chứng hoạt động với app này.
4. **Authentication → Providers → Email**: tắt *Enable email confirmations* nếu không muốn xác nhận email (tiện khi dùng cá nhân), hoặc để bật và xác nhận qua mail.
5. Chỉ dùng public key ở frontend. Không bao giờ đưa `service_role key` vào code hay biến `VITE_*`.

Nếu build thiếu biến môi trường, app hiện màn hình hướng dẫn thay vì trắng trang.

> Supabase MCP đã khai báo trong `.omp/mcp.json` (project-scoped). Auth lần đầu: `/mcp reload` → `/mcp list` →
> omp tự mở browser để OAuth → `/mcp reauth supabase` khi cần đổi account. Credential nằm trong profile
> (`~/.omp/agent/agent.db`), không nằm trong file config nên commit `.omp/mcp.json` là an toàn.

## 2. Scripts

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck (`tsc -b`) + build ra `dist/` |
| `npm run preview` | Xem thử bản build |
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

- **Bộ từ (collection):** mỗi bộ chứa nhiều từ. Chip “Bộ từ:” ở cả 2 trang để lọc; nút **＋ Quản lý bộ từ** (trang Từ vựng) để tạo / đổi tên / xóa. Tên bộ không được trùng nhau (không phân biệt hoa/thường). Xóa bộ **không xóa từ** — các từ rơi về “Chưa phân loại” (`on delete set null`).
- **Từ vựng:** form thêm từ (từ, nghĩa, ví dụ, ghi chú, bộ từ), tìm kiếm client-side theo từ/nghĩa, sửa qua modal (đổi được cả bộ từ), xóa có xác nhận. Từ mới mặc định vào bộ đang xem và đến hạn ngay (`due = now()`). Chặn thêm trùng từ (không phân biệt hoa/thường).
- **Ôn tập:** chọn bộ ở chip trên cùng — phiên ôn **chỉ gồm các từ trong bộ đó** (“Tất cả”, “Chưa phân loại”, hoặc từng bộ). Bộ đang chọn được nhớ trong `localStorage`, reload vẫn giữ. Lấy tối đa 30 card có `due <= now()`, sắp theo `due` tăng dần. Lật thẻ để xem nghĩa, chấm **Again / Hard / Good / Easy** (phím `1`–`4`, `Space` để lật). Mỗi nút hiện khoảng thời gian ôn lại thật, lấy từ chính kết quả FSRS dùng để ghi DB.
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
│   ├── fsrs.ts                 # map row ⇄ Card của ts-fsrs, lịch 4 mức chấm
│   ├── format.ts               # format ngày giờ, khoảng thời gian, nhãn trạng thái
│   └── types.ts                # kiểu CardRow / CollectionRow / CardInput / CardUpdate
├── hooks/
│   ├── AuthProvider.tsx        # subscribe session Supabase, expose signIn/signOut
│   ├── useAuth.ts              # context + hook useAuth()
│   └── useCollections.ts       # nạp danh sách bộ từ
├── components/                 # Navbar, Modal, CollectionBar, VocabForm, VocabTable, FlashCard, …
└── pages/                      # LoginPage, VocabPage, PracticePage
supabase/schema.sql             # collections + cards + index + RLS
.github/workflows/deploy.yml    # build → GitHub Pages
```

## 7. Ghi chú kỹ thuật

- `due` luôn lưu/so sánh bằng UTC (`timestamptz`), hiển thị theo giờ máy.
- Cột `learning_steps` được thêm so với bản thiết kế ban đầu vì `Card` của ts-fsrs v5 cần trường này.
- Cột `state`: 0 New, 1 Learning, 2 Review, 3 Relearning (khớp enum `State` của ts-fsrs).
- `cards.collection_id` là FK tổ hợp `(collection_id, user_id) → collections (id, user_id)` với `on delete set null (collection_id)`: RLS không bảo vệ được FK, nên ràng buộc này chặn việc gắn từ vào bộ của user khác.
- Supabase free tier tự pause sau ~1 tuần không hoạt động; vào dashboard bấm *Resume*.

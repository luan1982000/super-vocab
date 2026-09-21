# Plan: Web học từ vựng cá nhân (Spaced Repetition)

## 1. Mục tiêu

Web cá nhân để lưu từ vựng và ôn tập bằng flashcard theo thuật toán spaced repetition.

**3 trang chính**

| Trang | Route | Chức năng |
|---|---|---|
| Login | `/#/login` | Đăng nhập / đăng ký bằng Supabase Auth |
| Manage Vocabulary | `/#/vocab` | Thêm, sửa, xóa, tìm kiếm từ vựng |
| Practice | `/#/practice` | Hiện card cần ôn, lật card, chấm mức độ nhớ |

**Ngoài phạm vi (làm sau nếu muốn):** import/export CSV, thống kê chi tiết, phát âm TTS, PWA/offline.

## 2. Tech stack

- **Frontend:** Vite + React (TypeScript)
- **Router:** `react-router-dom` dùng `HashRouter` (GitHub Pages không hỗ trợ SPA fallback)
- **Backend/DB/Auth:** Supabase (`@supabase/supabase-js`)
- **Spaced repetition:** `ts-fsrs` (thuật toán FSRS)
- **UI:** Tailwind CSS
- **Hosting:** GitHub Pages + GitHub Actions

## 3. Cấu trúc thư mục

```
vocab-app/
├── .github/workflows/deploy.yml
├── src/
│   ├── main.tsx
│   ├── App.tsx                # Router + route guard
│   ├── lib/
│   │   ├── supabase.ts        # Khởi tạo client
│   │   └── fsrs.ts            # Wrapper ts-fsrs
│   ├── hooks/
│   │   └── useAuth.ts         # Session + user hiện tại
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── Navbar.tsx
│   │   ├── VocabForm.tsx
│   │   ├── VocabTable.tsx
│   │   └── FlashCard.tsx
│   └── pages/
│       ├── LoginPage.tsx
│       ├── VocabPage.tsx
│       └── PracticePage.tsx
├── .env.example
├── vite.config.ts             # base: '/ten-repo/'
└── package.json
```

## 4. Database (Supabase)

### Bảng `cards`

```sql
create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  word text not null,
  meaning text not null,
  example text,
  note text,
  -- trường FSRS
  due timestamptz not null default now(),
  stability real not null default 0,
  difficulty real not null default 0,
  elapsed_days int not null default 0,
  scheduled_days int not null default 0,
  reps int not null default 0,
  lapses int not null default 0,
  state smallint not null default 0,   -- 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review timestamptz,
  created_at timestamptz not null default now()
);

create index cards_user_due_idx on cards (user_id, due);
```

### Bảo mật (bắt buộc)

```sql
alter table cards enable row level security;

create policy "own cards" on cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Quy tắc:**
- Chỉ dùng `anon key` ở frontend, không bao giờ để `service_role key` vào code.
- Không commit file `.env`. Key đặt trong GitHub Secrets rồi inject lúc build.
- Nếu chỉ dùng cá nhân: tắt "Enable email signups" trong Supabase sau khi tạo tài khoản của mình.

## 5. Chi tiết từng trang

### 5.1. Login (`/#/login`)

- Form email + password, nút Đăng nhập / Đăng ký (chuyển tab).
- Gọi `supabase.auth.signInWithPassword` / `signUp`.
- Có thể thêm đăng nhập Google (tùy chọn).
- Đăng nhập thành công → chuyển sang `/#/vocab`.
- Đã đăng nhập mà vào `/login` → tự chuyển sang `/vocab`.
- Hiển thị lỗi rõ ràng (sai mật khẩu, email chưa xác nhận).

### 5.2. Manage Vocabulary (`/#/vocab`)

- **Thêm từ:** form gồm `word`, `meaning`, `example`, `note`.
- **Danh sách:** bảng hiển thị từ, nghĩa, ngày ôn tiếp theo (`due`), trạng thái.
- **Sửa / Xóa:** sửa inline hoặc modal, xóa có xác nhận.
- **Tìm kiếm:** lọc theo `word` / `meaning` (client-side là đủ khi dữ liệu nhỏ).
- **Phân trang** hoặc infinite scroll nếu danh sách dài (>200 từ).
- Kiểm tra trùng từ trước khi thêm.

### 5.3. Practice (`/#/practice`)

- Lấy các card cần ôn: `due <= now()`, sắp xếp theo `due`, giới hạn 20–50 card mỗi phiên.
- **Luồng một card:**
  1. Hiện mặt trước (`word`).
  2. Bấm / nhấn Space để lật → hiện `meaning`, `example`.
  3. Chấm 4 mức: **Again / Hard / Good / Easy**.
  4. `ts-fsrs` tính lịch mới → `update` card trong Supabase → sang card tiếp theo.
- Hiển thị tiến độ (ví dụ 5/20) và màn hình tổng kết khi hết card.
- Khi không còn card đến hạn: hiện "Hôm nay đã xong" và số card sẽ đến hạn tiếp theo.
- **Phím tắt:** `Space` lật card, `1/2/3/4` chấm điểm.
- Hiển thị gợi ý thời gian ôn lại dưới mỗi nút chấm (ví dụ Good → 3 ngày).

## 6. Lộ trình thực hiện

### Phase 0: Chuẩn bị (~1 giờ)
- [ ] Tạo project Supabase, lấy `URL` và `anon key`.
- [ ] Chạy SQL tạo bảng `cards` + RLS trong SQL Editor.
- [ ] Tạo repo GitHub.
- [ ] `npm create vite@latest vocab-app -- --template react-ts`
- [ ] Cài lib: `@supabase/supabase-js react-router-dom ts-fsrs tailwindcss`
- [ ] Tạo `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) và `.env.example`.

### Phase 1: Auth + khung app (~2 giờ)
- [ ] `lib/supabase.ts`, `hooks/useAuth.ts`.
- [ ] `HashRouter` + `ProtectedRoute` + `Navbar`.
- [ ] `LoginPage` (đăng nhập, đăng ký, đăng xuất).

### Phase 2: Manage Vocabulary (~3 giờ)
- [ ] Form thêm từ, danh sách, sửa, xóa.
- [ ] Tìm kiếm + kiểm tra trùng.
- [ ] Xử lý loading / error state.

### Phase 3: Practice (~4 giờ)
- [ ] `lib/fsrs.ts` (map giữa row DB và object `Card` của `ts-fsrs`).
- [ ] Query card đến hạn, `FlashCard` có hiệu ứng lật.
- [ ] Chấm điểm → cập nhật DB → card kế tiếp.
- [ ] Màn hình tổng kết + phím tắt.

### Phase 4: Deploy (~1 giờ)
- [ ] `vite.config.ts`: `base: '/ten-repo/'`.
- [ ] Thêm secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` vào GitHub repo.
- [ ] Workflow `deploy.yml` (build → upload `dist/` → deploy Pages).
- [ ] Settings → Pages → Source: GitHub Actions.
- [ ] Trong Supabase → Authentication → URL Configuration: thêm URL của GitHub Pages vào Site URL / Redirect URLs.

### Phase 5: Hoàn thiện (tùy chọn)
- [ ] Responsive cho mobile (dùng nhiều để ôn từ trên điện thoại).
- [ ] Dark mode.
- [ ] Import/export CSV.
- [ ] Trang thống kê (số từ, số card ôn mỗi ngày, streak).
- [ ] Phát âm bằng Web Speech API.

## 7. Rủi ro và lưu ý

| Vấn đề | Cách xử lý |
|---|---|
| Quên bật RLS → lộ dữ liệu | Kiểm tra bằng cách gọi API khi chưa đăng nhập, phải trả về rỗng |
| Reload ở route con bị 404 trên GitHub Pages | Dùng `HashRouter` |
| CSS/JS 404 sau deploy | Kiểm tra `base` trong `vite.config.ts` trùng tên repo |
| Supabase free tier tự pause sau 1 tuần không hoạt động | Dùng đều đặn hoặc vào dashboard bấm resume |
| Lỗi mạng làm mất kết quả chấm điểm | Hiện lỗi và cho thử lại, không chuyển card khi update thất bại |
| Múi giờ khi so sánh `due` | Luôn lưu và so sánh bằng UTC (`timestamptz`) |

## 8. Tiêu chí hoàn thành (MVP)

- [ ] Đăng ký, đăng nhập, đăng xuất hoạt động.
- [ ] Thêm, sửa, xóa từ; dữ liệu lưu trên Supabase và chỉ mình xem được.
- [ ] Practice hiện đúng card đến hạn, chấm điểm xong lịch ôn được cập nhật.
- [ ] Deploy thành công lên GitHub Pages, dùng được trên điện thoại.

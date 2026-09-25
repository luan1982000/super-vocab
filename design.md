# Design — Super Vocab

> Bản thiết kế để code theo. Thay thế bản "hộp thẻ giấy" trước đó.
> Mọi con số contrast trong file này đã được đo, không phải ước lượng.
> Token nằm ở `src/index.css`; thành phần dùng chung ở `@layer components` cùng file.

---

## 1. Đối tượng, người dùng, việc chính

**Sản phẩm:** web cá nhân ghi từ vựng và ôn theo lịch FSRS. Một người dùng duy nhất (chủ tài khoản), tự cấp tài khoản cho người khác nếu muốn.

**Người dùng:** một người Việt đang học từ (IELTS/TOEIC/giao tiếp), ôn theo phiên ngắn 5–10 phút, **chủ yếu trên điện thoại**, thường buổi tối hoặc lúc chờ. Họ không cần gamification; họ cần ghi từ nhanh, ôn nhanh đúng lịch, và luôn biết mình đang ở bộ từ nào.

**Ba việc, theo thứ tự quan trọng:**

1. Ôn hết số thẻ đến hạn của hôm nay, không bị phân tâm.
2. Ghi một từ mới vào đúng bộ trong vài giây.
3. Nhìn ra ngay: từ này thuộc bộ nào, lần tới ôn khi nào.

**Một câu định vị:** *web này đọc như một trang sách được sắp chữ tốt — một màu nhấn, đường kẻ tóc, và chữ làm hết việc.*

---

## 2. Hướng thị giác

**Tối giản + thanh lịch, lấy ngữ pháp của sắp chữ editorial/Swiss.** Không dùng ẩn dụ vật liệu (không còn "tai ngăn", "thẻ chồng", "dạ quang").

Nguồn: skill `ui-ux-pro-max` (đã cài ở `.omp/plugins/`).

| Truy vấn | Cho ra |
|---|---|
| `--design-system "english learning platform minimalist elegant editorial" --variance 2 --motion 2 --density 3` | style `Minimalism & Swiss Style`, dials variance 2 / motion 2 / density 3, motion preset `Scroll Reveal (Subtle)` |
| `--domain style "editorial magazine elegant typographic"` | `editorial-grid-magazine`, `exaggerated-minimalism` — lấy phần typography, bỏ phần asymmetric grid |
| `--domain typography`, `--domain color` | xác nhận cặp serif+sans và palette trung tính; **palette mặc định của skill (tím `#7C3AED` / nền `#FAF5FF`) bị loại** — xem §10 |
| `--domain ux "reading line length typography measure"` | `max-w-prose` 65–75ch cho dòng đọc, `leading 1.5–1.75`, `text-wrap: balance` cho heading ngắn, contrast chữ ≥4.5:1 |

Năm quyết định lớn rút ra:

1. **Không có bóng đổ.** Một ngoại lệ: modal (§6).
2. **Đúng một màu nhấn** (`accent`), dùng cho hành động chính, focus, gạch chân mục đang xem, chấm nhận diện bộ từ, và con số quan trọng.
3. **Hai bán kính theo vai trò**: `--radius-ui` 8px cho control (nút, ô nhập, chip), `--radius-card` 12px cho bề mặt (panel, modal, thẻ ôn); badge nhỏ dùng `rounded-full`.
4. **Icon là bạn đồng hành của chữ, không bao giờ thay chữ** — mọi icon `aria-hidden`, nhãn vẫn là chữ tiếng Việt (§6.1).
5. **Thứ bậc đến từ cỡ chữ, độ đậm, màu và đường kẻ** — không từ chữ in hoa (§10).

---

## 3. Bảng màu — "Giấy ngà & mực xanh rêu"

Không dùng palette mặc định của Tailwind (`slate/indigo/rose/amber/emerald/sky`), cũng không dùng palette mặc định của skill (tím AI).

### 3.1. Chế độ sáng

| Token | Hex | Dùng cho | Contrast đo được |
|---|---|---|---|
| `paper` | `#FAF9F6` | nền trang — trắng ngả ấm, không phải kem vàng | ink/paper **16.69:1** |
| `card` | `#FFFFFF` | mặt tấm, ô nhập | ink/card **17.57:1** |
| `ink` | `#1A1917` | chữ chính, mực gần đen ngả ấm | — |
| `ink-soft` | `#6B6760` | chữ phụ, nhãn, dòng meta | /paper **5.34:1** · /card **5.62:1** |
| `rule` | `#E7E4DE` | đường kẻ tóc (thuần trang trí) | 1.27:1 — **không bao giờ** là ranh giới duy nhất của một control |
| `line-strong` | `#969087` | viền ô nhập, viền nút phụ, track tiến độ | /card **3.16:1** · /paper **3.01:1** |

### 3.2. Màu chức năng

| Token | Hex | Nghĩa | Contrast trên `card` |
|---|---|---|---|
| `accent` | `#1F4739` | hành động chính, focus, mục đang xem, số khoảng cách ôn | **10.40:1** |
| `accent-hover` | `#163329` | nền nút chính khi hover | — |
| `on-accent` | `#FFFFFF` | chữ trên nền `accent` | **10.40:1** |
| `warn` | `#8A6A2F` | mức "Khó", trạng thái "Đang học" | **5.02:1** |
| `cool` | `#2F5A6B` | mức "Dễ" | **7.51:1** |
| `danger` | `#8F2F2A` | mức "Lại", lỗi, xoá | **8.05:1** |
| `on-danger` | `#FFFFFF` | chữ trên nền `danger` | **8.05:1** |
| `highlighter` | `#F0E4BE` | **chỉ** mốc "quá hạn" | highlighter-ink/highlighter **13.84:1** |
| `hover` | `rgba(26,25,23,.05)` | nền khi hover của nút phụ / ô chấm | — |
| `scrim` | `rgba(26,25,23,.40)` | lớp phủ sau modal | — |
| `shadow-modal` | `0 24px 48px -12px rgba(26,25,23,.18)` | bóng duy nhất trong app | — |

`highlighter` là chỗ duy nhất được phép "sáng": một nét bút dạ quang thật sau mốc quá hạn. Không dùng cho nút, tiêu đề, hay nhấn mạnh chung.

### 3.3. Chấm nhận diện bộ từ

6 tông thuốc nhuộm tự nhiên, gán theo `hash(collection.id) % 6` → ổn định, đổi tên bộ không đổi màu, hai bộ cạnh nhau hiếm khi trùng.

| Token | Hex | Token | Hex |
|---|---|---|---|
| `tab-rose` | `#C9A3A0` | `tab-slate` | `#9AA8BD` |
| `tab-ochre` | `#C6A96B` | `tab-mauve` | `#B3A0C0` |
| `tab-sage` | `#9DB3A0` | `tab-clay` | `#C7A18C` |

**Chỉ dùng làm chấm tròn 10px** cạnh tên bộ. Không bao giờ đặt chữ lên trên, không dùng làm nền, không dùng làm viền. Vì vậy không cần đo contrast chữ trên tông.

Bộ "Chưa phân loại" không có màu: chấm rỗng, viền nét đứt `line-strong`.

### 3.4. Chế độ tối — "mực đêm"

Nền là mực xanh ngả đen (không dùng đen trung tính `#0B0B0B`, không dùng accent xanh chua).

| Token | Hex | Contrast đo được |
|---|---|---|
| `paper` | `#101210` | ink/paper **15.64:1** |
| `card` | `#191C1A` | ink/card **14.28:1** |
| `ink` | `#ECEAE4` | — |
| `ink-soft` | `#9C9A93` | /paper **6.68:1** · /card **6.10:1** |
| `rule` | `#2A2E2B` | 1.25:1 — trang trí |
| `line-strong` | `#626864` | /card **3.01:1** · /paper **3.30:1** |
| `accent` | `#86BFA6` | **8.19:1** |
| `accent-hover` | `#9CCFB8` | — |
| `on-accent` | `#0E1512` | 8.83:1 |
| `warn` | `#D9B36A` | **8.68:1** |
| `cool` | `#8FB8C9` | **8.07:1** |
| `danger` | `#E39A93` | **7.62:1** |
| `on-danger` | `#1A0F0E` | — |
| `highlighter` | `#E8DBA0` | 13.18:1 với `highlighter-ink` `#14150F` |
| `scrim` | `rgba(0,0,0,.60)` | — |

Chế độ tối theo `prefers-color-scheme`, cùng cấu trúc, chỉ đổi vật liệu.

**`scrim` phải là token riêng, không được dùng `--ink`/`.4`.** `--ink` đảo sang gần trắng ở chế độ tối, nên `bg-ink/40` làm nền *sáng lên* thay vì tối đi — lỗi có thật, đã sửa (§11).

---

## 4. Chữ

Hai family, phân vai rõ, **đều đã có sẵn trong `package.json`** (không thêm phụ thuộc, không gọi CDN):

| Vai | Family | Vì sao |
|---|---|---|
| Nội dung tiếng Anh (headword, câu ví dụ) + tiêu đề | **Literata** (`font-serif`) | serif đọc sách; headword là *chữ được tra*, không phải nhãn giao diện |
| Toàn bộ phần còn lại (UI, nghĩa, form, bảng, nhãn) | **Be Vietnam Pro** (`font-sans`, mặc định) | sans do người Việt thiết kế, dấu tiếng Việt được vẽ riêng |

### 4.1. Thang chữ

| Vai | Size / line-height | Weight | Family |
|---|---|---|---|
| Headword trên thẻ ôn | `clamp(2.5rem, 9vw, 4rem)` / 1.1, `tracking -0.02em` | 500 | Literata |
| Tiêu đề trang (h1) | `1.375rem` / 1.3, `tracking -0.01em` | 400 | Literata |
| Wordmark màn đăng nhập | `1.75rem` / 1.1, `tracking -0.015em` | 400 | Literata |
| Headword trong sổ từ | `1.0625rem` / 1.4 | 400 | Literata |
| Nghĩa trên thẻ | `1.25rem` / 1.45 | 500 | Be Vietnam Pro |
| Câu ví dụ | `1.0625rem` / 1.7, tối đa `46ch` | 400 | Literata |
| Nội dung, form, bảng | `1rem` / 1.5–1.6 | 400 | Be Vietnam Pro |
| Nghĩa trong sổ từ | `0.9375rem` / 1.625 | 400 | Be Vietnam Pro |
| Nhãn nhỏ (`.micro`) — tiêu đề cột, nhãn form, dòng meta | `0.8125rem` / 1.4 | 500 | Be Vietnam Pro, màu `ink-soft` |
| Số liệu (khoảng cách ôn, tiến độ, bộ đếm) | theo ngữ cảnh | — | `tabular-nums` (`.tnum`) |

Quy tắc:

- Bề rộng dòng tối đa **46ch** cho câu tiếng Anh (ví dụ, ghi chú). Thẻ ôn và màn kết thúc canh giữa nên ngắn hơn.
- Ô nhập và nút **không nhỏ hơn `1rem`** (ô nhập) — tránh iOS tự zoom khi focus.
- Heading ngắn nhiều dòng: `max-inline-size` + `text-wrap: balance`, không chèn `<br>` cứng.
- **Không** dùng: chữ in hoa cho nhãn, chữ mono, icon/emoji làm nhãn, `·` nối các mẩu meta.

---

## 5. Bố cục

- Khung nội dung tối đa **`56rem`**, lề ngang `1.5rem` (mọi kích thước), lề dọc `2.5rem` → `3rem` (desktop).
- Nhịp dọc giữa các khối lớn: **`2.5rem`** (`space-y-10`) — thoáng, không dồn cục.
- Canh trái cho mọi nội dung dạng văn bản và danh sách. **Chỉ thẻ ôn và màn kết thúc canh giữa** — chúng là một vật thể duy nhất trên trang.
- Cột hẹp: thẻ ôn và panel kết thúc `30rem`; màn đăng nhập `23rem`; modal tối đa `32rem`.
- **Khung trang** (`AppShell`): menu dọc bên trái `15rem` (240px), `sticky top-0 h-screen`, viền phải `rule`, nền `paper`. Mục đang xem: nền `accent/10` + chữ `accent` + weight 500 (đúng vai "dấu mục đang xem" của accent ở §2). Nút `Ẩn menu` nằm cuối menu, trạng thái nhớ trong `localStorage` (`super-vocab.nav-collapsed`).
- Dưới `md` (768px): menu thành **drawer** trượt từ trái trên nền `scrim`, có nút `Đóng`, đóng bằng `Esc` hoặc khi bấm vào scrim hoặc khi chuyển trang. Thanh trên `sticky` giữ wordmark và nút `Menu`.
- Khi thu gọn trên desktop, thanh trên hiện nút `Hiện menu` ở góc trái nội dung. Bàn phím/AT vẫn tới được mọi mục.
- Linh vật ở góc dưới phải, kích thước `112px`, `z-20` (dưới modal `z-30` và drawer `z-40`).

```
Menu dọc 240px (aside, sticky, `border-r` rule)   │  phần còn lại
  Super Vocab        ↑ Literata                  │
  ▸ Từ vựng   ▪ Ôn tập  ← mục đang xem: nền accent/10, chữ accent
  …                                             │
  owner@…  [ Đăng xuất ]  [ Ẩn menu ]            │        linh vật ở góc (≥1400px)
```

Thêm từ (`#/vocab`)
  ┌ panel ──────────────────────────────────────────────────────┐
  │  Thêm từ                                                    │  ← h1 Literata 1.375rem
  │  Từ [______]        Nghĩa [______]                          │  ← nhãn .micro, ô .field
  │  Phát âm [______]  [ Lấy phát âm ] [ Nghe ]                 │
  │  Bộ từ [ ▾ ]                                                │
  │  Ví dụ [______]   Ghi chú [______]                          │
  │  [ Thêm từ ]                                                │
  │  Đã thêm {từ}. Xem trong danh sách                          │  ← dòng xác nhận, chỉ hiện sau khi thêm
  └─────────────────────────────────────────────────────────────┘

  Bộ từ  [Tất cả 7] [Chưa phân loại 2] [● Giao tiếp hàng ngày 2] [ + Thêm bộ từ ]
         ↑ chip đang chọn: nền accent, chữ on-accent — cũng là bộ mặc định cho từ mới
  [ ≡ Danh sách từ vựng  7 ]

Danh sách từ vựng (`#/vocab/list`)
  ← Từ vựng / Danh sách từ vựng                              ← breadcrumb
  Danh sách từ vựng  7/7 từ      [ + Thêm từ ]  [ Tìm theo từ hoặc nghĩa ]
  Bộ từ  [Tất cả 7] [Chưa phân loại 2] [● Giao tiếp hàng ngày 2] [ + Thêm bộ từ ]
  ────────────────────────────────────────────────────────────────────────── (rule)
  Từ                Nghĩa              Bộ từ          Ôn tiếp theo   Trạng thái  Thao tác
  ══════════════════════════════════════════════════════════════════════════
  eloquent          hùng hồn, lưu loát  Chưa phân loại quá hạn 1 ngày  Mới      Sửa  Xóa
  Literata 1.0625   0.9375rem           ● + tên        nền highlighter
                    ví dụ: Literata 0.9375rem/1.7 ink-soft
  ────────────────────────────────────────────────────────────────────────── (rule)
  1–50 trong 320 từ                    [ ← Trước ] 1 … 4 [5] 6 … 12 [ Sau → ]
```

- **Thêm từ** và **Danh sách từ vựng** là **hai trang riêng** (`#/vocab` và `#/vocab/list`): gộp một trang thì quá dài. Trang danh sách có breadcrumb quay lại; cả hai chiều đều có lối đi (link `Danh sách từ vựng` ở trang thêm, nút `+ Thêm từ` ở trang danh sách).
- Chọn bộ ở trang **Thêm từ** vừa lọc vừa đặt bộ mặc định cho từ mới; form remount sau mỗi lần thêm nên bộ đang chọn được giữ làm mặc định.
- Danh sách là **sổ kẻ dòng**: đường kẻ `rule` 1px giữa các mục, không viền quanh từng mục, không bóng, không bo góc.
- **Phân trang**: 50 mục/trang, lọc + tìm kiếm **client-side** nên đổi bộ hay gõ tìm đều nhảy về trang 1. Nút số trang dùng cùng dáng chip (`rounded-ui`, viền `line-strong`); trang hiện tại nền `accent` + chữ `on-accent`, đánh dấu thêm bằng `aria-current="page"`. Chỗ bị nhảy chèn `…`. Hai đầu có `Trước` / `Sau` (`.btn-quiet`), kèm dòng `{đầu}–{cuối} trong {tổng} từ` bên trái. Đổi trang thì cuộn lên đầu trang.
- Mobile (< 640px): mỗi mục thành khối nhiều dòng — headword + nút Nghe / nghĩa / ví dụ / (bộ từ · hạn · trạng thái) / hàng thao tác. Không cuộn ngang. Chip bộ từ **xuống dòng** thay vì cuộn ngang.

```
Ôn tập
  Bộ từ  [Tất cả] [Chưa phân loại] [● ...]

  3 / 12   ─────────────────────────────────────   ← track 2px line-strong, fill accent

           ● IELTS Reading                        ← .micro + chấm tông
           ┌───────────────────────────────────┐
           │                                   │
           │            ephemeral              │  ← Literata clamp(2.5–4rem), canh giữa
           │           /ɪˈfem.ə.ɹəl/  [ Nghe ] │
           │     Bấm hoặc nhấn Space để xem nghĩa│
           └───────────────────────────────────┘

           [ Hiện nghĩa ]                          ← nút chính, full width

  (sau khi lật)
           ┌ Lại ────────┐┌ Khó ────────┐┌ Được ───────┐┌ Dễ ─────────┐
           │ Lại      1  ││ Khó      2  ││ Được     3  ││ Dễ       4  │
           │ 1 phút      ││ 6 phút      ││ 10 phút     ││ 9 ngày      │
           └─────────────┘└─────────────┘└─────────────┘└─────────────┘
             ↑ viền trên 2px: danger / warn / accent / cool; số khoảng cách màu accent
```

- 4 nút chấm cao ≥44px (vùng chạm), thân `card`, viền `line-strong`, **dải màu 2px ở cạnh trên** mã hoá mức chấm. Chỉ hover mới đổi nền (`hover`).
- Nhãn mức vẫn kèm chữ (`Lại/Khó/Được/Dễ`) — màu không bao giờ là kênh thông tin duy nhất.

---

## 6. Thành phần

Tất cả nằm ở `@layer components` trong `src/index.css`. **Trang không tự khai báo lại class string** — dùng đúng các class dưới đây.

| Class | Đặc tả |
|---|---|
| `.panel` | `border: 1px solid var(--rule)`, `border-radius: var(--radius-card)` = **12px**, nền `card`. Không bóng. |
| `.micro` | nhãn nhỏ: `0.8125rem`, weight 500, `color: ink-soft`, `display: block`. Chữ thường. |
| `.field` | `input`/`textarea`/`select`: cao ≥44px, viền `line-strong`, radius **8px**, nền `card`, chữ `1rem`; `:focus` viền `accent`; `::placeholder` màu `ink-soft`. |
| `.btn` | nền tảng: inline-flex, gap `.5rem`, padding `.5rem .875rem`, chữ `.875rem`/500, radius **8px**, transition 160ms, `:disabled` opacity .5 + `not-allowed`. |
| `.btn-primary` | nền `accent`, chữ `on-accent`; hover `accent-hover`. |
| `.btn-quiet` | nền trong suốt, viền `line-strong`, chữ `ink`; hover nền `hover` + viền `ink-soft`. |
| `.btn-danger` | nền `danger`, chữ `on-danger`; hover `brightness(.9)`. Hành động xoá luôn xác nhận 2 bước. |
| `.btn-text` | nút chỉ có chữ (trong bảng, trong danh sách): `inline-flex` + gap `.375rem`, chữ `ink-soft`, không viền; hover nền `hover` + chữ `ink`. Xoá thì thêm `hover:text-danger`. |
| `.banner` | thông báo: vạch trái 2px `danger`, nền `danger` 7%, chữ `ink`. Biến thể `.banner-warn`. |
| `.tnum` | `font-variant-numeric: tabular-nums` cho mọi cột số. |
| `.tap-target` | `@media (pointer: coarse) { min-height: 44px }` — nâng vùng chạm trên thiết bị cảm ứng mà không đổi dáng hiển thị trên desktop. |
| `.flip-inner` / `.flip-face` / `.flip-face-back` / `.is-flipped` | lật thẻ 3D; nhánh `prefers-reduced-motion` đổi mặt bằng opacity 120ms. |

Chip bộ từ, track tiến độ, ô chấm, thẻ ôn là các tổ hợp utility cục bộ, không phải class dùng chung.

| Thành phần | Đặc tả |
|---|---|
| Chip bộ từ | `inline-flex`, gap `.5rem`, padding `.25rem .625rem`, radius **8px**, chữ .875rem; chưa chọn: viền `line-strong` + chữ `ink-soft`; đang chọn: nền + viền `accent`, chữ `on-accent`, weight 500. Cao **34px** trên desktop, **44px** khi `pointer: coarse` (class `.tap-target`, §9). Bộ đếm bên trong dùng `.tnum` và **giữ nguyên độ đậm màu** — phân cấp bằng cỡ chữ, không bằng opacity. |
| Chấm bộ từ | tròn 10px, `TONE_BG[hash(id)%6]`; bộ trống: viền nét đứt `line-strong`, không nền. Trong sổ từ là marker `inline-block` + `align-middle` để **bám dòng đầu** khi tên bộ xuống dòng. |
| Thẻ ôn | `panel`, `max-width: 30rem`, `min-height: 16rem`; hai mặt thật (front/back) chồng khít; nhãn bộ từ nằm **ngoài** thẻ, phía trên. |
| Nút chấm | cao **80px** (vùng chạm ≥44px), radius **8px**, viền `line-strong` + `border-top: 2px` màu mức; nhãn 15px/500 `ink`, phím tắt 12px `ink-soft`, số khoảng cách 15px/500 `accent`. Cách nhau 8px. |
| Track tiến độ | `2px`, nền `line-strong` (≥3:1 vì đây là graphic mang nghĩa), fill `accent`. |
| Modal | `panel` trên nền `scrim` + `backdrop-blur-sm`, tối đa 32rem, bóng `--shadow-modal`, tiêu đề Literata 1.125rem, `role="dialog"` + `aria-modal`. |
| Focus | `outline: 2px solid var(--accent)`, offset `2px` — áp dụng ở cả 2 chế độ, không bao giờ tắt. |
| Trạng thái thẻ | "Mới" (viền `rule`), "Đang học" (`warn` 10% nền), "Ôn tập" (`accent` 10%), "Học lại" (`danger` 10%) — luôn kèm chữ. |

### 6.1. Icon

Thư viện: **`@phosphor-icons/react`** — đây là bộ mà skill `ui-ux-pro-max` curate (105 icon kèm ngữ cảnh dùng trong `icons.csv`), nên chọn nó thay vì tự vẽ path SVG.

```tsx
import { SpeakerHigh } from '@phosphor-icons/react'
<SpeakerHigh aria-hidden size={16} />
```

Luật:

- **Icon không bao giờ thay chữ.** Mọi icon đều nằm cạnh một nhãn tiếng Việt nhìn thấy được, nên **luôn** `aria-hidden`. Không thêm icon-only button, không đổi `aria-label`.
- `size={16}` trong `.btn` / `.btn-text` (cả hai đã là flex container có gap). Tối đa `size={18}` trong control. Ngoại lệ: icon trang trí ở trạng thái rỗng là `size={28}`.
- Không truyền `color` — icon thừa hưởng `currentColor` để tự đổi theo chế độ và theo trạng thái hover/disabled.
- Không emoji làm icon, ở bất kỳ đâu.
- **Nút chấm 4 mức không có icon.** Đó là một lựa chọn 4 nhánh đã có nhãn, phím tắt, khoảng cách và dải màu — thêm icon là nhiễu.

| Chỗ | Icon |
|---|---|
| Wordmark (navbar, đăng nhập) | `BookOpen` |
| Nav `Từ vựng` / `Ôn tập` | `ListBullets` / `Cards` |
| `Đăng xuất` / `Đăng nhập` | `SignOut` / `SignIn` |
| `Thêm từ`, `Tạo`, `Thêm bộ từ` | `Plus` |
| `Lưu` (đổi tên bộ, sửa từ) | `Check` |
| `Hủy`, đóng modal | `X` |
| `Sửa`, `Đổi tên` | `PencilSimple` |
| `Xóa` | `Trash` |
| `Nghe` | `SpeakerHigh` |
| `Lấy phát âm`, ô tìm kiếm | `MagnifyingGlass` |
| `Hiện nghĩa` | `Eye` |
| `Thử lại`, `Tải lại`, `Ôn lại từ đầu` | `ArrowClockwise` |
| `Trước` / `Sau` | `ArrowLeft` / `ArrowRight` |
| Danh sách trống | `Notebook` |
| Banner chưa cấu hình | `WarningCircle` |

### 6.2. App icon & favicon

Dấu: **quyển sách mở `BookOpen` (variant `fill`) màu `paper` trên nền `accent` bo góc** — cùng dấu với icon trong navbar/wordmark, nên favicon và giao diện là một hệ.

| File | Nội dung |
|---|---|
| `public/favicon.svg` | nguồn **vector** 256×256: `rect rx=56` (`accent`) + glyph `BookOpen` canh theo `getBBox()` với bề rộng glyph = **74%** cạnh tile (`translate(19.7486 6.2060) scale(0.845714)`). Nét ở mọi kích thước |
| `public/favicon.ico` | **16 / 32 / 48 / 64 / 128 / 256** — mỗi entry một PNG 32-bit (ICO kiểu PNG; Vista+ đọc được) |
| `public/apple-touch-icon.png` | 180×180, **nền tràn viền `rx=0`, đục** — iOS tự bo góc, và ảnh có alpha sẽ bị chèn nền đen sau góc bo |

`index.html` khai báo **SVG trước** (browser hiện đại chọn nó, nét nhất) rồi `.ico` với `sizes="any"` làm fallback.

Chọn tỉ lệ 74% bằng đo, không bằng mắt: đã render 16px của `BookOpen` / `Book` (sách đóng) / `BookBookmark` / `Notebook` ở các tỉ lệ 0.56 / 0.68 / 0.80 rồi so trên lưới pixel phóng 8× không nội suy. `BookOpen` đọc rõ nhất; sách đóng và Notebook nhoè thành khối trắng ở 16px.

Vì `favicon.svg` là vector nên favicon **không phụ thuộc độ phân giải ảnh nguồn** — khác với phương án dùng ảnh raster trước đó (nguồn chỉ 64px, làm `apple-touch-icon` 180px bị mềm).

---

## 7. Chuyển động

**Tĩnh là mặc định.** Chuyển động chỉ để trả lời một hành động của người dùng, không để trang trí lúc tải.

| Việc | Chuyển động | Thời lượng |
|---|---|---|
| Lật thẻ | xoay Y 3D quanh trục dọc, hai mặt thẻ thật | 420ms, `cubic-bezier(.2,.7,.25,1)` |
| Đổi màu/vừa chạm của nút, ô nhập, chip | chỉ `background-color` / `border-color` / `color` | 160ms `ease-out` |
| Mở/đóng modal | hiện tức thì, nền `scrim` + blur | — |
| Đổi bộ từ, sang thẻ kế | tức thì, không trượt, không fade | — |
| Vào trang | không hoạt ảnh cho từng khối | — |

`prefers-reduced-motion: reduce` → bỏ xoay 3D, đổi mặt bằng mờ 120ms; mọi thay đổi trạng thái giữ nguyên.

---

## 8. Lời thoại giao diện (copy)

Nguyên tắc: câu, chữ thường, thể chủ động, động từ rõ, không xin lỗi, không chung chung. Nút và kết quả dùng cùng một từ. Nhãn giao diện tiếng Việt; tiếng Anh chỉ ở nội dung người dùng tự nhập.

| Chỗ | Chữ |
|---|---|
| Mức chấm | `Lại / Khó / Được / Dễ` (phím tắt 1–4) |
| Mặt thẻ | `Nghĩa / Ví dụ / Ghi chú` |
| Tiêu đề cột | `Từ / Nghĩa / Bộ từ / Ôn tiếp theo / Trạng thái / Thao tác` |
| Màn kết thúc | `Hết thẻ trong bộ` + `Bộ: {tên}` + `Đã chấm {n} thẻ.` |
| Màn hết thẻ đến hạn | `Hôm nay đã xong` + `Bộ: {tên}` + `Còn {n} từ đến hạn. Gần nhất {giờ}.` |
| Lỗi ghi DB | `Chưa lưu được. Thẻ vẫn ở đây, chấm lại giúp.` |
| Lỗi đăng nhập | `Email hoặc mật khẩu không đúng.` |
| Nhãn tiến độ | `3 / 12` (có khoảng, `tabular-nums`) |
| Trống danh sách | `Hộp còn trống.` + nút `Thêm từ đầu tiên` (dẫn sang `#/vocab`) |
| Trang thêm từ | `Thêm từ` · `Đã thêm {từ}. Xem trong danh sách` · `Danh sách từ vựng {n}` |
| Trang danh sách | `Danh sách từ vựng` · `{đã lọc}/{tổng} từ` · `Thêm từ` · `Tìm theo từ hoặc nghĩa` |
| Phân trang | `{đầu}–{cuối} trong {tổng} từ` · `Trước` / `Sau` |

Không emoji trong nhãn. Không dấu `·` nối các mẩu meta.

---

## 9. Khả năng tiếp cận & responsive

- Mọi cặp chữ/nền đạt **≥4.5:1**, mọi viền control đạt **≥3:1** (số đo ở §3). `rule` (1.3:1) chỉ dùng cho đường kẻ trang trí.
- Vùng chạm **≥44×44px**: nút chấm cao 80px; chip lọc bộ từ cao 34px trên desktop nhưng được `.tap-target` nâng lên **44px khi `pointer: coarse`** — đây là điều hướng chính trên điện thoại nên không thể thấp hơn ngưỡng chạm. Khoảng cách giữa 4 nút chấm và giữa các chip đều ≥8px.
- Bàn phím đầy đủ: `Space` lật thẻ, `1–4` chấm, `Esc` đóng modal, `Tab` thấy focus (outline accent 2px). Thứ tự tab theo thứ tự đọc.
- Không truyền đạt thông tin chỉ bằng màu: chấm bộ từ luôn kèm tên bộ; trạng thái luôn kèm chữ; mức chấm luôn kèm nhãn.
- Icon chỉ là bạn đồng hành của chữ: **mọi** icon đều `aria-hidden` vì luôn có nhãn chữ bên cạnh; không có icon-only button. Không emoji. Không ảnh ngoài.
- Mobile-first: 1 cột dưới 640px; form 2 cột → 1 cột; bảng `block md:table` tự xếp lại theo tầng; chip bộ từ xuống dòng; headword `clamp()` để không tràn.

---

## 10. Những gì đã loại

| Đã cân nhắc | Vì sao bỏ |
|---|---|
| Palette mặc định của skill: tím `#7C3AED` + nền `#FAF5FF` | đúng "màu AI mặc định" — mọi trang do máy sinh đều ra màu này. Thay bằng giấy ngà + mực xanh rêu thẫm |
| Nhãn ALL-CAPS + `letter-spacing .08em` | dấu hiệu dễ thấy nhất của giao diện do máy sinh, và chữ Việt có dấu đọc rõ hơn ở dạng chữ thường. Thứ bậc chuyển sang cỡ chữ + độ đậm + màu + đường kẻ |
| Bóng mờ dưới mọi khối | bỏ hoàn toàn; chỉ modal có bóng |
| Bo góc lớn (`rounded-md` 6px) cho mọi thứ, hoặc bo 2px gần vuông cho mọi thứ | một bán kính cho mọi vai trò là sai: **8px cho control, 12px cho bề mặt**, badge nhỏ dùng `rounded-full` |
| Emoji làm icon, icon-only button, icon thay chữ | bỏ. Icon là **chữ viết kèm**, luôn `aria-hidden` — xem §6.1 |
| Nền kem ấm `#F4F1EA` + accent đất nung `#D97757` | cụm mặc định số 1; giấy ở đây ngả trung tính ấm, không ngả vàng |
| Nền đen gần + accent xanh chua | cụm mặc định số 2; chế độ tối dùng mực xanh ngả đen, accent là xanh rêu nhạt |
| Ẩn dụ vật liệu: tai ngăn hộp, 2 cạnh thẻ chồng, nét dạ quang khắp nơi | đã bỏ ở bản này. Chỉ còn **một** nét dạ quang, dành riêng cho mốc "quá hạn" |
| Icon dày đặc ở mọi chỗ, kể cả 4 nút chấm | icon chỉ đặt ở control có hành động rõ và ở trạng thái rỗng; nút chấm để nguyên (§6.1) |
| 4 nút chấm đổ màu đặc | nền giấy + dải màu 2px ở cạnh trên; màu là phụ, nhãn chữ là chính |
| Gradient, hoạt ảnh fade-and-slide khi vào trang | bỏ; chỉ còn chuyển động lật thẻ và đổi màu 160ms |
| 6 tông pastel làm nền tai ngăn có chữ | thu về 6 tông thuốc nhuộm, chỉ làm **chấm 10px** — không đặt chữ lên màu |
| Icon/emoji cho trạng thái, nút | bỏ; chữ làm việc đó |

---

## 11. Kiểm chứng

Đã chạy: `npx tsc -b --noEmit` (sạch) · `npx oxlint` (sạch) · `npx vite build` (sạch) · ảnh chụp bằng browser thật ở **1440px và 375px, cả 2 chế độ**, cho: Đăng nhập, Từ vựng, Ôn tập (mặt trước, mặt sau, màn kết thúc), modal Sửa từ, modal Bộ từ + dòng xác nhận xoá.

Luồng bàn phím kiểm bằng cách chấm hết 6 thẻ (`Space` → `3`), có intercept request để **không ghi vào DB thật**.

Lần sau (icon + bo góc) kiểm thêm: ảnh chụp từng control có icon ở 1440/390 và cả 2 chế độ; đo computed style của viền trên 4 nút chấm (đúng `danger`/`warn`/`accent`/`cool`, 2px); đo chiều cao chip (34px desktop, **44px** khi `pointer: coarse`); render favicon ở 16/32/48/256 trên lưới pixel không nội suy; kiểm cấu trúc `favicon.ico` bằng cách parse lại 6 entry.

Lỗi thật tìm được khi kiểm và đã sửa:

1. **Backdrop modal sáng lên ở chế độ tối** — dùng `bg-ink/40` mà `--ink` đảo sang gần trắng. Sửa: thêm token `--scrim` (luôn tối ở cả 2 chế độ).
2. **`.micro { display:block }` phá `<th>`** — 6 tiêu đề cột xếp dọc ở desktop. Sửa: `md:table-cell` trên `th` (mobile không bị vì `thead` là `hidden`).

Điều chỉnh nhỏ sau khi nhìn ảnh thật:

3. **Chấm bộ từ trong sổ từ** canh giữa theo chiều dọc ở ô 2 dòng → đổi sang marker `inline-block` + `align-middle` để bám dòng đầu.
4. **Track tiến độ** dùng `rule` (1.25:1) quá mờ ở chế độ tối, mà đây là graphic mang nghĩa → đổi sang `line-strong` (≥3:1).
5. **Chip bộ từ chỉ cao 30px** — dưới ngưỡng chạm 44px trong khi đây là điều hướng chính trên điện thoại. Sửa: thêm `.tap-target` nâng lên 44px khi `pointer: coarse`, desktop giữ 34px.

Vòng sau (icon + bo góc + favicon):

6. **`public/favicon.svg` cũ là logo tia sét tím `#863bff`** — di sản template Vite, đúng cái "màu AI" đã loại ở §3. Thay bằng dấu sách trên nền `accent`.
7. **16px của favicon không đọc được** ở tỉ lệ glyph ban đầu. Kiểm bằng cách render 4 ứng viên × 3 tỉ lệ ở đúng 16px rồi so trên lưới pixel (phóng 8×, không nội suy): `BookOpen` thắng; `Book` (sách đóng) và `Notebook` nhoè thành khối trắng. Chốt bề rộng glyph = **74%** cạnh tile.
8. **Badge "quá hạn" và chip trạng thái** còn ở `rounded-ui` sau khi có luật bán kính theo vai trò → chuyển sang `rounded-full` (badge nhỏ không phải control).
9. **Form "Thêm từ" giữ nguyên dữ liệu sau khi thêm thành công**, nên không nhập được từ kế tiếp. Sửa theo đúng cơ chế sẵn có của `VocabForm` (remount qua `key`): thêm `formReset` tăng sau mỗi lần insert thành công.
10. **Mọi icon phải `aria-hidden`** — đã rà từng chỗ; không có icon-only button nào được thêm vào.
11. **Apple-touch-icon phải đục và tràn viền** — iOS tự bo góc, còn giữ alpha thì nó chèn nền đen sau góc bo. Render `rx=0`, không alpha, 180×180.
12. **Đã thử một phương án favicon bằng ảnh raster 64×64 rồi bỏ.** Nguồn quá nhỏ nên `apple-touch-icon` 180px bị mềm, và buộc phải chấp nhận không khai báo `<link>` SVG (một SVG khai báo trước sẽ bị browser ưu tiên và đè lên `.ico`). Quay lại dấu vector — nét ở mọi kích thước và khớp với icon trong giao diện.

Kiểm chứng riêng cho lần sửa form (dùng request interception, **không ghi vào DB thật**):

| Ca | Kỳ vọng | Kết quả đo |
|---|---|---|
| Thêm thành công | 5 ô trống, từ mới hiện trong bảng | Từ/Nghĩa/Phát âm/Ví dụ/Ghi chú đều `""`, bảng có từ mới, bộ đếm 7/7 → 8/8 |
| Thêm trùng từ (chặn ở client) | giữ nguyên dữ liệu, hiện lỗi | giữ nguyên, banner "Từ … đã có trong danh sách." |
| Insert lỗi 400 từ server | giữ nguyên dữ liệu, hiện lỗi | giữ nguyên, banner hiện thông báo của server |

---

## 12. Phát âm (IPA + audio)

**Mục tiêu:** mỗi từ có phiên âm để đọc, và nghe được ngay trên thẻ ôn lẫn trong sổ từ.

### 12.1. Dữ liệu

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `cards.phonetic` | `text` null | IPA, ví dụ `/juːˈbɪkwɪtəs/` |
| `cards.audio_url` | `text` null | URL file phát âm (mp3), null khi từ không có bản ghi |

Không lưu audio vào Storage của Supabase: file là tài sản công khai của Wikimedia, lưu URL để khỏi nhân bản dữ liệu và khỏi tốn quota.

### 12.2. Nguồn — số đo thật, không phải giả định

| Nguồn | Đo được | Dùng? |
|---|---|---|
| dictionaryapi.dev | lần 1: 200 sau **20s**; lần 2: **522** — CDN của họ cũng 522 | ❌ bỏ: không ổn định |
| Wiktionary Action API (`{{IPA\|en\|/…/}}`) | ~0.8–1.1s | ✅ nguồn IPA |
| Wikimedia Commons (`File:En-us-<word>.ogg`) | ~1s; file `.ogg` **13195 bytes** | ✅ nguồn audio |
| `…/transcoded/…/En-us-<word>.ogg.mp3` | **200**, `audio/mpeg`, **23113 bytes** | ✅ dùng bản mp3 (Safari/iOS không phát ogg) |
| Web Speech API | có sẵn trong browser, **157 giọng** ở máy test (47 giọng Anh) | ✅ đường phát mặc định, không cần mạng |

Cả 3 endpoint Wikimedia đều trả `access-control-allow-origin: *` khi thêm `origin=*` → gọi được từ browser, không cần proxy, không cần key.

### 12.3. Luồng

```
Lấy phát âm  →  Wiktionary (IPA)  ║  Commons (file ogg → URL mp3)     [song song, timeout 8s]
             →  điền vào 2 cột phonetic + audio_url;  cả hai đều rỗng ⇒ "Không tra được phát âm cho từ này. Nhập tay giúp."

Nghe  →  có audio_url ⇒ <audio>.play()   (mp3 trên Wikimedia)
      →  play() lỗi/không có audio_url ⇒ speechSynthesis (en-US, rate 0.95)
      →  máy không có TTS ⇒ im lặng, không báo lỗi (không phải lỗi của dữ liệu)
```

Người dùng sửa được cả IPA và nghe lại trước khi lưu.

### 12.4. Hình thức

- IPA nằm **ngay dưới headword**, màu `ink-soft`: trên thẻ ôn 15px, trong sổ từ 13px.
- Nút `Nghe` là ô nhỏ viền `line-strong`, chữ `ink-soft`, đặt cạnh headword — **không dùng icon loa** (giữ luật "chữ làm việc đó"), `aria-label="Nghe <từ>"`.
- Trong sổ từ, IPA là dòng phụ của cột "Từ" nên **không thêm cột mới**; cột "Phát âm" trong form là nơi nhập/sửa.
- Từ chưa có IPA thì không hiện dòng đó — không hiện "—".

### 12.5. Giới hạn đã biết

- Từ không có file trên Commons (ví dụ `eloquent`) ⇒ chỉ có TTS, `audio_url` null. Đúng thiết kế, không phải lỗi.
- IPA lấy bản phonemic **đầu tiên** trong template Wiktionary (có thể là giọng RP hoặc GA tuỳ từ) — người dùng sửa tay nếu muốn giọng khác.
- Cần mạng cho lần tra và cho mp3; TTS thì không.
- Giọng TTS phụ thuộc máy (macOS/iOS đọc khá tốt, Android tuỳ máy).

---

## 13. Hai chế độ ôn (flashcard & viết câu)

`#/practice` giờ là màn **chọn chế độ**, không còn là màn flashcard. Hai route con giữ nguyên phạm vi bộ từ đã chọn.

| Route | Việc | Đổi lịch FSRS? |
|---|---|---|
| `#/practice` | chọn bộ từ + chọn chế độ | — |
| `#/practice/flashcard` | lật thẻ, chấm 4 mức (nguyên bản) | ✅ |
| `#/practice/writing` | viết câu, AI chấm điểm + chỉ lỗi | ❌ |

**Breadcrumb** (`src/components/Breadcrumb.tsx`) ở đầu cả hai trang con: `← Ôn tập / {Flashcard|Viết câu}` — mục đầu là link quay lại màn chọn chế độ (kèm `ArrowLeft`, đây là nút back), mục cuối là trang hiện tại với `aria-current="page"`. Bọc trong `nav[aria-label="Đường dẫn trang"]`, ngăn cách bằng `/` (không dùng `·`), hiện ở **mọi** trạng thái kể cả lúc đang tải. Đặt trên CollectionBar, trong cùng một khối `space-y-3` để nhịp dọc không bị phá.

### 13.1. Màn chọn chế độ

- `h1` **`Ôn tập`** + một dòng phụ: `Chọn cách ôn. Cả hai dùng chung bộ từ bên dưới. Hôm nay còn {n} thẻ đến hạn.`
- Dưới đó là **CollectionBar** (chọn bộ) — bộ này áp cho cả hai chế độ, nhớ trong `localStorage`.
- Hai **thẻ chế độ** (`.panel`, lưới 2 cột ≥640px, `min-height 9.5rem`): icon + tên (Literata 1.125rem) + mô tả 1 câu + `Bắt đầu →` màu `accent`. Hover đổi nền `hover`. Không bóng, không bo lớn — cùng ngôn ngữ với panel hiện có.
- Bộ đếm đến hạn lấy bằng `head: true, count: exact` (không tải thẻ), nên đúng cả khi quá 30 thẻ.

### 13.2. Màn viết câu

Cột hẹp `30rem` (như thẻ ôn). Khối trên là **thẻ từ**: chấm tông + tên bộ (ngoài panel, như flashcard), headword Literata `clamp(1.75rem, 6vw, 2.5rem)`, phiên âm + nút `Nghe`, rồi `Nghĩa` và `Khái niệm` (`note`) canh trái.

> Cố ý **không** hiện `example` sẵn có: hiện thì người học chỉ việc chép lại. Ví dụ chỉ dùng làm ngữ cảnh cho AI.

Dưới thẻ là vùng viết: nhãn `Viết một câu tiếng Anh có dùng từ “{từ}”`, `<textarea>` (`.field`, `rows=4`, tối đa 1000 ký tự), dòng phụ `⌘/Ctrl + Enter để chấm`, nút **`Chấm điểm`**. Textarea **khoá** sau khi có kết quả; mở lại bằng `Viết lại`.

Cạnh `Chấm điểm` có nút phụ **`Từ tiếp theo`** (`.btn-quiet`) để bỏ qua từ đang viết mà không cần chấm — cùng nhãn với nút trong panel kết quả, theo luật "nút và kết quả dùng cùng một từ" (§8). Nút này **ẩn khi đã có kết quả**, vì lúc đó bản sao trong panel kết quả đã thay nó, tránh hai nút trùng chức năng trên cùng màn.

**Kết quả chấm** nằm trong một `.panel`, theo thứ tự: điểm + `level` (số Literata 2rem, màu theo mức: ≥80 `accent`, ≥60 `warn`, còn lại `danger` — luôn kèm chữ `level` nên màu không phải kênh duy nhất) → `verdict` → `usedWord === false` thì `.banner-warn` → danh sách lỗi (mỗi lỗi: vạch trái 2px `danger`, `type`, đoạn sai (serif), giải thích, `Sửa: …` màu `accent`) → **`Câu đúng`** (serif 1.0625rem) → `Có thể viết` (danh sách serif `ink-soft`) → `tip` sau đường kẻ `rule`. Hai hành động: **`Từ tiếp theo`** (chính) và **`Viết lại`** (phụ).

**Màn kết thúc phiên:** `Hết câu trong phiên` + `Đã viết {n} câu · điểm trung bình {x}/100.`

### 13.3. Quyết định

- **Không** cập nhật FSRS ở chế độ viết. Đây là bài tập sản xuất, không phải lượt tự đánh giá; trộn điểm AI vào lịch ôn sẽ làm lịch ôn mất nghĩa. Muốn tách hẳn thì cần một lịch riêng cho kỹ năng viết.
- **Không** lưu lịch sử chấm (không thêm bảng): giữ đúng phạm vi, tránh một nửa tính năng lịch sử.
- Lỗi do AI trả về có thể rỗng (câu đã đúng) — panel không hiện mục `Lỗi cần sửa` khi rỗng, và luôn hiện `Câu đúng`.
- Nhãn/màu/kiểu chữ dùng lại đúng token và thành phần §3–§6; không thêm class mới.

### 13.4. Lời thoại

| Chỗ | Chữ |
|---|---|
| Thẻ chế độ | `Flashcard` / `Viết câu` + mô tả 1 câu + `Bắt đầu` |
| Nhãn vùng viết | `Viết một câu tiếng Anh có dùng từ “{từ}”` |
| Nút chấm | `Chấm điểm` → `Đang chấm…` |
| Kết quả | `Kết quả` · `{điểm}/100` · `Câu đúng` · `Có thể viết` · `Lỗi cần sửa` |
| Thiếu từ mục tiêu | `Câu chưa dùng từ “{từ}”. Thử lại với từ mục tiêu nhé.` |
| Lỗi gọi máy chấm | hiện nguyên văn thông báo của function (ví dụ `Máy chấm chưa được cấu hình: thiếu secret AI_API_KEY của project.`) |
| Hết phiên | `Hết câu trong phiên` + `Đã viết {n} câu · điểm trung bình {x}/100.` |

---

## 14. Linh vật ở góc

Dùng thư viện `page-mascot` (MIT) — nhân vật nhìn theo con trỏ, nháy mắt khi bấm. Nhân vật đang dùng: **`knight`**.

| Việc | Chi tiết |
|---|---|
| Sprite | `src/assets/mascot/knight-{directions,reactions}.webp` — 2 sheet 3×3 (9 hướng đầu, 9 biểu cảm), chuyển từ PNG gốc (1024², ~1.9MB/sheet) sang WebP q82 để còn ~170KB/sheet |
| Vì sao import module | ảnh nằm trong `src/assets` và **import trong TSX** để Vite băm tên + viết lại theo `base` — đường dẫn `/public` sẽ hỏng khi deploy dưới `/<repo>/` |
| Vị trí | `fixed right-4 bottom-3`, `z-20` — dưới modal (`z-30`) và drawer (`z-40`) |
| Kích thước | `112px` |
| Ngưỡng hiện | trang thường: `min-[1400px]`; trang đăng nhập: `min-[680px]` |

**Vì sao có ngưỡng:** cột nội dung canh giữa nên linh vật chỉ không đè lên nội dung khi lề phải đủ rộng. Với sidebar 240px + cột 56rem, cần viewport ≥ 1400px; trang đăng nhập chỉ có cột 23rem nên 680px là đủ. Dưới ngưỡng, linh vật **ẩn** thay vì đè lên form — đây là đánh đổi có ý thức.

Linh vật là **trang trí**: theo dõi con trỏ tự tắt khi không có `pointer: fine`, hiệu ứng nhún khi bấm tôn trọng `prefers-reduced-motion` (cả hai do thư viện lo). Nó vẫn là một `button` có `aria-label` (`Boop the linh vật`) nên bàn phím tới được.

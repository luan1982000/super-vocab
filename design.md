# Design — Super Vocab

> File này là bản thiết kế để code theo. Viết trước khi sửa giao diện.
> Thay thế cho các class Tailwind tuỳ hứng đang có trong `src/`.
> Phần cuối có checklist chuyển hoá thành code và các điểm cần bạn xác nhận.

---

## 1. Đối tượng, người dùng, việc chính

**Sản phẩm:** web cá nhân ghi từ vựng và ôn theo lịch FSRS. Một người dùng duy nhất (chủ tài khoản), tự cấp tài khoản cho người khác nếu muốn.

**Người dùng:** một người Việt đang học từ (IELTS/TOEIC/giao tiếp), ôn theo phiên ngắn 5–10 phút, **chủ yếu trên điện thoại**, thường buổi tối hoặc lúc chờ. Họ không cần gamification; họ cần ghi từ nhanh, ôn nhanh đúng lịch, và luôn biết mình đang ở bộ từ nào.

**Ba việc, theo thứ tự quan trọng:**

1. Ôn hết số thẻ đến hạn của hôm nay, không bị phân tâm.
2. Ghi một từ mới vào đúng bộ trong vài giây.
3. Nhìn ra ngay: từ này thuộc bộ nào, lần tới ôn khi nào.

**Thế giới vật chất để lấy chất liệu:** hộp thẻ từ vựng (index card box), thẻ giấy, ngăn chia có tai (tab divider), mực bút bi xanh đen, bút đỏ của giáo viên, bút dạ quang, giấy kẻ dòng, phiếu trắng để viết từ mới. Đây là tổ tiên thật của spaced repetition (hộp Leitner) — và là thứ người học Việt Nam vẫn dùng.

**Một câu định vị:** *web này trông và hành xử như một hộp thẻ từ vựng bằng giấy, làm bằng kỹ thuật số.*

---

## 2. Bảng màu

Không dùng palette mặc định của Tailwind (`slate/indigo/rose/amber/emerald/sky` — đó là dấu hiệu của trang do máy sinh). Màu lấy từ vật liệu thật: giấy, mực xanh đen, bút đỏ, dạ quang.

### 2.1. Nền & mực (chế độ sáng — mặc định)

| Token | Hex | Dùng cho | Contrast đã đo |
|---|---|---|---|
| `paper` | `#F1F3F6` | nền trang (mặt bàn) — trắng ngả xanh lạnh, không phải kem ấm | ink/paper 15.7:1 |
| `card` | `#FFFFFF` | thẻ, phiếu, mặt giấy | ink/card 17.45:1 |
| `ink` | `#131A26` | chữ chính (mực bi xanh đen) | 17.45:1 trên card |
| `ink-soft` | `#5A6675` | chữ phụ, nhãn, ngày giờ | 5.85:1 |
| `rule` | `#C9D2DC` | đường kẻ, viền ngăn, cạnh chồng thẻ (trang trí) | 1.53:1 — không dùng cho chữ |
| `line-strong` | `#7D8B9B` | viền ô nhập, viền nút phụ (cần ≥3:1) | 3.48:1 |

### 2.2. Màu chức năng

| Token | Hex | Nghĩa | Contrast |
|---|---|---|---|
| `pen` | `#1E3A6B` | hành động chính, tab đang chọn, chữ "Được" | 11.21:1 |
| `highlighter` | `#E3EC63` | **chỉ** cho "đến hạn hôm nay" và preview khoảng cách ôn | ink/highlighter 13.66:1 |
| `red-pen` | `#B4232B` | "Lại", quá hạn, lỗi, xoá | 6.53:1 |
| `ochre` | `#A9661C` | "Khó" | 4.56:1 |
| `green` | `#2F6B4F` | "Dễ" | 6.29:1 |

`highlighter` là chỗ duy nhất được phép "sáng": nền dạ quang với mực đen, dùng như một nét bút dạ quang thật — không dùng làm màu nút, không dùng làm gradient.

### 2.3. Màu tai hộp cho bộ từ

6 tông giấy ngăn hộp, gán theo `hash(collection.id) % 6` → ổn định, không đổi khi đổi tên bộ, và các bộ cạnh nhau hiếm khi trùng màu.

| Token | Hex | ink trên nền |
|---|---|---|
| `tab-rose` | `#D98C8C` | 6.71:1 |
| `tab-ochre` | `#D9B36A` | 8.81:1 |
| `tab-sage` | `#9CC0A6` | 8.73:1 |
| `tab-periwinkle` | `#A3B4E0` | 8.44:1 |
| `tab-lilac` | `#C4A6D9` | 8.15:1 |
| `tab-clay` | `#D9A98C` | 8.31:1 |

Bộ "Chưa phân loại" không có màu: dùng `rule` (viền nét đứt) — nó là ngăn trống của hộp.

### 2.4. Chế độ tối — "mực xanh ban đêm"

Nền là mực bi xanh ngả đen (không dùng đen trung tính `#0B0B0B`, không dùng nền bảng xanh + accent xanh chua).

| Token | Hex | Contrast đo được |
|---|---|---|
| `night` | `#0E1622` | ink/night 15.18:1 |
| `night-card` | `#17212F` | — |
| `ink` (dark) | `#E7EBF1` | 15.18:1 |
| `ink-soft` (dark) | `#9AA7B6` | 6.62:1 |
| `pen` (dark) `pen-lite` | `#8AB0F0` | 7.37:1 |
| `pen-fill` (dark) | `#2C5AA8` (chữ trắng: 6.7:1) | 6.7:1 |
| `highlighter` | giữ `#E3EC63`, chữ `#10161F`: 14.22:1 | 14.22:1 |
| `red-pen` (dark) | `#E8796F` | 5.71:1 |
| `ochre` (dark) | `#D9A45C` | 7.27:1 |
| `green` (dark) | `#7FBF9B` | 7.59:1 |

Chế độ tối theo `prefers-color-scheme`, cùng ngôn ngữ cấu trúc, chỉ đổi vật liệu.

---

## 3. Chữ

Hai family, phân vai rõ ràng — không dùng font hệ thống mặc định nữa (hiện tại là `system-ui`, trông giống mọi trang khác).

| Vai | Family | Vì sao chọn |
|---|---|---|
| Từ vựng (headword), tiêu đề trang | **Literata** (serif đọc sách, có subset `vietnamese`, đã verify trên Google Fonts) | headword là *chữ được tra*, không phải nhãn giao diện; serif cho cảm giác từ điển/sách |
| Toàn bộ còn lại (UI, nghĩa, ví dụ, form, bảng) | **Be Vietnam Pro** (sans do người Việt thiết kế, có subset `vietnamese`, đã verify) | dấu tiếng Việt được thiết kế riêng, không phải font Latin thêm dấu; hợp một web tiếng Việt |

Cả hai có subset `vietnamese` — nạp local qua `@fontsource` (chỉ `latin` + `vietnamese`), không gọi CDN.

### 3.1. Thang chữ (tỉ lệ ~1.2, có bước nhảy ở đầu)

| Vai | Size / line-height | Weight | Family |
|---|---|---|---|
| Headword trên thẻ ôn | `clamp(2.25rem, 8vw, 3.5rem)` / 1.15 | 600 | Literata |
| Tiêu đề trang (h1) | `1.5rem` / 1.3 | 600 | Literata |
| Headword trong danh sách | `1.0625rem` / 1.4 | 600 | Literata |
| Nghĩa trên thẻ | `1.25rem` / 1.45 | 500 | Be Vietnam Pro |
| Nội dung, form, bảng | `1rem` / 1.55 | 400 | Be Vietnam Pro |
| Nghĩa trong danh sách | `0.9375rem` / 1.5 | 400 | Be Vietnam Pro |
| Phụ (ngày giờ, gợi ý) | `0.8125rem` / 1.4 | 400 | Be Vietnam Pro |
| Nhãn nút chấm, số khoảng cách | `0.9375rem` / 1.2 | 600 | Be Vietnam Pro, `tabular-nums` |

Quy tắc:

- Bề rộng dòng tối đa **62ch** cho nghĩa/ví dụ trong danh sách và form; thẻ ôn canh giữa nên ngắn hơn.
- Dòng dài (ví dụ, ghi chú) ở Literata nếu là câu tiếng Anh: `line-height` 1.6.
- Ô nhập và nút không nhỏ hơn `1rem` — tránh iOS tự zoom.
- **Không** dùng: all-caps cho nhãn, nhãn eyebrow phía trên heading, monospace cho số liệu nhỏ, in nghiêng/in đậm một từ trong câu để "nhấn", `·` nối các mẩu meta.

---

## 4. Bố cục

Canh trái cho mọi nội dung dạng văn bản và danh sách; **chỉ thẻ ôn và màn kết thúc mới canh giữa**, vì đó là một vật thể duy nhất trên bàn. Không canh đều hai bên. Khung nội dung tối đa `52rem`, lề dọc `1.25rem` (mobile) → `2rem` (desktop).

### 4.1. Ôn tập — màn chính (thẻ là nhân vật chính)

```
  Bộ từ:  [ Tất cả ] [ Chưa phân loại ] [ IELTS Reading ]
                                      ↑ tab đang chọn: nền pen, chữ trắng

  3 / 12        ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░        ← dãy thật, nên được đánh số

              ┌─────────────────────────────┐
              │ [ IELTS Reading ]           │  ← tai hộp nhô lên, màu tab của bộ
              ├─────────────────────────────┤
              │                             │
              │        ephemeral            │  ← Literata, to, canh giữa
              │                             │
              │      (nhấn để xem nghĩa)     │
              └─────────────────────────────┘
                 ══════════════════           ← 2 cạnh thẻ chồng phía sau (rule)
              ╞═══════════════════════════╡
                ↑ sau khi lật: nghĩa + ví dụ + ghi chú

  ┌ Lại ──────────┐┌ Khó ──────────┐┌ Được ─────────┐┌ Dễ ───────────┐
  │ dạ quang: 1 phút││ 6 phút        ││ 10 phút       ││ 7 ngày        │
  └───────────────┘└───────────────┘└───────────────┘└───────────────┘
    chân tab màu red-pen / ochre / pen / green, thân là giấy trắng
```

- 4 nút chấm là **tai ngăn hộp**, không phải 4 viên kẹo màu: thân giấy trắng, viền `line-strong`, một dải màu 3px ở cạnh trên, chữ mực đen. Chỉ khi hover/đang nhấn mới đổ màu.
- Khoảng cách ôn lại hiển thị bằng **nền dạ quang** sau con số (`1 phút`, `10 phút`, `7 ngày`), chữ đen, `tabular-nums`.
- Tiến độ là dãy thật (`3 / 12`) nên được phép có số; không thêm "01 / 02 / 03" ở chỗ khác.

### 4.2. Ôn tập — khi hết thẻ

```
        ┌───────────────────────────────┐
        │        Hôm nay đã xong        │   ← Literata, không emoji
        │  Bộ đang ôn: IELTS Reading    │
        │  Còn 4 từ đến hạn, gần nhất   │
        │  14:30 hôm nay                │   ← mốc đến hạn tô dạ quang
        │   [ Quản lý từ vựng ]  [ Tải lại ] │
        └───────────────────────────────┘
```

### 4.3. Từ vựng — phiếu trắng + sổ danh sách

```
  ┌ phiếu trắng ────────────────────────────────────────┐
  │  Thêm từ                                            │
  │  [ Từ ]              [ Nghĩa ]                      │
  │  [ Bộ từ ▾ ]                                        │
  │  [ Ví dụ ]        [ Ghi chú ]                        │
  │  [ Thêm từ ]                                        │
  └─────────────────────────────────────────────────────┘

  Bộ từ: [ Tất cả ] [ Chưa phân loại ] [ IELTS Reading ] [ ＋ Quản lý bộ từ ]
                 Tìm theo từ hoặc nghĩa: [ ........... ]

  Danh sách từ vựng                                   4 từ
  ─────────────────────────────────────────────────────────────
  ephemeral        phù du                            │ 14:30 hôm nay
  Literata 600     Be Vietnam Pro 400                │ dạ quang nếu quá hạn
  ─────────────────────────────────────────────────────────────
  candid           thẳng thắn, chân thật   ▌IELTS     │ 22/09 08:00
                   Fame is ephemeral.                  │ Đang học
  ─────────────────────────────────────────────────────────────
```

- Danh sách là **sổ kẻ dòng**, không phải lưới thẻ bo góc: đường kẻ `rule` 1px giữa các mục, không viền quanh từng mục, không đổ bóng.
- Cột "Bộ từ" là **một tai ngăn nhỏ** (10×18px, màu tab của bộ) + tên bộ, canh phải, nhỏ hơn phần nội dung.
- Cột phải: mốc `due` (ngày giờ) và trạng thái ("Mới", "Đang học", "Ôn tập", "Học lại"). Quá hạn thì tô dạ quang mốc giờ.
- Mobile (≤ 640px): mỗi mục thành 3 dòng — headword / nghĩa / (tai bộ + hạn), hàng thao tác xuống cuối mục, không cuộn ngang.

### 4.4. Đăng nhập

```
        ┌───────────────────────────────┐
        │  Super Vocab                  │   ← nameplate Literata
        │  ─────────────────────────    │
        │  Tài khoản do quản trị viên   │
        │  cấp.                         │
        │  Email     [ ............... ]│
        │  Mật khẩu  [ ............... ]│
        │  [ Đăng nhập ]                │
        └───────────────────────────────┘
                 (không có tab Đăng ký)
```

Nameplate = một tấm giấy có đường kẻ dưới; đây là "bìa hộp thẻ". Không minh hoạ, không logo, không ô gradient.

---

## 5. Nguyên tắc

1. **Chất liệu thật quyết định hình thức.** Mọi thành phần phải trả lời được: nó là giấy, là mực, là tai ngăn, hay là nét dạ quang?
2. **Cấu trúc là thông tin.** Tai màu = bộ từ. Đường kẻ = hết một mục. Số chỉ xuất hiện khi thật là trình tự (tiến độ phiên).
3. **Dồn độc đáo vào một chỗ.** Chỗ đó là **thẻ ôn**. Mọi màn khác im lặng, kỷ luật, không trang trí.
4. **Dạ quang là tài nguyên khan hiếm.** Chỉ "đến hạn hôm nay / quá hạn" và khoảng cách ôn lại. Không dùng cho nút, tiêu đề, hay nhấn mạnh chung.
5. **Bán kính và bóng là có ý.** Bán kính 6px cho giấy (thẻ, phiếu, nút), 6px trên-cùng cho tai ngăn, 2px cho ô nhập. Bóng chỉ để tạo chồng thẻ (`0 1px 0 rule`, `0 8px 20px rgba(19,26,38,.10)` cho thẻ trên cùng) — không bóng mờ dưới mọi khối.
6. **Tĩnh là mặc định.** Không fade-and-slide cho từng khối khi tải trang, không transition trên mọi card. Chuyển động chỉ để trả lời hành động của người dùng.
7. **Chữ làm một việc.** Mỗi nhãn/nút/lỗi nói đúng một điều, theo ngôn ngữ người dùng, không theo cách hệ thống được xây.

---

## 6. Chuyển động

| Việc | Chuyển động | Thời lượng |
|---|---|---|
| Lật thẻ | xoay Y 3D quanh trục dọc, hai mặt thẻ thật | 480ms, easing `cubic-bezier(.2,.7,.25,1)` |
| Chấm điểm | thẻ hiện tại trượt xuống dưới-trái vào chồng (mờ dần), thẻ kế trồi lên từ chồng | 240ms mỗi thẻ, lệch 40ms |
| Đổi bộ từ | nội dung phiên tải lại, không hoạt ảnh trượt | — |
| Mở/đóng modal | mờ nền 120ms, tấm phiếu nổi 160ms từ 96% → 100% | 160ms |
| Lật lại thẻ mới | hiện tức thì, không hoạt ảnh | — |

`prefers-reduced-motion: reduce` → bỏ xoay 3D (đổi mặt bằng mờ 120ms), bỏ trượt thẻ, giữ nguyên mọi thay đổi trạng thái.

---

## 7. Lời thoại giao diện (copy)

Nguyên tắc: câu, chữ thường, thể chủ động, động từ rõ, không xin lỗi, không chung chung. Nút và kết quả dùng cùng một từ.

**Đổi so với hiện tại:**

| Chỗ | Hiện tại | Thành |
|---|---|---|
| Nhãn mức chấm | `Again / Hard / Good / Easy` | `Lại / Khó / Được / Dễ` (người dùng hiểu ngay; giữ phím tắt 1–4) |
| Mặt thẻ | `NGHĨA`, `VÍ DỤ`, `GHI CHÚ` (all-caps) | `Nghĩa`, `Ví dụ`, `Ghi chú` |
| Tiêu đề bảng | all-caps `TỪ / NGHĨA / …` | `Từ / Nghĩa / Bộ từ / Ôn tiếp theo / Trạng thái` |
| Màn kết thúc | `Xong phiên ôn tập` + `Bộ đang ôn: X · đã chấm N card` | `Hết thẻ trong bộ` + hai dòng riêng: `Bộ: IELTS Reading` / `Đã chấm 12 thẻ` |
| Nút tải lại | `Tải lại` | `Ôn lại từ đầu` khi còn thẻ, `Tải lại` khi rỗng |
| Trống danh sách | `Chưa có từ nào. Thêm từ đầu tiên ở form phía trên.` | `Hộp còn trống. Ghi từ đầu tiên ở phiếu phía trên.` |
| Trống theo bộ | `Không có từ nào trong bộ này (hoặc không khớp từ khóa).` | tách 2 câu: `Bộ này chưa có từ nào.` / `Không có từ nào khớp “{từ khoá}”.` |
| Lỗi ghi DB | `Không lưu được kết quả: {message}` | `Chưa lưu được. Thẻ vẫn ở đây, chấm lại giúp.` |
| Lỗi đăng nhập | đã ổn | `Email hoặc mật khẩu không đúng.` (giữ) |
| Hết thẻ + còn lịch | `Còn 4 từ sẽ đến hạn, gần nhất 14:30 hôm nay (3 giờ nữa).` | `Còn 4 từ đến hạn. Gần nhất 14:30 hôm nay.` (bỏ ngoặc, bỏ `·`) |
| Nhãn tiến độ | `3/12` | `3 / 12` (có khoảng, `tabular-nums`) |
| Emoji | `Hôm nay đã xong 🎉` | bỏ emoji |

Ghi chú dùng tiếng Việt cho toàn bộ nhãn giao diện; tiếng Anh chỉ còn ở phần nội dung người dùng tự nhập.

---

## 8. Thành phần

| Thành phần | Đặc tả |
|---|---|
| Tai ngăn (chip bộ từ) | cao 30px, lề ngang 12px, bán kính 6px 6px 0 0, viền `line-strong`, thân `card`; khi chọn: nền `pen`, chữ trắng, viền `pen`; bộ "Chưa phân loại": viền nét đứt, không màu |
| Thẻ ôn | rộng tối đa 30rem, `min-height: 15rem`, thân `card`, viền `rule`, bán kính 6px; **tai hộp** ở cạnh trên rộng 132px cao 22px, màu tab của bộ, chữ `tab-ink` 12px; 2 cạnh thẻ chồng phía sau |
| Nút chấm | như mô tả §4.1; cao 56px (vùng chạm ≥ 44px), chữ 15px/600, số khoảng cách trên nền dạ quang |
| Ô nhập / chọn | cao 44px, viền `line-strong`, bán kính 2px, nền `card`; focus: viền `pen` 2px + ring `pen` 1px ngoài |
| Nút chính | nền `pen`, chữ trắng, cao 44px, bán kính 6px; nhấn: dịch xuống 1px |
| Nút phụ | viền `line-strong`, chữ `ink`, nền trong suốt |
| Nút nguy hiểm | chữ `red-pen`, viền `red-pen`; hành động xoá luôn xác nhận 2 bước |
| Bảng/sổ | đường kẻ `rule` 1px, không viền ngoài từng dòng, header không all-caps |
| Modal | như tấm phiếu `card` trên nền `rgba(19,26,38,.45)`, bán kính 6px, tối đa 32rem, cuộn được trên mobile |
| Thông báo lỗi | nền `red-pen` 8% + vạch trái `red-pen` 3px, chữ `ink`; nói đúng việc cần làm |
| Focus | luôn thấy: ring 2px `pen` + offset 1px, áp dụng cả dark mode |
| Trạng thái thẻ | "Mới" (viền), "Đang học" (`ochre` 15% nền), "Ôn tập" (`pen` 12% nền), "Học lại" (`red-pen` 12% nền) |

---

## 9. Khả năng tiếp cận & responsive

- Mọi cặp chữ/nền đạt ≥ 4.5:1 (đã đo ở §2), viền ô nhập đạt ≥ 3:1; dạ quang luôn đi với mực đen (13.7:1).
- Vùng chạm ≥ 44×44px; khoảng cách giữa các nút chấm ≥ 8px.
- Điều hướng bàn phím đầy đủ: `Space` lật, `1–4` chấm, `Esc` đóng modal, `Tab` thấy focus; thứ tự tab theo thứ tự đọc.
- Không truyền đạt thông tin chỉ bằng màu: tai bộ từ luôn kèm tên bộ; trạng thái luôn kèm chữ.
- Mobile-first: 1 cột dưới 640px; nút chấm 2×2; headword `clamp()` để không tràn; hàng tai ngăn cuộn ngang một hàng (không xuống dòng) để không chiếm chỗ của thẻ, từ 640px trở lên mới cho xuống dòng.
- Không dùng ảnh/icon ngoài; không emoji trong nhãn.

---

## 10. Tự phê bình: những gì đã loại

Đối chiếu với danh sách "dấu hiệu trang do máy sinh", đây là các phương án tôi đã cân nhắc rồi bỏ:

| Đã cân nhắc | Vì sao bỏ |
|---|---|
| Nền kem ấm `#F4F1EA` + serif tương phản cao + accent đất nung `#D97757` | đúng cụm mặc định số 1. Đổi sang giấy **trắng ngả xanh lạnh** + **mực bi xanh đen**, vì vật liệu thật của người học Việt là mực xanh đen, không phải terracotta |
| Nền đen gần + một accent xanh chua | cụm mặc định số 2. Chế độ tối dùng **mực bi xanh** `#0E1622`, không dùng đen trung tính, không dùng xanh chua làm accent |
| Bố cục broadsheet: toàn đường kẻ mảnh, bán kính 0, nhiều cột chữ | cụm mặc định số 3. Giữ đường kẻ nhưng nó là **dòng kẻ của sổ**, và nội dung là danh sách một cột, không phải cột báo |
| Bộ "card kit" SaaS: mọi khối bo tròn giống nhau + cùng một bóng mờ | cụm mặc định số 4. Bán kính theo vật liệu (6px giấy, 2px ô nhập, tai ngăn bo 2 góc), bóng chỉ để tạo chồng thẻ |
| Nhãn ALL-CAPS + eyebrow phía trên heading + chuỗi meta nối bằng `·` + chữ mono cho số liệu | cụm mặc định số 5 → bỏ hết; số liệu dùng `tabular-nums`, meta tách thành câu riêng |
| 4 nút chấm đổ màu đặc (rose/amber/emerald/sky) | đó là palette mặc định của Tailwind. Đổi thành **tai ngăn giấy trắng + dải màu 3px**, màu lấy từ bút đỏ/bút bi/dạ quang |
| Chip bo tròn `rounded-full` với viền xám | vô nghĩa với chủ đề. Đổi thành **tai ngăn hộp** có bán kính trên, đứng trên một đường kẻ nền |
| Gradient như trang trí, bóng mờ dưới mọi thẻ | bỏ hoàn toàn; chỉ còn dạ quang và cạnh chồng thẻ |
| Hoạt ảnh fade-and-slide cho từng khối khi vào trang | bỏ; giữ 1 chuyển động ở thẻ ôn (lật + trồi lên) |
| Icon/emoji cho trạng thái, nút | bỏ; chữ làm việc đó |

**Một chỗ duy nhất được phép gây ấn tượng:** thẻ ôn với tai hộp, cạnh chồng, và nét dạ quang. Mọi thứ khác giữ im lặng.

---

## 11. Checklist chuyển thành code

Trạng thái: mục 1–9 **đã làm**, 10 đã kiểm bằng ảnh 1280/390 ở cả 2 chế độ, 11 thêm sau (phát âm).

1. ✅ `src/index.css`: token `@theme inline` — `paper/card/ink/ink-soft/rule/line-strong/pen/highlighter/red-pen/ochre/green/tab-*`, dark mode theo `prefers-color-scheme`; class `.tnum` cho số liệu.
2. ✅ Font `@fontsource/be-vietnam-pro` (400/500/600, subset latin + vietnamese) + `@fontsource-variable/literata`.
3. ✅ `components/CollectionBar.tsx`: chip → tai ngăn, giữ `aria-pressed`, màu tab theo `hash(id) % 6`.
4. ✅ `components/FlashCard.tsx`: tai hộp theo bộ, 2 cạnh chồng, headword Literata `clamp()`, nhãn chữ thường, nhánh reduced-motion (đổi mặt bằng opacity), nút `Nghe` + IPA.
5. ✅ `pages/PracticePage.tsx`: nút chấm = tai ngăn giấy trắng + dải màu 3px, nhãn `Lại / Khó / Được / Dễ`, khoảng cách trên nền dạ quang, bỏ emoji, cột phiên ôn 30rem.
6. ✅ `components/VocabTable.tsx` → sổ kẻ dòng, cột bộ từ = tai nhỏ + tên, mobile tự xếp lại theo tầng (không cuộn ngang).
7. ✅ `components/VocabForm.tsx`: ô nhập viền `line-strong` bán kính 2px, focus `pen`, thêm trường Phát âm + nút `Lấy phát âm`/`Nghe`.
8. ✅ `pages/LoginPage.tsx`: nameplate Literata + một câu, không minh hoạ.
9. ✅ `index.html`: `theme-color` sáng/tối; `lang="vi"` đã có sẵn.
10. ✅ Ảnh kiểm: Practice + Từ vựng, sáng/tối, 1280px + 390px; lật thẻ thường và reduced-motion (đọc computed style).
11. ✅ Phát âm — xem §13.


---

## 12. Cần bạn xác nhận trước khi code

1. **Hướng tổng thể** — đồng ý "hộp thẻ giấy + mực xanh đen" không, hay bạn muốn một hướng khác (ví dụ: bảng phấn xanh kiểu lớp học, hoặc tối giản hiện đại không dùng ẩn dụ vật liệu)?
2. **Nhãn mức chấm** — đổi `Again / Hard / Good / Easy` sang `Lại / Khó / Được / Dễ`? (Tôi nghiêng về tiếng Việt; nếu bạn quen thuật ngữ Anki/FSRS thì giữ tiếng Anh cũng hợp lý.)
3. **Phạm vi một lần** — làm hết §11 trong một lần, hay chỉ làm thẻ ôn (màn bạn nhìn nhiều nhất) trước rồi xem lại rồi mới làm phần còn lại?

> Đã chốt: (1) hộp thẻ giấy, (2) `Lại / Khó / Được / Dễ`, (3) làm thẻ ôn trước rồi làm tiếp — và phần "làm tiếp" đã gộp luôn trang Từ vựng + Đăng nhập.

---

## 13. Phát âm (IPA + audio) — thêm sau, không phá §1–§12

**Mục tiêu:** mỗi từ có phiên âm để đọc, và nghe được ngay trên thẻ ôn lẫn trong sổ từ.

### 13.1. Dữ liệu

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `cards.phonetic` | `text` null | IPA, ví dụ `/juːˈbɪkwɪtəs/` |
| `cards.audio_url` | `text` null | URL file phát âm (mp3), null khi từ không có bản ghi |

Không lưu audio vào Storage của Supabase: file là tài sản công khai của Wikimedia, lưu URL để khỏi nhân bản dữ liệu và khỏi tốn quota.

### 13.2. Nguồn — số đo thật, không phải giả định

| Nguồn | Đo được | Dùng? |
|---|---|---|
| dictionaryapi.dev | lần 1: 200 sau **20s**; lần 2: **522** — CDN của họ cũng 522 | ❌ bỏ: không ổn định |
| Wiktionary Action API (`{{IPA\|en\|/…/}}`) | ~0.8–1.1s | ✅ nguồn IPA |
| Wikimedia Commons (`File:En-us-<word>.ogg`) | ~1s; file `.ogg` **13195 bytes** | ✅ nguồn audio |
| `…/transcoded/…/En-us-<word>.ogg.mp3` | **200**, `audio/mpeg`, **23113 bytes** | ✅ dùng bản mp3 (Safari/iOS không phát ogg) |
| Web Speech API | có sẵn trong browser, **157 giọng** ở máy test (47 giọng Anh) | ✅ đường phát mặc định, không cần mạng |

Cả 3 endpoint Wikimedia đều trả `access-control-allow-origin: *` khi thêm `origin=*` → gọi được từ browser, không cần proxy, không cần key.

### 13.3. Luồng

```
Lấy phát âm  →  Wiktionary (IPA)  ║  Commons (file ogg → URL mp3)     [song song, timeout 8s]
             →  điền vào 2 cột phonetic + audio_url;  cả hai đều rỗng ⇒ "Không tra được phát âm cho từ này. Nhập tay giúp."

Nghe  →  có audio_url ⇒ <audio>.play()   (mp3 trên Wikimedia)
      →  play() lỗi/không có audio_url ⇒ speechSynthesis (en-US, rate 0.95)
      →  máy không có TTS ⇒ im lặng, không báo lỗi (không phải lỗi của dữ liệu)
```

Người dùng sửa được cả IPA và nghe lại trước khi lưu.

### 13.4. Hình thức

- IPA nằm **ngay dưới headword**, màu `ink-soft`: trên thẻ ôn 15px, trong sổ từ 13px.
- Nút `Nghe` là ô nhỏ viền `line-strong`, chữ `ink-soft`, đặt cạnh headword — **không dùng icon loa** (giữ luật "chữ làm việc đó"), `aria-label="Nghe <từ>"`.
- Trong sổ từ, IPA là dòng phụ của cột "Từ" nên **không thêm cột mới**; cột "Phát âm" trong form là nơi nhập/sửa.
- Từ chưa có IPA thì không hiện dòng đó — không hiện "—".

### 13.5. Giới hạn đã biết

- Từ không có file trên Commons (ví dụ `eloquent`) ⇒ chỉ có TTS, `audio_url` null. Đúng thiết kế, không phải lỗi.
- IPA lấy bản phonemic **đầu tiên** trong template Wiktionary (có thể là giọng RP hoặc GA tuỳ từ) — người dùng sửa tay nếu muốn giọng khác.
- Cần mạng cho lần tra và cho mp3; TTS thì không.
- Giọng TTS phụ thuộc máy (macOS/iOS đọc khá tốt, Android tuỳ máy).


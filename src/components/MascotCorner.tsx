import { Mascot } from 'page-mascot'
import directions from '../assets/mascot/knight-directions.webp'
import reactions from '../assets/mascot/knight-reactions.webp'

/**
 * Linh vật ở góc dưới bên phải: nhìn theo con trỏ, nháy mắt khi bấm.
 *
 * `showFrom` là lớp hiện của Tailwind (phải viết literal ở chỗ gọi để Tailwind sinh ra).
 * Mốc phải đủ rộng để linh vật không đè lên cột nội dung đang canh giữa — cột càng hẹp
 * thì hiện được càng sớm: 1400px cho trang có cột 56rem, 680px cho trang đăng nhập (23rem).
 */
export function MascotCorner({ showFrom = 'min-[1400px]:block' }: { showFrom?: string }) {
  return (
    <div className={`fixed right-4 bottom-3 z-20 hidden ${showFrom}`}>
      <Mascot directions={directions} reactions={reactions} size={112} label="linh vật" />
    </div>
  )
}

# PROGRESS - LINGUACLAY

## Trạng thái tổng quan
- To do: 38
- Doing: 0
- Done: 0
- Cập nhật: 23/04/2026

---

## To do

### A. Backend/API
- [ ] Thêm phân trang server-side cho `/api/payment/history` (`page`, `pageSize`, `total`) để tránh trả về toàn bộ đơn.
- [ ] Dịch chuyển lọc/truy vấn (trạng thái, khoảng thời gian, mã đơn) từ frontend về API, không lọc thuần client.
- [ ] Chuẩn hóa response UTF-8 ở toàn bộ API payment/refund để loại bỏ lỗi text vỡ mã.
- [ ] Tạo endpoint chi tiết đơn (`/api/payment/orders/[id]`) chỉ select các trường cần thiết.
- [ ] Thêm timeout + retry có kiểm soát cho API verify thanh toán để tránh "load mãi".

### B. Database/Prisma
- [ ] Rà soát và tạo index cho các truy vấn thực tế: `Order(userId, createdAt desc)`, `RefundRequest(orderId, createdAt desc)`.
- [ ] Chuẩn hóa enum cho `Order.status`, `RefundRequest.status`, `User.proType` (tránh string tự do).
- [ ] Tách dữ liệu "snapshot hiển thị" và "lịch sử sự kiện" (Order vs PaymentEvent) để query nhanh hơn.
- [ ] Xác nhận index `UserDailyStudy(userId, date)` đã apply trên production DB.
- [ ] Thiết lập policy dọn dữ liệu sự kiện cũ (retention) cho `PaymentEvent` để DB không phình.

### C. Frontend Realtime (Study Time)
- [ ] Giữ cơ chế chỉ cộng giờ khi user đang active (visible + focus + recent interaction).
- [ ] Flush giây pending khi blur/pagehide/logout để giảm mất dữ liệu cuối phiên.
- [ ] Giảm re-render: tách context study-time khỏi vùng layout lớn, chỉ subscribe ở component cần hiển thị.
- [ ] Thống nhất một nhịp đồng bộ (heartbeat + refresh) để tránh request chồng.
- [ ] Kiểm tra reset 00:00 GMT+7 ở cả client và server.

### D. Checkout/Payment UX
- [ ] Đảm bảo luồng "Kiểm tra thanh toán" dùng `POST + no-store`, mỗi lần bấm đều gọi request mới.
- [ ] Khi user bấm "Huỷ đơn", gọi API hủy về PayOS trước, sau đó mới điều hướng về plans.
- [ ] Bỏ các điều hướng thừa sang trang PayOS nếu đang chạy checkout trên UI nội bộ.
- [ ] Đồng bộ màu sắc/badge/trạng thái theo design system (đỏ là accent chính).
- [ ] Thêm trạng thái lỗi rõ ràng cho từng case: timeout, pending, cancelled, verify-failed.

### E. Quan sát hiệu năng & ổn định
- [ ] Gắn logging request duration cho API quan trọng (`study-time`, `payment/history`, `verify`, `refund`).
- [ ] Bật theo dõi Web Vitals (LCP, INP, CLS) cho dashboard.
- [ ] Thêm cảnh báo khi API > ngưỡng (ví dụ >800ms) để phát hiện nghẽn sớm.
- [ ] Thiết lập checklist regression trước mỗi lần deploy (auth, plans, checkout, history, refund).
- [ ] Chuẩn hóa script benchmark nội bộ (smoke load test cho API chính).

### F. Frontend Loading UX Map
- [ ] Thiết lập nguyên tắc loading chung: chỉ hiện loading sau ~200ms để tránh nhấp nháy.
- [ ] Chuẩn hóa token giao diện loading (nền kem, viền đen, góc vuông, animation nhẹ).
- [ ] Dashboard: thêm skeleton cho KPI cards.
- [ ] Dashboard: thêm skeleton cho chart blocks.
- [ ] Flashcards list: thêm skeleton grid theo đúng số cột responsive.
- [ ] Flashcards list: khi đổi filter/search, giữ dữ liệu cũ + overlay loading nhẹ.
- [ ] Study player: chỉ loading phần nội dung thẻ kế tiếp, không skeleton toàn trang.
- [ ] Plans: thêm skeleton cho 3 card gói và FAQ/social proof.
- [ ] Checkout: thêm skeleton cho QR block và thông tin đơn hàng.
- [ ] Checkout: chuẩn hóa button loading cho “Kiểm tra thanh toán” và disable trạng thái đúng.
- [ ] Payment history: thêm skeleton cho tbody theo số dòng.
- [ ] Payment history: filter đổi điều kiện chỉ loading phần bảng, không trắng toàn màn hình.
- [ ] Settings: thêm skeleton cho hồ sơ user, khối PRO/refund, và card study-time lúc fetch ban đầu.

### G. AI Tutor - 3 Modes (UX rõ ràng, không gây ngợp)
- [ ] Tạo mode switch rõ ràng ở đầu trang AI Tutor: `The Editor` / `Roleplay` / `Free Talk & Q&A` (hiển thị active state rõ).
- [ ] Mặc định mở mode `The Editor` để user mới vào có việc làm ngay, không thấy ô trống vô định.
- [ ] Thiết kế prompt + response schema riêng cho từng mode, không dùng chung một template.

#### G1. Mode 1 - The Editor (Sửa lỗi)
- [ ] Input: user dán/gõ đoạn tiếng Anh tự do.
- [ ] Output: không trả lời nội dung hội thoại; chỉ trả về bản đã sửa theo định dạng:
  - Sai: gạch ngang (`~~wrong~~`)
  - Đúng: in đậm (`**correct**`)
- [ ] Thêm mục `Giải thích nhanh (VI)` 1-3 dòng, tập trung vào lỗi quan trọng nhất.
- [ ] Chặn phản hồi sáo rỗng; ưu tiên ngắn gọn và có tính hành động.

#### G2. Mode 2 - Roleplay (Nhập vai tình huống)
- [ ] Hiển thị sẵn 3-4 thẻ tình huống để chọn nhanh (VD: phỏng vấn, trả giá, báo cáo tiến độ, gọi điện xác nhận lịch).
- [ ] Khi user chọn tình huống, AI tự mở lời trong vai đối phương và giữ đúng ngữ cảnh xuyên suốt.
- [ ] Mỗi lượt trả lời của AI cần đẩy hội thoại tiến lên (không lặp lại câu hỏi cũ).
- [ ] Có nút `Đổi tình huống` và `Bắt đầu lại` để reset nhanh.

#### G3. Mode 3 - Free Talk & Q&A (Hỏi đáp tự do)
- [ ] Cho phép user hỏi kiến thức ngữ pháp/từ vựng/phân biệt cách dùng.
- [ ] AI phải trả lời theo format: `Kết luận ngắn` -> `Ví dụ` -> `Lưu ý hay nhầm`.
- [ ] Cấm văn phong sáo rỗng; ưu tiên ngôn ngữ đơn giản, trực diện, dễ nhớ.
- [ ] Có mục `Câu hỏi gợi ý` để user không bị bí khi bắt đầu.

#### G4. Kỹ thuật & chất lượng
- [ ] Tách API route theo mode hoặc có bộ điều phối mode rõ ràng ở backend.
- [ ] Thêm logging theo mode (số lượt dùng, thời lượng, completion rate) để đo mức độ hữu ích.
- [ ] Viết test cho formatter của `The Editor` (đảm bảo render đúng markdown strikethrough/bold).
- [ ] Viết E2E happy-path cho 3 mode (chọn mode -> nhập -> nhận phản hồi đúng format).

---

## Admin Panel UI Blueprint

### 1. Tổng quan & Thống kê
- Bố cục 2 hàng.
- Hàng 1: 4 KPI cards ngang nhau: `User mới`, `DAU/MAU`, `MRR`, `Tổng doanh thu`.
- Hàng 2: 2 biểu đồ:
  - Trái: biểu đồ đường tăng trưởng user theo thời gian.
  - Phải: biểu đồ cột doanh thu theo gói.
- Góc trên có bộ lọc thời gian: `Hôm nay` / `7 ngày` / `30 ngày` / `Tùy chỉnh`.

### 2. Quản lý Học liệu
- Sidebar phụ bên trái để chuyển nhanh: `Flashcard` / `Ngữ pháp` / `Media`.
- Khu vực chính là bảng dữ liệu + thanh tìm kiếm.
- Action bar: `Import CSV` + `Thêm mới`.
- Mỗi dòng có thao tác inline: `Sửa` / `Xóa` (không mở modal riêng nếu không cần).

### 3. Quản lý Người dùng
- Bảng danh sách user gồm cột:
  - `Avatar + Tên`
  - `Email`
  - `Gói hiện tại`
  - `Streak`
  - `Trạng thái`
  - `Hành động`
- Click vào user mở panel chi tiết bên phải (không chuyển trang), hiển thị:
  - Tiến độ SRS
  - Nút `Kích hoạt PRO` / `Hủy PRO`

### 4. Quản lý Thanh toán
- Phần trên: 3 ô tóm tắt:
  - `Tổng đơn hôm nay`
  - `Thành công`
  - `Chờ xử lý`
- Phần dưới: bảng giao dịch có filter theo `trạng thái` và `khoảng thời gian`.
- `Coupon` tách tab riêng:
  - Bảng danh sách mã
  - Nút tạo mã mới với form: `Tên mã`, `% giảm`, `Ngày hết hạn`, `Số lượt dùng tối đa`.

### 5. Kiểm soát AI
- Có 2 tab rõ ràng:
  - `Cost Tracking`: biểu đồ token theo ngày + ước tính chi phí USD, cảnh báo đỏ khi vượt budget.
  - `Chat Logs`: bảng hội thoại, click để mở toàn bộ nội dung chat, có cờ `Cần xem lại` để lọc.

### 6. Layout tổng thể Admin
- Sidebar trái cố định với 5 module (icon + tên).
- Header topbar hiển thị tên admin + nút đăng xuất.
- Đồng bộ nhận diện với hệ thống chính:
  - Nền kem
  - Góc vuông
  - Font serif/sans-serif hiện tại
  - Giữ phong cách brutalist nhất quán, không tách visual language.

---

## Doing
- Chưa có hạng mục đang triển khai.

---

## Done
- Chưa có hạng mục hoàn thành.

---

## Thứ tự ưu tiên triển khai
1. Tối ưu `payment/history` (phân trang + lọc server-side).
2. Chuẩn hóa verify/cancel payment (POST no-store + timeout + trạng thái rõ).
3. Giảm re-render `StudyTimeProvider` và chốt heartbeat strategy.
4. Dọn encoding UTF-8 toàn bộ API/user-facing message.
5. Thêm logging/metrics + ngưỡng cảnh báo.

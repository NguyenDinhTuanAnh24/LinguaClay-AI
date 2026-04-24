# KẾ HOẠCH PHÁT TRIỂN LINGUACLAY

Dự án LinguaClay là nền tảng học ngoại ngữ ứng dụng AI và phương pháp lặp lại ngắt quãng (SRS), được thiết kế theo phong cách giao diện **Brutalist** hiện đại và mạnh mẽ.

---

## I. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)
- **Phong cách:** Brutalist (thô mộc).
- **Đặc trưng:**
  - Đường viền đen dày (`border-[3px]` hoặc `border-[4px]`).
  - Đổ bóng cứng, không lan tỏa (hard shadow).
  - Typography mạnh mẽ (font serif cho tiêu đề, sans-serif cho nội dung).
  - Bảng màu: kem nhạt (`#F5F0E8`), đen newsprint, trắng, đỏ nhấn (`red-600`).

---

## II. GIAO DIỆN MARKETING (PHẦN NGOÀI)
### 1. Trang Landing Page
- **Hero section:** Tiêu đề lớn, CTA mở Auth Drawer, demo sản phẩm thực tế.
- **Tính năng (Features):** AI Tutor, Smart SRS, Grammar Correction.
- **Bảng giá (Pricing):** Free, 3 tháng, 6 tháng, 1 năm.
- **Đánh giá (Testimonials):** Card feedback từ người dùng.

### 2. Trang Tin Tức (Blog)
- Danh sách bài viết mẹo học tập, phương pháp SRS.
- Trang chi tiết bài viết đồng bộ thiết kế Brutalist.

### 3. Trang Hỗ Trợ
- FAQ (câu hỏi thường gặp).
- Liên hệ (contact form).
- Điều khoản và chính sách bảo mật.

---

## III. GIAO DIỆN ỨNG DỤNG (PHẦN TRONG - DASHBOARD)
### 1. Trung tâm điều khiển (Dashboard)
- Biểu đồ tiến độ học tập.
- Nhiệm vụ hằng ngày (daily quests) và streak học tập.

### 2. Trình học AI Tutor
- **Roleplay:** Tình huống thực tế (sân bay, nhà hàng, phỏng vấn).
- **Phản hồi tức thì:** AI phát hiện lỗi ngữ pháp và gợi ý sửa ngay trong chat.
- **Voice interaction:** Giao tiếp bằng giọng nói (STT/TTS).

### 3. Hệ thống thẻ nhớ (Smart Flashcards)
- **SRS:** Tự động lên lịch ôn tập theo mức độ ghi nhớ.
- **Tạo thẻ tự động:** Tạo thẻ từ từ vựng mới trong hội thoại AI.

### 4. Phân tích và thống kê (Analytics)
- Điểm độ trôi chảy (Fluency Score).
- Sổ tay lỗi sai (Mistake Log) tự động tổng hợp.

---

## IV. HỆ THỐNG KỸ THUẬT & TÍNH NĂNG CHÌM
- **Xác thực (Auth):**
  - Email/Password + Google OAuth.
  - Slide-in Auth Drawer.
  - Quên mật khẩu và ghi nhớ đăng nhập.
- **Cơ sở dữ liệu:** Supabase (Auth/DB) + Prisma (ORM).
- **Đồng bộ hóa:** Tiến trình học tập thời gian thực giữa web và mobile.
- **Thanh toán:** Tích hợp cổng thanh toán cho các gói Premium.

---

## V. LỘ TRÌNH THỰC HIỆN (ROADMAP)
1. **Giai đoạn 1:** Hoàn thiện giao diện Marketing và Auth.
2. **Giai đoạn 2:** Xây dựng Dashboard và giao diện AI Tutor.
3. **Giai đoạn 3:** Xây dựng Flashcard SRS và đồng bộ dữ liệu.
4. **Giai đoạn 4:** Tích hợp thanh toán và tối ưu trải nghiệm người dùng.

---

## VI. CHI TIẾT CẢI TIẾN GIAO DIỆN DASHBOARD (ĐỒNG BỘ BRUTALIST)
### 1. Bố cục và sidebar
- Sidebar dùng viền đậm, trạng thái active rõ ràng.
- Nền dashboard đồng bộ màu kem `#F5F0E8`.

### 2. Thẻ nội dung (cards)
- Viền dày 3px + bóng cứng.
- Hover có dịch chuyển nhẹ và tăng bóng đổ.

### 3. Giao diện chat AI
- Message bubble dạng khung vuông mạnh mẽ.
- Input field đồng bộ kiểu brutalist.

### 4. Analytics UI
- Heatmap viền rõ, tương phản cao.
- Progress bar dạng thanh ngang đặc, không bo góc.

### 5. UI elements
- Nút bấm đồng bộ kiểu chữ uppercase và bóng đổ.
- Modal tối giản, tập trung nội dung.

---

## VII. TIẾN ĐỘ & CHECKLIST
Checklist tối ưu đã tách riêng tại file: **`PROGRESS.md`**.

---
## VIII. ĐỊNH HƯỚNG AI TUTOR (BẢN Ý TƯỞNG THỰC THI)
### 1. Real-time Editor (Biên tập viên thời gian thực)
- **Mục tiêu:** Biến AI Tutor thành công cụ chấm/sửa bài viết thay vì chat lan man.
- **Luồng chính:**
  - User nhập đoạn văn tiếng Anh và bấm `Kiểm tra`.
  - AI trả về ngay trên chính đoạn văn đã nhập:
    - Từ/cụm sai: `~~gạch ngang~~`
    - Từ/cụm đúng: `**in đậm**`
  - Kèm chú thích ngắn bằng tiếng Việt giải thích lỗi ngữ pháp/từ vựng.
- **Nguyên tắc phản hồi:**
  - Không trả lời lại nội dung theo kiểu hội thoại.
  - Ưu tiên sửa lỗi có tác động lớn trước (thì, giới từ, từ loại, collocation).
  - Giải thích ngắn, rõ, tránh thuật ngữ khó.

### 2. Context-Aware SRS (Ép dùng từ vựng theo ngữ cảnh)
- **Mục tiêu:** Kết nối AI Tutor với Flashcard/SRS để chuyển từ vựng từ "nhận diện" sang "sử dụng chủ động".
- **Luồng chính:**
  - AI Tutor đọc `UserProgress` để lấy nhóm từ user vừa học/đến hạn trong ngày.
  - AI mở chủ đề hội thoại liên quan và yêu cầu user dùng tối thiểu `2 từ mục tiêu`.
  - Nếu user chưa dùng đủ, AI nhắc đúng trọng tâm và gợi ý cách cài từ vào câu.
- **Tiêu chí thành công:**
  - User dùng đúng ngữ cảnh ít nhất 2 từ.
  - Từ được dùng đúng có thể được đánh dấu để tăng tín hiệu mastery cho vòng SRS tiếp theo.

### 3. Scenario Roleplay (Nhập vai tình huống)
- **Mục tiêu:** Gỡ rào cản "không biết bắt đầu từ đâu" bằng kịch bản có sẵn.
- **Luồng chính:**
  - Cung cấp thư viện thẻ bối cảnh (VD: trả giá chợ đêm, phỏng vấn IT, thuyết trình dự án).
  - Khi chọn thẻ, AI vào vai đối phương (HR/khách hàng/đồng nghiệp) với giọng điệu phù hợp.
  - Hội thoại chạy theo số lượt xác định trước (ví dụ 6-10 lượt), sau đó AI tổng kết.
- **Kết thúc phiên:**
  - Chấm điểm ngắn gọn theo tiêu chí: rõ ý, đúng ngữ pháp, tự nhiên, dùng từ phù hợp.
  - Đưa 2-3 gợi ý cải thiện cụ thể cho lần luyện tiếp theo.

### 4. Reverse Translation Challenge (Dịch thuật ngược)
- **Mục tiêu:** Rèn phản xạ dịch Việt -> Anh, tập trung độ tự nhiên của câu.
- **Luồng chính:**
  - AI đưa một câu tiếng Việt giao tiếp thực tế.
  - User dịch sang tiếng Anh.
  - AI đánh giá mức tự nhiên (native-like), chỉ ra lỗi chọn từ/cấu trúc.
  - AI gợi ý thêm 2-3 cách nói tự nhiên hơn theo ngữ cảnh.
- **Nguyên tắc phản hồi:**
  - Ưu tiên ví dụ ngắn, dùng được ngay.
  - Nêu rõ khác biệt giữa câu "đúng ngữ pháp" và câu "tự nhiên khi giao tiếp".

### 5. Ưu tiên triển khai đề xuất
1. Real-time Editor (tác động tức thì, dễ đo hiệu quả).
2. Scenario Roleplay (tăng thời lượng học và khả năng duy trì).
3. Context-Aware SRS (kết nối sâu với lõi sản phẩm).
4. Reverse Translation Challenge (mở rộng bài tập có gamification nhẹ).

---
*Cập nhật lần cuối: 24/04/2026*

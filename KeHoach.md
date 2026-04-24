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
*Cập nhật lần cuối: 23/04/2026*

# KẾ HOẠCH PHÁT TRIỂN LINGUACLAY 🚀

Dự án LinguaClay là nền tảng học ngoại ngữ ứng dụng AI và phương pháp lặp lại ngắt quãng (SRS), được thiết kế theo phong cách giao diện **Brutalist** hiện đại và mạnh mẽ.

---

## I. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)
- **Phong cách:** Brutalist (Thô mộc).
- **Đặc trưng:** 
    - Đường viền đen dày (`border-[3px]` hoặc `border-[4px]`).
    - Đổ bóng cứng, không lan tỏa (Hard shadows).
    - Typography mạnh mẽ (Font Serif cho tiêu đề, Sans-serif cho nội dung).
    - Bảng màu: Kem nhạt (`#F5F0E8`), Đen Newsprint, Trắng, Đỏ nhấn (`red-600`).

---

## II. GIAO DIỆN MARKETING (PHẦN NGOÀI)
### 1. Trang Landing Page
- **Hero Section:** Tiêu đề lớn, CTA mở ngăn kéo Auth Drawer, demo sản phẩm thực tế.
- **Tính năng (Features):** Lưới giới thiệu AI Tutor, Smart SRS, Grammar Correction.
- **Bảng giá (Pricing):** 4 gói (Free, 3 tháng, 6 tháng, 1 năm).
- **Đánh giá (Testimonials):** Các card feedback từ người dùng.

### 2. Trang Tin Tức (Blog)
- Danh sách bài viết mẹo học tập, phương pháp SRS.
- Chi tiết bài viết đồng bộ thiết kế Brutalist.

### 3. Trang Hỗ Trợ
- FAQ (Câu hỏi thường gặp).
- Liên hệ (Contact form).
- Điều khoản & Chính sách bảo mật.

---

## III. GIAO DIỆN ỨNG DỤNG (PHẦN TRONG - DASHBOARD)
### 1. Trung Tâm Điều Khiển (Dashboard)
- BIểu đồ tiến độ học tập (Vocabulary Heatmap).
- Nhiệm vụ hằng ngày (Daily Quests) & Streak học tập.

### 2. Trình Học AI Tutor (AI-Powered Learning)
- **Roleplay:** Nhập vai tình huống thực tế (Sân bay, Nhà hàng, Phỏng vấn).
- **Phản hồi tức thì:** AI tự động phát hiện lỗi sai ngữ pháp và gợi ý sửa ngay trong lúc chat.
- **Voice Interaction:** Giao tiếp bằng giọng nói (STT & TTS).

### 3. Hệ Thống Thẻ Nhớ (Smart Flashcards)
- **Thuật toán SRS:** Tự động lên lịch ôn tập dựa trên mức độ ghi nhớ.
- **Tự động tạo thẻ:** Người dùng có thể tạo thẻ trực tiếp từ các từ vựng mới trong cuộc hội thoại với AI.

### 4. Phân Tích & Thống Kê (Analytics)
- Điểm đánh giá độ trôi chảy (Fluency Score).
- Sổ tay lỗi sai (Mistake Log) tự động tổng hợp các cấu trúc ngữ pháp dùng sai.

---

## IV. HỆ THỐNG KỸ THUẬT & TÍNH NĂNG "CHÌM"
- **Xác thực (Auth):**
    - Email/Password + Google OAuth.
    - Slide-in Auth Drawer (Ngăn kéo đăng nhập tích hợp).
    - Quên mật khẩu & Ghi nhớ đăng nhập.
- **C sở dữ liệu:** Supabase (Auth/DB) + Prisma (ORM).
- **Đồng bộ hóa:** Đồng bộ tiến trình học tập thời gian thực giữa Web và Mobile.
- **Thanh toán:** Tích hợp cổng thanh toán (Stripe/Momo) cho các gói Premium.

---

## V. LỘ TRÌNH THỰC HIỆN (ROADMAP)
1. **Giai đoạn 1:** Hoàn thiện giao diện Marketing & Hệ thống Auth (Đã hoàn thành 90%).
2. **Giai đoạn 2:** Xây dựng Dashboard & Giao diện Chat với AI Tutor.
3. **Giai đoạn 3:** Xây dựng thuật toán Flashcard SRS & Đồng bộ hóa dữ liệu.
4. **Giai đoạn 4:** Tích hợp thanh toán và tối ưu hóa trải nghiệm người dùng.

---

## VI. CHI TIẾT CẢI TIẾN GIAO DIỆN DASHBOARD (ĐỒNG BỘ BRUTALIST)
Để đồng bộ với Landing Page, giao diện bên trong sẽ được cải tiến như sau:

### 1. Bố cục & Sidebar
- **Sidebar "Cột Báo":** Sử dụng `border-r-[3px]` màu đen. Các mục Menu khi được chọn sẽ có nền đen chữ trắng (giống tab active ở Auth Drawer).
- **Màu nền:** Chuyển toàn bộ nền Dashboard sang màu kem nhạt `#F5F0E8` để thống nhất trải nghiệm từ ngoài vào trong.

### 2. Thẻ nội dung (Cards)
- **Phong cách Card Blog:** Các khung hiển thị nhiệm vụ, từ vựng sử dụng viền dày 3px và đổ bóng cứng `shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]`.
- **Hiệu ứng vật lý:** Thêm hiệu ứng `hover:-translate-y-1` và tăng độ dày bóng đổ khi người dùng tương tác với bài học.

### 3. Giao diện Chat AI
- **Message Bubbles:** Thay thế bong bóng bo tròn bằng các khung hình chữ nhật "Post-it" sắc cạnh.
    - AI: Khung trắng, viền đen.
    - Người dùng: Khung đen chữ trắng hoặc khung màu giấy ghi chú.
- **Input Field:** Thiết kế ô nhập liệu đồng bộ với trang Đăng nhập (Nền kem, viền dày, font chữ Sans Bold).

### 4. Hệ thống Phân tích (Analytics UI)
- **Brutalist Heatmap:** Các ô vuông thống kê học tập có viền đen mảnh sắc nét, màu sắc chuyển từ kem sang đen.
- **Thanh tiến độ (Progress Bar):** Dạng thanh ngang đặc, không bo góc, hiển thị phần trăm bằng font `font-black`.

### 5. Thành phần điều khiển (UI Elements)
- **Nút bấm:** Đồng bộ hoàn toàn về font chữ (Uppercase, Tracking-widest) và hiệu ứng bóng đổ với các nút trên Landing Page.
- **Modals:** Các cửa sổ Pop-up từ vựng sẽ có thiết kế giống Auth Drawer, ưu tiên sự tối giản và mạnh mẽ.

---
*Cập nhật lần cuối: 22/04/2026*

# 🚀 Hướng dẫn thiết lập Upstash Redis (Rate Limiting & Caching)

Tài liệu này hướng dẫn cách lấy và cấu hình các khóa Redis để kích hoạt tính năng **Bảo mật (Chống spam)** và **Tăng tốc ứng dụng (Caching)** cho dự án LinguaClay.

---

## 1. Tại sao cần thiết lập này?
Trong mã nguồn hiện tại, mình đã tích hợp bộ đôi:
- **`lib/rate-limit.ts`**: Tự động chặn các IP gửi yêu cầu quá nhanh đến API AI và Thanh toán.
- **`lib/cache.ts`**: Lưu trữ tạm thời các dữ liệu nặng (như danh sách Flashcard) để phản hồi ngay lập tức.

Nếu không có các khóa này, hệ thống sẽ dùng bộ nhớ tạm của server (In-memory), bộ nhớ này sẽ bị xóa mỗi khi bạn restart ứng dụng hoặc deploy lên Vercel.

---

## 2. Các bước thực hiện (Hoàn toàn miễn phí)

### Bước 1: Tạo tài khoản Upstash
1. Truy cập [https://console.upstash.com/](https://console.upstash.com/).
2. Đăng ký bằng tài khoản **GitHub** hoặc **Google** để bỏ qua bước xác thực email phức tạp.

### Bước 2: Tạo Database Redis
1. Tại màn hình Console, nhấn nút **"Create Database"**.
2. **Name**: Nhập `linguaclay-redis`.
3. **Type**: Chọn `Regional`.
4. **Region**: Chọn `ap-southeast-1` (Singapore) để có tốc độ nhanh nhất về Việt Nam.
5. **Eviction**: Để mặc định (Disabled).
6. Nhấn **"Create"**.

### Bước 3: Lấy khóa kết nối (Credentials)
1. Sau khi database được tạo, cuộn xuống phần **"REST API"**.
2. Tại đây, bạn sẽ thấy tab **".env"**. Hãy copy 2 dòng sau:

```env
UPSTASH_REDIS_REST_URL="https://xxx-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."
```

---

## 3. Cấu hình vào dự án
Mở file `.env` ở thư mục gốc của dự án và dán 2 khóa đã copy vào cuối file:

```env
# Upstash Redis — Kích hoạt Rate Limiting & Caching
UPSTASH_REDIS_REST_URL=https://nơi-bạn-vừa-copy.upstash.io
UPSTASH_REDIS_REST_TOKEN=mã-token-bạn-vừa-copy
```

---

## 4. Kiểm tra hoạt động
Sau khi thêm xong, bạn khởi động lại ứng dụng (`npm run dev`). Hệ thống sẽ tự động nhận diện:
- Nếu có Key: Logs sẽ không còn báo lỗi, bộ đếm Rate Limit sẽ được lưu trữ vĩnh viễn trên Upstash.
- Bạn có thể vào Console của Upstash để xem biểu đồ Request đang nhảy theo thời gian thực.

---

> **Lưu ý bảo mật:** Đừng bao giờ chia sẻ file `.env` hoặc các khóa này lên GitHub công khai.

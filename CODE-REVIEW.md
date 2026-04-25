# Đánh Giá Tiến Độ & Code Review: AI Language Learning

## Trạng Thái Dự Án (Cập nhật: 25/04/2026)
| Chỉ số | Trước Review | Hiện tại | Trạng thái |
|---|---|---|---|
| Lỗi TypeScript | 15+ | 0 | DONE |
| Lỗi ESLint (Unescaped/Unused) | 30+ | 0 | DONE |
| Bảo mật (Admin/Env) | Rủi ro cao | An toàn | DONE |
| File > 800 dòng | 3 | 0 | DONE |
| N+1 Query | Phổ biến | Đã xử lý lớp lõi + data loader | DONE |

---

## CÁC VẤN ĐỀ ĐÃ GIẢI QUYẾT (RESOLVED)

### 1. Bảo mật: Admin Email & Auth Hardening
- Trạng thái: DONE
- Chi tiết:
  - `ADMIN_EMAIL` đã đưa vào `.env`.
  - Đã sử dụng `ensureAdminActor` cho các admin API route.
  - Đã áp dụng rate limiting cho endpoint nhạy cảm (AI, Payment).

### 2. Chất lượng code & Build
- Trạng thái: DONE
- Chi tiết:
  - Build issue liên quan role/constants đã được xử lý.
  - Các lỗi quote/unused/chính tả lint đã được làm sạch.
  - Typecheck pass (`npm run typecheck`).

### 3. Cấu trúc & Maintenance
- Trạng thái: DONE (phase hiện tại)
- Chi tiết:
  - Refactor module học liệu admin: tách component theo tab.
  - Refactor module hỗ-trợ-hoàn-tiền: tách từ 842 dòng xuống ~329 dòng.
  - Logging/constant đã tập trung hóa theo hướng maintainable.

### 4. i18n (`next-intl`)
- Trạng thái: DONE (phase 1)
- Chi tiết:
  - Đã cấu hình đầy đủ `next-intl` App Router (`i18n/request.ts`, plugin trong `next.config.ts`).
  - Đã bổ sung provider ở root layout.
  - Đã rải `useTranslations` vào các UI chính của Marketing + Dashboard nav/header.
  - Đã cập nhật `messages/vi.json` và `messages/en.json`.

### 5. Validation tầng API (Zod)
- Trạng thái: DONE (phase 1)
- Chi tiết:
  - Đã validate payload chặt cho:
    - `app/api/ai/check-writing/route.ts`
    - `app/api/user/update-profile/route.ts`
    - `app/api/ai/tutor/editor/route.ts`
  - Đã xử lý case JSON payload không hợp lệ và trả về lỗi rõ ràng.

### 6. Repository Pattern (tách Prisma khỏi API Routes)
- Trạng thái: DONE (phase 1)
- Chi tiết:
  - Đã tạo/cập nhật repository:
    - `repositories/user.repository.ts`
    - `repositories/order.repository.ts`
    - `repositories/dashboard.repository.ts`
  - Đã refactor API route sang dùng repository:
    - `app/api/dashboard/recent/route.ts`
    - `app/api/user/me/route.ts`
    - `app/api/admin/payments/user-history/route.ts`

### 7. Data Loader cho tầng báo cáo
- Trạng thái: DONE (phase 1)
- Chi tiết:
  - Đã tạo report loader:
    - `services/reporting/ai-control.loader.ts`
    - `services/reporting/user-payment-report.loader.ts`
    - `services/reporting/admin-overview.loader.ts` (nền tảng)
  - Đã áp dụng vào trang báo cáo:
    - `app/admin/(panel)/kiem-soat-ai/page.tsx`
  - Đã tạo repository tổng hợp report:
    - `repositories/reporting.repository.ts`

---

## CÁC MỤC CÒN LẠI (PENDING)

### 1. Full Test Coverage
- Vấn đề:
  - Chưa có đầy đủ unit test cho logic AI transformation/sanitization.
  - Chưa có E2E test cho luồng thanh toán/refund.

### 2. Mở rộng Repository Pattern
- Vấn đề:
  - Một số API route (đặc biệt là mảng Materials/Flashcard) vẫn gọi `prisma` trực tiếp.
  - Cần tiếp tục migration dần cho các module: Payment, Support, Materials và các route Tutor khác.

### 3. Mở rộng i18n (Internationalization)
- Vấn đề:
  - Khung `next-intl` đã sẵn sàng, nhưng độ phủ chưa đạt 100%. Các trang quản trị Admin và các modal thông báo sâu vẫn đang dùng tiếng Việt cứng.
  - Cần bổ sung key và dùng `useTranslations` cho các tầng sâu hơn.

### 4. Mở rộng Data Loader cho Admin Overview
- Vấn đề:
  - Đã có `admin-overview.loader.ts` và `reporting.repository.ts`, nhưng hiện tại trang `app/admin/(panel)/page.tsx` vẫn chưa kết nối hoàn toàn với loader này.
  - Cần thay thế logic query inline ở trang tổng quan bằng kết quả từ loader.

---

## Lộ trình dài hạn (Long-term)
- [x] Repository Pattern: Đã triển khai Phase 1 (User, Order, Dashboard, Reporting).
- [x] Data Loader: Đã triển khai Phase 1 cho tầng báo cáo và Admin stats.
- [ ] Full Test Coverage: Chưa hoàn tất (Cần ưu tiên Unit test cho logic AI).

---
> Tổng kết: Dự án đã đạt bước tiến lớn về mặt kiến trúc. Hệ thống hiện tại đã có cấu trúc rõ ràng (Separation of Concerns), dễ mở rộng và bảo mật hơn. Ưu tiên tiếp theo là tăng độ phủ của i18n và Test Coverage.


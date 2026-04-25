# Đánh Giá Tiến Độ & Code Review: AI Language Learning

## Trạng thái dự án (Cập nhật: 25/04/2026)

| Chỉ số | Trạng thái hiện tại | Ghi chú |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` chạy thành công |
| ESLint | FAIL | `117 vấn đề` (`50 errors`, `67 warnings`) |
| next-intl config | DONE | Đã có `next-intl/plugin`, `i18n/request.ts`, `NextIntlClientProvider` |
| File quá lớn (`>800 dòng`) | CÒN 2 FILE | `components/dashboard/AITutorEditor.tsx` (2197), `app/dashboard/settings/page.tsx` (1069) |
| Repository Pattern | PHASE 1 | Đã có repository, nhưng còn nhiều API gọi `prisma` trực tiếp |
| Data Loader Admin Overview | DONE | `app/admin/(panel)/page.tsx` đã dùng `loadAdminOverviewData` |

---

## Các hạng mục đã xác nhận hoàn thành

### 1. Cấu hình i18n nền tảng (`next-intl`)
- Đã cấu hình plugin trong `next.config.ts`:
  - `createNextIntlPlugin('./i18n/request.ts')`
- Đã có file `i18n/request.ts` để resolve locale + messages.
- Đã bọc app bằng `NextIntlClientProvider` trong `app/layout.tsx`.

### 2. Data Loader cho Admin Overview
- `app/admin/(panel)/page.tsx` đã gọi:
  - `loadAdminOverviewData(...)`
- Đã có tầng repository:
  - `repositories/reporting.repository.ts`
- Trạng thái mục này: **DONE** (không còn query inline nặng trong trang admin overview như trước).

### 3. Refactor module Hỗ trợ & Hoàn tiền
- `app/admin/(panel)/ho-tro-hoan-tien/ui-client.tsx`: **305 dòng**.
- Mục tiêu tách file lớn ở module này đã đạt.

---

## Các vấn đề còn tồn tại (PENDING)

### 1. Chất lượng lint đang giảm mạnh
- Kết quả `npm run lint` hiện tại:
  - **50 lỗi**, **67 cảnh báo**
- Nhóm lỗi chính:
  - `@typescript-eslint/no-explicit-any`
  - `react-hooks/set-state-in-effect`
  - `react-hooks/purity`
  - nhiều `unused-vars`

### 2. Repository Pattern chưa phủ đủ
- Số route API còn import trực tiếp `@/lib/prisma`: **22 files**.
- Các cụm còn nặng:
  - `app/api/admin/materials/*`
  - `app/api/ai/tutor/*` (chat, speaking, listening, reading)
  - `app/api/user/*` (update-profile, upload-avatar, support-refund-history)
  - `app/api/admin/*` (coupons, users manage, refunds process, generate-*...)

### 3. Validation tầng API chưa đồng đều
- Tổng số route handlers trong `app/api`: **44**
- Số route có dùng `zod`: **5**
- Còn **39** route chưa có validation Zod rõ ràng ở tầng input.
- Dù một số route AI/User đã có Zod (ví dụ `check-writing`, `tutor/chat`, `tutor/editor`, `update-profile`, `payment/create-link`), độ phủ vẫn thấp.

### 4. i18n mới ở mức phase đầu
- Tổng file UI (`app` + `components`, `.tsx`): **95**
- File đang dùng `useTranslations`: **5**
- Vẫn còn nhiều UI hardcoded tiếng Việt/tiếng Anh (đặc biệt các trang admin, dashboard sâu, marketing pages).

### 5. Còn file rất lớn ảnh hưởng maintainability
- `components/dashboard/AITutorEditor.tsx` (2197 dòng)
- `app/dashboard/settings/page.tsx` (1069 dòng)

### 6. Test coverage chưa đạt
- Chưa thấy bộ test đủ sâu cho:
  - logic AI transformation/sanitization
  - luồng thanh toán/refund end-to-end

---

## Ưu tiên đề xuất (thứ tự thực thi)

1. Khôi phục trạng thái “xanh” cho lint (ưu tiên xử lý **errors** trước warnings).
2. Mở rộng Repository Pattern cho các cụm API đang gọi `prisma` trực tiếp.
3. Chuẩn hóa validation Zod cho toàn bộ route có body/query quan trọng.
4. Tiếp tục lan tỏa i18n (`useTranslations`) theo module.
5. Tách 2 file >800 dòng còn lại.

---

## Tổng kết

Tiến độ kiến trúc đã có cải thiện rõ ở phần Data Loader và nền tảng i18n, nhưng chất lượng tổng thể hiện tại chưa ổn định vì lint đang fail lớn và nợ kỹ thuật ở Repository Pattern/Validation/i18n vẫn còn nhiều. Trọng tâm ngắn hạn nên là đưa codebase về trạng thái “build + lint sạch”, sau đó mới mở rộng feature/refactor tiếp.

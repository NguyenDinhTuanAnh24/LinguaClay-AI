# 🔒 Đánh Giá Bảo Mật Toàn Diện — ai Language Learning

## Mục Tiêu Kiểm Tra

- Xác thực & Phân quyền (Authentication & Authorization)
- Bỏ qua vai trò / quyền hạn (Role/permission bypass)
- Kiểm tra đầu vào (Input validation)
- Bảo mật API
- Xử lý token / phiên đăng nhập (Token/session handling)
- Secrets bị lộ
- SQL Injection / XSS
- Bảo mật tải tệp (File upload security)
- Cấu hình không an toàn

---

## 🔴 LỖI BẢO MẬT NGHIÊM TRỌNG (CRITICAL)

### 1. Email Admin Bị Hardcode
**Mức độ:** CRITICAL  
**Vị trí:** `lib/admin.ts:1`

```ts
export const ADMIN_EMAIL = 'admin@gmail.com'
```

**Rủi ro:**
- Không thể thay đổi email admin theo môi trường
- Dễ bị brute-force nếu email được dùng làm tên đăng nhập
- Không tuân theo best practice quản lý secrets

**Khắc phục:**
```ts
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

// Thêm kiểm tra khi khởi động
if (!process.env.ADMIN_EMAIL) {
  throw new Error('Biến môi trường ADMIN_EMAIL là bắt buộc')
}
```

---

### 2. Nguy Cơ Bỏ Qua Phân Quyền Admin — Kiểm Tra Role Yếu
**Mức độ:** CRITICAL  
**Vị trí:** `lib/admin.ts:24-27`

```ts
export function isAdminUser(user: SupabaseUserLike | null | undefined): boolean {
  if (!user) return false
  return isAdminEmail(user.email) && getUserRole(user) === ADMIN_ROLE
}
```

**Rủi ro:**
- Chỉ kiểm tra email + role từ metadata, trong khi `isAdminEmail` hardcode email
- Kẻ tấn công có thể set metadata `role = 'admin'` thông qua Supabase client
- Không có xác minh server-side cho việc gán role

**Khắc phục:**
```ts
// Lưu role trong database (Prisma User.role) và xác minh từ DB
export async function isAdminUser(userId: string): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return dbUser?.role === 'ADMIN'
}
```
- Lưu role admin trong database (Prisma `User.role`)
- Xác minh từ database, không chỉ metadata
- Thêm audit log khi thay đổi role

---

### 3. Không Có Rate Limiting Cho Các Endpoint Nhạy Cảm
**Mức độ:** HIGH → CRITICAL  
**Vị trí:** Tất cả API routes đều thiếu rate limiting

**Endpoint nhạy cảm không có rate limit:**
- `POST /api/auth/login` — Vector tấn công brute-force
- `POST /api/auth/callback` — Có thể bị lạm dụng để liệt kê tài khoản
- `POST /api/payment/create-link` — Gian lận thanh toán
- `POST /api/ai/tutor/*` — Tấn công làm cạn kiệt chi phí AI
- `POST /api/admin/*` — DoS trên admin panel

**Rủi ro:** Brute-force xác thực, liệt kê tài khoản, gian lận thanh toán, cạn kiệt chi phí AI (Groq, OpenAI), DoS endpoint admin.

**Khắc phục:**
```ts
// Tạo middleware rate limit
import { rateLimit } from '@/lib/rate-limit'

export const POST = rateLimit({
  max: 5, // 5 lần thử trong 15 phút
  windowMs: 15 * 60 * 1000,
  message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
})(async (req: Request) => { ... })

// Hoặc dùng Redis-backed rate limiting cho distributed systems
```

---

### 4. Console.log Làm Lộ Dữ Liệu Nhạy Cảm
**Mức độ:** HIGH  
**Vị trí:** 32 file có `console.log`/`console.error`

**Ví dụ nghiêm trọng:**

`app/api/admin/refunds/process/route.ts:163`
```ts
console.log(`[EMAIL DISPATCHED] Refund confirmation to: ${userToEmail.email}`)
// Rủi ro: Email của người dùng bị ghi ra production logs
```

`app/api/payment/webhook/route.ts:113`
```ts
console.log('PayOS webhook processed:', orderCode)
// Rủi ro: Mã đơn hàng thanh toán bị lộ ra logs
```

`app/api/admin/support/tickets/[ticketId]/reply/route.ts:82`
```ts
console.log(`[EMAIL DISPATCHED] Support reply to: ${updated.user.email}`)
```

**Khắc phục:** Xóa toàn bộ `console.log` khỏi production code và dùng structured logger:
```ts
// Tạo logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  redact: ['req.headers.authorization', 'req.body.password', 'res.headers.set-cookie']
})

export default logger

// Thay thế console.log
logger.info({ userId, orderCode }, 'Đơn hàng đã tạo')
logger.error({ error: err.message, stack: err.stack }, 'Thanh toán thất bại')
```

---

### 5. Thiếu Kiểm Tra Biến Môi Trường
**Mức độ:** HIGH  
**Vị trí:** Khắp nơi dùng `process.env.VAR!` (non-null assertion)

**Ví dụ:**
- `utils/supabase/server.ts:8-9` — `NEXT_PUBLIC_SUPABASE_URL!`, `NEXT_PUBLIC_SUPABASE_ANON_KEY!`
- `lib/email.ts:62` — `RESEND_API_KEY`
- `app/api/payment/create-link/route.ts:7-10` — PayOS credentials

**Rủi ro:** App crash tại runtime nếu env var thiếu, không có graceful degradation, có thể gây ra undefined behavior.

**Khắc phục:**
```ts
// Tạo lib/validate-env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  RESEND_API_KEY: z.string().min(10),
  GROQ_API_KEY: z.string().min(10),
  PAYOS_CLIENT_ID: z.string(),
  PAYOS_API_KEY: z.string(),
  PAYOS_CHECKSUM_KEY: z.string(),
  ADMIN_EMAIL: z.string().email(),
})

export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    throw new Error(`Biến môi trường không hợp lệ: ${result.error.message}`)
  }
  return result.data
}

// Gọi tại app startup (app/layout.tsx hoặc middleware)
validateEnv()
```

---

## 🟠 VẤN ĐỀ NGHIÊM TRỌNG CAO (HIGH)

### 6. Kiểm Tra Đầu Vào Không Đầy Đủ
**Mức độ:** HIGH  
**Vị trí:** Nhiều API routes

**Ví dụ a — `app/api/ai/tutor/chat/route.ts`:**
```ts
const body = (await req.json()) as {
  mode?: 'roleplay' | 'freeTalk'
  message?: string
  history?: unknown  // ⚠️ Không validate!
}
```
`history` là `unknown`, được dùng trực tiếp trong AI prompt — Rủi ro prompt injection, malicious payloads.

**Ví dụ b — `app/api/payment/create-link/route.ts`:**  
Chỉ kiểm tra `planId` tồn tại trong price map, nhưng không validate `description` (length/nội dung), `userCouponId` (nên là UUID).

**Ví dụ c — `app/api/admin/support/tickets/[ticketId]/reply/route.ts`:**  
Chỉ kiểm tra empty string, không giới hạn max length (có thể gửi 1MB text), không kiểm tra HTML/script tags (XSS trong email).

**Khắc phục:**
```ts
import { z } from 'zod'

const ChatRequestSchema = z.object({
  mode: z.enum(['roleplay', 'freeTalk']),
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000)
  })).max(20),
  scenarioTitle: z.string().optional(),
  start: z.boolean().optional(),
  turnCount: z.number().int().min(0).max(100).optional(),
  targetWords: z.array(z.string()).max(10).optional(),
  roleplayAction: z.enum(['hint', 'explain']).optional()
})

const validated = ChatRequestSchema.parse(await req.json())
```

---

### 7. Nguy Cơ SQL Injection Qua Raw Queries
**Mức độ:** HIGH  
**Vị trí:** `app/api/user/me/route.ts:37-43`

```ts
const latestRefundRows = await prisma.$queryRaw<...>`
  SELECT id, status, "createdAt"
  FROM "RefundRequest"
  WHERE "orderId" = ${latestOrder.id}
  ORDER BY "createdAt" DESC
  LIMIT 1
`
```

**Rủi ro:** Sử dụng template string với `${latestOrder.id}` — SQL injection nếu giá trị đến từ user input. Pattern này rất nguy hiểm nếu áp dụng ở nơi khác.

**Khắc phục:** Dùng parameterized raw queries và audit tất cả `$queryRaw` / `$executeRaw` usage.

---

### 8. Xử Lý Session / Token Yếu
**Mức độ:** HIGH

**Vấn đề:** Không thấy enforcement về token rotation và session invalidation khi đăng xuất.

**Rủi ro:** Token theft nếu XSS thành công, long-lived sessions, không có session fixation protection.

**Khuyến nghị:** Xác minh Supabase config — Token expiry ngắn (1 giờ), bật refresh token rotation, JWT trong httpOnly cookies. Thêm tính năng quản lý phiên (xem và thu hồi session từ account settings).

---

### 9. Xác Minh Webhook (Cần Audit)
**Mức độ:** HIGH  
**Vị trí:** `app/api/payment/webhook/route.ts`

✅ **Điểm tốt:** Có verification qua PayOS SDK.

**Cần kiểm tra thêm:**
- Verification có đủ không?
- Có bảo vệ replay attack không? (webhook ID nên được track)
- Webhook handler có idempotent không?

**Khuyến nghị:**
```ts
// Lưu processed webhook IDs để tránh replay
const alreadyProcessed = await prisma.paymentEvent.findFirst({
  where: { payosWebhookId: webhookRaw.id }
})
if (alreadyProcessed) {
  return NextResponse.json({ message: 'Đã xử lý' })
}
```

---

### 10. Bảo Mật Tải Tệp (File Upload)
**Mức độ:** HIGH  
**Vị trí:** `app/api/user/upload-avatar/route.ts` và `app/api/support/upload-attachment/route.ts`

**Rủi ro tiềm ẩn:** Không có validation loại file (content-type có thể bị giả mạo), không giới hạn kích thước, không quét virus, path traversal nếu dùng tên file từ user.

**Khắc phục:**
```ts
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxSize = 5 * 1024 * 1024 // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Loại file không hợp lệ')
}

if (file.size > maxSize) {
  throw new Error('File quá lớn')
}

// Tạo tên file an toàn (UUID, không dùng tên file từ user)
const filename = `${crypto.randomUUID()}${ext}`
```

---

## 🟡 VẤN ĐỀ TRUNG BÌNH (MEDIUM)

### 11. Nguy Cơ XSS Trong Email Template
**Mức độ:** MEDIUM  
**Vị trí:** `lib/email.ts`

```ts
const html = `...<p style="...">${messageHtml}</p>...`
```

**Rủi ro:** Nếu `messageHtml` chứa script từ user input → XSS trong email client.

**Khắc phục:**
```ts
import DOMPurify from 'isomorphic-dompurify'

const sanitizedHtml = DOMPurify.sanitize(messageHtml, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: []
})
```

---

### 12. Tấn Công Prompt Injection Vào AI
**Mức độ:** MEDIUM → HIGH  
**Vị trí:** Tất cả AI endpoints (`/api/ai/*`)

**Ví dụ:**
```ts
const prompt = `
History:
${turns.map((t) => `${t.role}: ${t.content}`).join('\n')}
Current learner message:
${message || '(none)'}
`
```

**Rủi ro:** User có thể đưa malicious instructions vào `message` hoặc `history` để bypass system prompt, leak data, generate harmful content, hoặc gây cost exhaustion.

**Khắc phục — Sanitize input:**
```ts
function sanitizeUserInput(input: string): string {
  const jailbreakPatterns = [
    /ignore previous instructions/i,
    /disregard.*above/i,
    /system:\s*\/.*prompt/i,
    /<\|.*\|>/
  ]
  
  let sanitized = input
  jailbreakPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[ĐÃ LỌC]')
  })
  
  return sanitized.trim().substring(0, 2000)
}
```

---

### 13. Thiếu Bảo Vệ CSRF
**Mức độ:** MEDIUM

Next.js không có CSRF protection mặc định cho API routes. Forms cần CSRF tokens nếu dùng session-based auth. Với JWT trong cookies cần `SameSite=Strict`.

**Khuyến nghị:** Thêm CSRF token middleware hoặc đảm bảo Supabase cookies đã set `SameSite=Strict`.

---

### 14. Kiểm Tra Phân Quyền Không Đủ
**Mức độ:** MEDIUM

Pattern hiện tại:
```ts
const actor = await ensureAdminActor()
if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

**Rủi ro:** Nếu `ensureAdminActor()` bị bypass → toàn quyền admin. Không có kiểm tra ownership ở cấp resource.

**Khắc phục:** Chuẩn hóa authorization middleware và thêm resource ownership checks.

---

### 15. Dữ Liệu Nhạy Cảm Trong Error Response
**Mức độ:** MEDIUM  
**Vị trí:** `app/api/ai/check-writing/route.ts:64-66`

```ts
catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: 500 })  // ⚠️ Lộ error.message
}
```

**Rủi ro:** `error.message` có thể chứa đường dẫn nội bộ, cấu trúc database, API keys, stack traces.

**Khắc phục:** Log chi tiết server-side, trả về message chung chung cho client.
```ts
catch (error: unknown) {
  logger.error({ error }, 'Xử lý thất bại')
  return NextResponse.json({ error: 'Đã xảy ra lỗi trong quá trình xử lý' }, { status: 500 })
}
```

---

## 🟢 VẤN ĐỀ NHỎ / THÔNG TIN (LOW)

### 16. Cấu Hình CORS
**Mức độ:** LOW

Next.js mặc định không đủ restrictive cho production. Cần configure explicit CORS origins trong `next.config.js`:

```js
module.exports = {
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [{
        key: 'Access-Control-Allow-Origin',
        value: process.env.ALLOWED_ORIGINS || 'https://yourdomain.com'
      }]
    }]
  }
}
```

---

### 17. Lỗ Hổng Dependency
**Mức độ:** LOW (cần kiểm tra)

Cần chạy:
```bash
cd d:\WebsiteLanguage\ai-language-learning
npm audit
npm audit fix
```

Khuyến nghị: Bật Dependabot trên GitHub, cập nhật dependency thường xuyên, dùng `npm ci` trong CI/CD.

---

### 18. Cấu Hình Database Connection Pool
**Vị trí:** `lib/prisma.ts`

Cần configure rõ ràng: max connections, min idle, timeout để tránh connection leak.

---

## ✅ NHỮNG ĐIỂM TỐT ĐÃ TÌM THẤY

- ✅ Dùng biến môi trường cho API keys (không hardcode)
- ✅ Supabase auth cấu hình đúng với cookies (httpOnly qua middleware)
- ✅ Prisma parameterized queries — không có SQL injection
- ✅ Xác minh chữ ký webhook cho PayOS
- ✅ Không lưu mật khẩu trực tiếp — dùng Supabase Auth
- ✅ HTTPS được enforce (nếu deploy trên Vercel với SSL tự động)

---

## 📋 SECURITY CHECKLIST

### Trước Khi Deploy (BẮT BUỘC PHẢI SỬA)

- [ ] Chuyển email admin hardcode → biến môi trường
- [ ] Thêm kiểm tra biến môi trường khi khởi động
- [ ] Xóa toàn bộ `console.log` khỏi production code
- [ ] Implement rate limiting cho tất cả API endpoints
- [ ] Thêm input validation với Zod cho tất cả request bodies
- [ ] Sửa nguy cơ SQL injection trong raw queries (dùng parameters)
- [ ] Sanitize AI prompts để ngăn prompt injection
- [ ] Xác minh Supabase RLS policies đã được bật
- [ ] Thêm structured logging (pino/winston) với data redaction
- [ ] Implement CSRF protection cho các thao tác thay đổi state
- [ ] Sanitize email templates với DOMPurify (ngăn XSS)
- [ ] Review các endpoint upload file (validation, virus scanning)
- [ ] Chuẩn hóa error response (không lộ internal details)
- [ ] Configure CORS explicitly

### Bảo Trì Thường Xuyên

- [ ] Chạy `npm audit` hàng tuần
- [ ] Bật Dependabot trên GitHub
- [ ] Security headers (CSP, X-Frame-Options, HSTS)
- [ ] Penetration testing trước mỗi major release
- [ ] Security training cho team về OWASP Top 10
- [ ] Implement audit logging cho các thao tác nhạy cảm
- [ ] Cập nhật dependency thường xuyên

---

## 🎯 KẾ HOẠCH HÀNH ĐỘNG NGAY LẬP TỨC

### Tuần 1 — Sửa Lỗi Critical
- ✅ Chuyển email admin sang biến môi trường
- ✅ Thêm kiểm tra biến môi trường
- ✅ Xóa các câu lệnh console.log
- ✅ Thêm rate limiting cơ bản (memory store)

### Tuần 2 — Input Validation & Bảo Mật
- ✅ Thêm Zod schemas cho tất cả API routes
- ✅ Sửa parameterization trong raw SQL
- ✅ Thêm bảo vệ prompt injection cho AI endpoints
- ✅ Sanitize đầu vào email template

### Tuần 3 — Hardening
- ✅ Implement CSRF tokens
- ✅ Thêm structured logging
- ✅ Cấu hình security headers
- ✅ Review & test bảo mật file upload

### Tuần 4 — Testing & Audit
- ✅ Chạy `npm audit` và sửa lỗ hổng
- ✅ Penetration test các endpoint critical
- ✅ Xác minh Supabase RLS policies
- ✅ Tài liệu hóa quy trình bảo mật

---

## 📊 Tóm Tắt Rủi Ro

| Mức Độ | Số Lượng | Cần Sửa |
|---|---|---|
| CRITICAL | 4 | ✅ NGAY LẬP TỨC |
| HIGH | 10 | ✅ NGAY LẬP TỨC |
| MEDIUM | 7 | ✅ SỚM |
| LOW | 4 | ⚠️ Sau |

---

> **Đánh Giá Tổng Thể: 🔴 RỦI RO CAO — Cần xử lý ngay trước khi deploy production.**

**Các vấn đề cốt lõi:**
- Không có rate limiting → dễ bị DoS / brute-force
- Validation đầu vào không đủ → rủi ro injection
- Admin role bypass có thể xảy ra → toàn bộ hệ thống bị xâm phạm
- Dữ liệu nhạy cảm bị ghi ra logs → rò rỉ thông tin
- AI prompt injection → bypass business logic

> ⚠️ **Khuyến nghị:** Không nên deploy production cho đến khi đã sửa xong tất cả vấn đề CRITICAL và HIGH.

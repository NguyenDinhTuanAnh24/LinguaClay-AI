# 🏗️ KẾ HOẠCH TRIỂN KHAI — LINGUACLAY

**Dự án:** LinguaClay AI Language Learning Platform  
**Ngày tạo:** 2025-04-24  
**Trạng thái:** Sẵn sàng thực thi  
**Thời gian ước tính:** 2–3 ngày

---

## 📊 Tóm Tắt Tech Stack

| Tầng | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Next.js | 16.2.4 (App Router) |
| Ngôn ngữ | TypeScript | 5.x |
| Giao diện | Tailwind CSS | 4.x |
| ORM | Prisma | 7.7.0 |
| Database | PostgreSQL (Supabase) | — |
| Xác thực | Supabase Auth | — |
| AI | Groq SDK / OpenAI / Google AI | Nhiều nhà cung cấp |
| Email | Resend + Nodemailer | — |
| Thanh toán | PayOS | 2.0.5 |
| Hosting | Vercel (khuyến nghị) | — |
| Lưu trữ file | Supabase Storage | — |

---

## 🎯 Chiến Lược Triển Khai

- **Phương pháp:** Blue-Green Deployment với Vercel + Supabase
- **Database:** Migration thủ công bằng Prisma
- **CI/CD:** GitHub Actions
- **Rollback:** Vercel rollback + database restore point

---

## 📋 KẾ HOẠCH TỪNG BƯỚC

---

### GIAI ĐOẠN 0: CHUẨN BỊ TRƯỚC TRIỂN KHAI (1–2 giờ)

#### Bước 0.1: Kiểm Tra Repository
**Người phụ trách:** DevOps | **Song song:** Không

**Danh sách công việc:**
- Đảm bảo git repository sạch (không có thay đổi chưa commit)
- Kiểm tra `.gitignore` bao gồm: `.env*`, `.next/`, `node_modules/`, `.prisma/`
- Đảm bảo `package-lock.json` đã được commit (để build có thể tái tạo)
- Xác nhận `prisma/schema.prisma` là phiên bản mới nhất
- Kiểm tra các file tài liệu tồn tại: `README.md`, `SECURITY.md`, `DEPLOYMENT-PLAN.md`

**Lệnh kiểm tra:**
```bash
git status --porcelain
cat .gitignore
ls -la
```

**Tiêu chí hoàn thành:** Repository sạch, tất cả file nhạy cảm đã bị ignore, tài liệu đầy đủ.

---

#### Bước 0.2: Tài Liệu Hóa Biến Môi Trường
**Người phụ trách:** DevOps | **Song song:** Không

**Danh sách công việc:**
- Tạo file `.env.example` nếu chưa có với tất cả biến cần thiết
- Ghi chú mô tả và ví dụ cho từng biến
- Đánh dấu rõ biến nào là **BẮT BUỘC** vs **TÙY CHỌN**
- Thêm các biến dành riêng cho production nếu khác với môi trường dev

**Kiểm tra:**
```bash
# So sánh .env.example với codebase để đảm bảo đã tài liệu hóa đầy đủ
grep -r "process.env\." app/ lib/ | sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | sort -u
```

**Tiêu chí hoàn thành:** `.env.example` đầy đủ, chính xác và có mô tả rõ ràng.

---

### GIAI ĐOẠN 1: CUNG CẤP HẠ TẦNG (2–4 giờ)

#### Bước 1.1: Cài Đặt Database (Supabase)
**Người phụ trách:** DevOps | **Song song:** Không

**Danh sách công việc:**

1. Tạo Supabase project mới:
   - Vào [supabase.com](https://supabase.com) → "New Project"
   - Tên: `linguaclay-prod`
   - Chọn region gần người dùng nhất (Asia cho Việt Nam)
   - Tạo mật khẩu database mạnh

2. Lấy connection string:
   - Vào Project Settings → Database
   - Sao chép "Connection string" (pooled connection)
   - Định dạng: `postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres`

3. Bật các extension cần thiết:
```sql
-- Trong Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

4. Cấu hình Row Level Security (RLS):
   - Bật RLS trên tất cả bảng chứa dữ liệu người dùng
   - Tạo policies (xem Giai đoạn 3)

5. Tạo storage bucket:
   - Storage → Buckets → New bucket
   - Tên: `uploads`, Riêng tư (private)
   - Giới hạn file: 5MB, Loại MIME: `image/*`

6. Lấy credentials từ Settings → API

**Đầu ra:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Kiểm tra:**
```bash
npx prisma db pull --schema=prisma/schema.prisma
```

---

#### Bước 1.2: Cài Đặt Nhà Cung Cấp AI
**Người phụ trách:** DevOps | **Song song:** Có (chạy cùng Bước 1.1)

**A. Groq API (Chính):** Đăng nhập [groq.com](https://groq.com) → API Keys → Tạo key mới

**B. OpenAI API (Dự phòng - Tùy chọn):** [platform.openai.com](https://platform.openai.com) → Tạo API key, đặt giới hạn chi tiêu

**C. Google Generative AI (Check Writing):** [makersuite.google.com](https://makersuite.google.com) → Tạo API key

**Kiểm tra:**
```bash
curl -H "Authorization: Bearer $GROQ_API_KEY" \
  https://api.groq.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"Xin chào"}]}'
```

---

#### Bước 1.3: Cài Đặt Dịch Vụ Email
**Người phụ trách:** DevOps | **Song song:** Có

**A. Resend (Chính):**
- Đăng ký tại [resend.com](https://resend.com)
- Xác minh domain (hoặc dùng `onboarding@resend.dev` để test)
- Tạo API key

**B. Gmail (Dự phòng - Tùy chọn):**
- Bật xác thực 2 bước
- Tạo App Password (không dùng mật khẩu thông thường)

**Kiểm tra:**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Test <onboarding@resend.dev>","to":["test@example.com"],"subject":"Test","text":"Hoạt động!"}'
```

---

#### Bước 1.4: Cài Đặt Cổng Thanh Toán (PayOS)
**Người phụ trách:** DevOps | **Song song:** Không (cần thông tin doanh nghiệp)

**Danh sách công việc:**
1. Đăng ký tại [payos.vn](https://payos.vn) với tài khoản doanh nghiệp
2. Hoàn tất xác minh KYC
3. Cấu hình webhook endpoint: `https://yourdomain.com/api/payment/webhook`
4. Lấy: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`

**Kiểm tra:** Dùng chế độ sandbox PayOS để test webhook

---

#### Bước 1.5: Cài Đặt Hosting (Vercel)
**Người phụ trách:** DevOps | **Song song:** Không

**Danh sách công việc:**
1. Tạo tài khoản Vercel (nếu chưa có)
2. Import GitHub repository → Framework: Next.js (tự động nhận diện)
3. Thêm tất cả biến môi trường vào Vercel (Project Settings → Environment Variables)
4. Cấu hình build: `npm run build` / output: `.next` / install: `npm ci`
5. Thêm domain tùy chỉnh và cập nhật DNS records

---

### GIAI ĐOẠN 2: CẤU HÌNH ỨNG DỤNG (1–2 giờ)

#### Bước 2.1: Tạo File Môi Trường Production
**Người phụ trách:** DevOps | **Song song:** Không

Cấu hình trong Vercel dashboard (không lưu file `.env.production` trên repository):

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI APIs
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=support@yourdomain.com

# Thanh toán
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...

# Cấu hình App
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Admin
ADMIN_EMAIL=admin@yourdomain.com
```

> ⚠️ **KHÔNG BAO GIỜ** commit file môi trường production — chỉ lưu trong Vercel dashboard hoặc secret manager.

---

#### Bước 2.2: Chuẩn Bị Migration Database
**Người phụ trách:** Backend Dev | **Song song:** Không

**Danh sách công việc:**
1. Xem xét Prisma schema (check indexes, cascade delete, `@updatedAt`)
2. Tạo migration nếu chưa có:
```bash
npx prisma migrate dev --name production_schema
```
3. Kiểm tra SQL migration được tạo ra
4. Cẩn thận với thay đổi phá hủy (DROP COLUMN, ALTER COLUMN)
5. Tạo Prisma client cho production:
```bash
npx prisma generate
```

**Kiểm tra:**
```bash
npx prisma migrate status
# Kết quả mong đợi: "Up to date"
```

---

#### Bước 2.3: Tạo Tài Khoản Admin
**Người phụ trách:** DevOps | **Song song:** Có

Sau khi migration, tạo admin user:
```sql
-- Cập nhật role trong database
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
```

Hoặc dùng Prisma Studio:
```bash
npx prisma studio
```

**Kiểm tra:**
```bash
npx prisma db execute --stdin <<< "
SELECT id, email, role FROM \"User\" WHERE role = 'ADMIN';
"
```

---

### GIAI ĐOẠN 3: TĂNG CƯỜNG BẢO MẬT (1–2 giờ)

#### Bước 3.1: Chính Sách Row Level Security (RLS)
**Người phụ trách:** Security Engineer | **Song song:** Không

**Bật RLS trên các bảng:**
```sql
ALTER TABLE "UserProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WritingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
-- ... các bảng dữ liệu người dùng khác
```

**Tạo policies:**
```sql
-- Người dùng chỉ xem được dữ liệu của mình
CREATE POLICY "User chỉ xem progress của mình" ON "UserProgress"
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "User chỉ insert progress của mình" ON "UserProgress"
  FOR INSERT WITH CHECK (auth.uid() = "userId");
```

> **Lưu ý:** Service role key tự động bỏ qua RLS — dùng trong server-side code.

---

#### Bước 3.2: Triển Khai Rate Limiting
**Người phụ trách:** Backend Dev | **Song song:** Có

**Cài đặt:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Tạo utility:**
```ts
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

**Giới hạn theo endpoint:**
- `/api/auth/*`: 5 lần mỗi 15 phút
- `/api/ai/*`: 20 request mỗi phút
- `/api/payment/*`: 10 lần mỗi giờ
- Admin endpoints: 60 request mỗi phút

---

#### Bước 3.3: Xác Thực Đầu Vào với Zod
**Người phụ trách:** Backend Dev | **Song song:** Có

**Cài đặt:**
```bash
npm install zod
```

**Tạo schemas:**
```ts
// lib/validations/ai-tutor.ts
import { z } from 'zod'

export const ChatRequestSchema = z.object({
  mode: z.enum(['roleplay', 'freeTalk']),
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(20).optional(),
  scenarioTitle: z.string().max(200).optional(),
  targetWords: z.array(z.string()).max(10).optional(),
})

// Sử dụng trong API route:
try {
  const validated = ChatRequestSchema.parse(await req.json())
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', details: error.errors },
      { status: 400 }
    )
  }
}
```

**Files cần cập nhật:** Tất cả routes trong `/api/ai/*`, `/api/payment/*`, `/api/auth/*`, `/api/user/*`, `/api/admin/*`, `/api/support/*`

---

### GIAI ĐOẠN 4: CÀI ĐẶT CI/CD (1 giờ)

#### Bước 4.1: Cấu Hình GitHub Actions

**Tạo `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm audit --audit-level=high
```

**GitHub Secrets cần cấu hình:**
- `VERCEL_TOKEN` — từ Vercel account settings
- `VERCEL_ORG_ID` — từ Vercel team settings
- `VERCEL_PROJECT_ID` — từ Vercel project settings
- `DATABASE_URL` — connection string production

---

#### Bước 4.2: Cấu Hình Vercel Project

**Trong Vercel dashboard cần cấu hình:**

| Cài đặt | Giá trị |
|---|---|
| Build command | `npm run build` |
| Output directory | `.next` |
| Install command | `npm ci` |
| Production branch | `main` |
| Max function duration | 30s |

---

### GIAI ĐOẠN 5: MIGRATION & SEED DATABASE (30 phút)

#### Bước 5.1: Áp Dụng Migration Lên Production

```bash
# Ưu tiên chạy qua CI/CD
npx prisma migrate deploy

# Hoặc thủ công:
vercel env pull .env.production
npx prisma migrate deploy
```

**Kiểm tra:**
```bash
npx prisma db execute --stdin <<< "
SELECT migration_id, finished_at FROM _prisma_migrations 
ORDER BY started_at DESC LIMIT 10;
"
```

**Rollback (nếu migration thất bại):**
```bash
npx prisma migrate resolve --rolled-back "tên_migration"
```

---

#### Bước 5.2: Seed Dữ Liệu Ban Đầu (Tùy chọn)

> ⚠️ **Cẩn thận:** Chỉ seed khi database còn trống. Không bao giờ ghi đè dữ liệu người dùng hiện có.

```bash
# Tạo admin user trực tiếp
npx prisma db execute --stdin <<< "
INSERT INTO \"User\" (id, email, role, \"createdAt\", \"updatedAt\")
VALUES ('admin-uuid', 'admin@yourdomain.com', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
"
```

---

### GIAI ĐOẠN 6: TRIỂN KHAI PRODUCTION (30 phút)

#### Bước 6.1: Deploy Ứng Dụng

```bash
# Merge và push lên main
git checkout main
git pull origin main
git merge staging
git push origin main

# Hoặc deploy thủ công
vercel --prod
```

**Kiểm tra:**
```bash
curl -I https://yourdomain.com
# Kết quả mong đợi: 200 OK

curl -I https://yourdomain.com/api/health
# Kết quả mong đợi: 200 OK
```

**Rollback:**
- Vercel Dashboard → Deployments → Chọn deployment trước → "Promote to Production"
- Hoặc CLI: `vercel rollback <deployment-id>`

---

#### Bước 6.2: Kiểm Tra Sau Khi Deploy

**Smoke test các luồng quan trọng:**
- [ ] Trang chủ tải được
- [ ] Luồng đăng nhập hoạt động (nhận email OTP)
- [ ] Dashboard truy cập được sau đăng nhập
- [ ] Flashcard practice hoạt động
- [ ] AI tutor phản hồi
- [ ] Link thanh toán được tạo (test với sandbox)
- [ ] Admin panel truy cập được

---

### GIAI ĐOẠN 7: GIÁM SÁT & CẢNH BÁO (1 giờ)

#### Bước 7.1: Cài Đặt Theo Dõi Lỗi (Sentry)

```bash
npm install @sentry/nextjs
```

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1, // 10% transactions
})
```

**Cấu hình cảnh báo Sentry:**
- Lỗi mới → Slack/email
- Tăng đột biến lỗi (>10x baseline)
- Hiệu suất giảm

---

#### Bước 7.2: Logging Có Cấu Trúc

```bash
npm install pino
```

```ts
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.VERCEL_ENV === 'production' ? 'info' : 'debug',
})

// Thay thế console.log:
logger.info({ userId, orderCode }, 'Đơn hàng đã tạo')
logger.error({ error: err.message }, 'Thanh toán thất bại')
```

---

#### Bước 7.3: Giám Sát Uptime

**Dịch vụ:** UptimeRobot (miễn phí) hoặc Better Stack

**Tạo endpoint health check:**
```ts
// app/api/health/route.ts
export async function GET() {
  await prisma.$queryRaw`SELECT 1`
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

**Cấu hình:** Kiểm tra mỗi 1 phút, timeout 10s, cảnh báo qua email/Slack/SMS.

---

## 🚨 KẾ HOẠCH ROLLBACK

### Tình Huống 1: Lỗi Ứng Dụng
**Kích hoạt:** Lỗi 5xx > 5% trong 5 phút

```bash
# Rollback qua CLI
vercel rollback <deployment-id>
```

**Bước thực hiện:** Vercel Dashboard → Deployments → Deployment cũ → "Promote to Production" → Chờ 1–2 phút → Xác nhận → Điều tra nguyên nhân.

---

### Tình Huống 2: Migration Database Thất Bại
**Kích hoạt:** Migration lỗi hoặc gây mất dữ liệu

```bash
# Kiểm tra trạng thái
npx prisma migrate status

# Rollback migration
npx prisma migrate resolve --rolled-back "20250424000000_tên_migration"

# Khôi phục từ backup (nếu cần)
# Liên hệ Supabase support hoặc dùng Dashboard restore
```

---

### Tình Huống 3: Rủi Ro Bảo Mật
**Kích hoạt:** Phát hiện truy cập trái phép hoặc rò rỉ dữ liệu

**Hành động ngay lập tức:**
1. Thu hồi tất cả API keys (Groq, OpenAI, PayOS, Resend)
2. Xoay vòng Supabase service role key
3. Buộc đăng xuất tất cả người dùng (invalidate sessions)
4. Bật chế độ bảo trì

**Điều tra:** Xem logs (Vercel, Sentry, Supabase) → Xác định vector tấn công → Đánh giá thiệt hại

**Khôi phục:** Deploy bản vá bảo mật → Reset mật khẩu người dùng → Thông báo người dùng bị ảnh hưởng (tuân thủ GDPR) → Lập báo cáo sự cố.

---

## ✅ CHECKLIST PRODUCTION

### Trước Lần Deploy Đầu Tiên

**Chuẩn bị:**
- [ ] Tất cả biến môi trường đã tài liệu hóa trong `.env.example`
- [ ] `.env` production đã cấu hình trong Vercel
- [ ] Migration database đã áp dụng: `npx prisma migrate deploy`
- [ ] Admin user đã tạo với role đúng

**Bảo mật:**
- [ ] Supabase RLS policies đã bật và kiểm tra
- [ ] Rate limiting đã triển khai trên tất cả endpoint nhạy cảm
- [ ] Input validation với Zod trên tất cả API routes
- [ ] Không còn `console.log` trong production code
- [ ] Tất cả lỗi TypeScript đã sửa (`npx tsc --noEmit` pass)

**Build & Deploy:**
- [ ] ESLint pass không có lỗi (`npm run lint`)
- [ ] Build thành công (`npm run build`)
- [ ] GitHub Actions CI/CD đã cấu hình và pass
- [ ] Vercel project đã liên kết với GitHub repo
- [ ] Domain tùy chỉnh đã cấu hình và DNS đã propagate
- [ ] HTTPS certificate đang hoạt động

**Giám sát:**
- [ ] Sentry/error tracking đã cấu hình
- [ ] Uptime monitor đã tạo
- [ ] Health check endpoint hoạt động

**Tích hợp:**
- [ ] Dịch vụ email đã test (Resend hoặc Gmail)
- [ ] PayOS webhook đã xác minh (sandbox)
- [ ] AI API quotas đủ cho tải dự kiến

**Quy trình:**
- [ ] Backup strategy đã tài liệu hóa (Supabase auto-backup)
- [ ] Rollback procedure đã test
- [ ] Team đã được đào tạo về incident response
- [ ] Tài liệu đầy đủ (README, SECURITY.md, DEPLOYMENT-PLAN.md)

### Sau Khi Deploy

- [ ] Deploy thành công (200 OK trên tất cả trang)
- [ ] Smoke tests đã pass
- [ ] Không có lỗi trong Vercel logs trong 10 phút
- [ ] Sentry không có lỗi mới
- [ ] Uptime monitor xanh
- [ ] Email gửi thành công
- [ ] PayOS webhook nhận và xử lý được events
- [ ] AI phản hồi trong thời gian chấp nhận được (< 5 giây)
- [ ] Database queries hiệu quả (kiểm tra Supabase query logs)
- [ ] Team được thông báo về deployment thành công

---

## 📊 NHẬT KÝ QUYẾT ĐỊNH

### Tại Sao Chọn Vercel?
- Hỗ trợ Next.js native (zero-config)
- HTTPS tự động + Global CDN
- Preview deployments cho Pull Requests
- Environment variable management dễ dàng
- Serverless functions tự động scale

### Tại Sao Chọn Supabase?
- PostgreSQL với RLS đầy đủ
- Built-in Auth (OAuth, Magic Link)
- Storage cho file uploads
- Free tier tốt cho giai đoạn đầu

### Tại Sao Chọn Groq Là Primary?
- Cực kỳ nhanh (Llama 3.1 trên phần cứng tùy chỉnh)
- Chi phí thấp hơn OpenAI
- Chất lượng tốt cho usecase dạy học
- Rate limits cao

### Tại Sao Resend + Gmail Fallback?
- Resend: API email transactional, đáng tin cậy
- Gmail: Tùy chọn backup, không tốn chi phí thêm
- Deliverability tốt

---

## ⚠️ RỦI RO & GIẢI PHÁP

| Rủi ro | Mức độ | Xác suất | Giải pháp |
|---|---|---|---|
| AI API ngừng hoạt động | Cao | Trung bình | Fallback sang nhà cung cấp khác (OpenAI) |
| PayOS webhook thất bại | Cao | Thấp | Quy trình xác minh thanh toán thủ công, cảnh báo |
| Database connection pool cạn kiệt | Cao | Trung bình | Đặt giới hạn kết nối đúng, dùng connection pooling |
| Vượt rate limit email | Trung bình | Trung bình | Queue email, retry với backoff |
| Vercel cold starts | Trung bình | Cao | Nâng cấp lên paid plan |
| Prompt injection | Cao | Trung bình | Sanitize input, validate output, rate limiting |
| Vượt ngân sách AI/email | Trung bình | Cao | Đặt spending limits, monitoring tự động |
| Mất dữ liệu khi migration | Cao | Thấp | Backup trước migration, test trên staging trước |

---

## 📞 LIÊN HỆ KHẨN CẤP

| Vấn đề | Người liên hệ | Kênh |
|---|---|---|
| Hạ tầng | DevOps Team | #devops |
| Database | Backend Lead | #backend |
| Vấn đề thanh toán | Finance + Tech | #payments |
| Sự cố bảo mật | CTO / Security Lead | #security |
| Vercel Outage | [status.vercel.com](https://status.vercel.com) | — |

---

## 📚 TÀI NGUYÊN THAM KHẢO

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Groq API Docs](https://console.groq.com/docs)
- [PayOS Integration Guide](https://payos.vn/docs)

---

> **Trạng thái kế hoạch:** ✅ Sẵn sàng thực thi  
> **Bước tiếp theo:** Bắt đầu với Giai đoạn 0: Chuẩn bị trước triển khai  
> **Tổng thời gian ước tính:** 2–3 ngày với 1–2 kỹ sư  
> **Đường tới hạn (Critical Path):** Database → Biến môi trường → CI/CD → Deploy

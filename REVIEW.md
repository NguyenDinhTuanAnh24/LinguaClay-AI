📊 Tổng Quan Dự Án
LinguaClay - Nền tảng học ngôn ngữ với AI (tiếng Anh & Trung) thiết kế theo phong cách Brutalist mạnh mẽ. Xây dựng với Next.js 16 App Router, TypeScript, Supabase (Auth + PostgreSQL) và Prisma ORM.

✨ Tính Năng Hiện Có
Tính Năng Học Tập
Hệ thống Flashcard với SRS (Spaced Repetition) - 5 cấp độ ghi nhớ
Bài tập Ngữ pháp - Quiz tương tác với nhiều dạng câu hỏi
Kiểm tra Viết - AI Groq góp nhận xét và sửa lỗi
Theo dõi Thời gian Học - Mục tiêu hàng ngày và heartbeat theo thời gian thực
Monetization
Hệ thống Thanh toán - Tích hợp PayOS (cổng thanh toán VN)
Gói Đăng ký - 3 tháng, 6 tháng, 1 năm
Hệ thống Mã Giảm giá - Với giới hạn sử dụng
Hoàn tiền - Cửa sổ 7 ngày với xác minh tài khoản ngân hàng
Admin Panel
Quản lý người dùng (kích hoạt/hủy pro, ban/unban)
Tạo nội dung tự động (flashcard, ngữ pháp, bài tập qua AI)
Theo dõi thanh toán và xử lý hoàn tiền
Quản lý support ticket
Tạo và phân bổ mã giảm giá
Quản lý Người dùng
Supabase Auth với email OTP + Google OAuth
Quản lý profile với upload avatar
Theo dõi tiến độ và mastery levels
Hệ thống thông báo trong app
📁 Cấu Trúc Codebase
Điểm Mạnh:
Cấu trúc Next.js App Router sạch sẽ (app/ directory)
API routes tổ chức theo domain (app/api/)
Components tách theo tính năng (components/dashboard/, components/study/, components/marketing/)
Prisma schema chi tiết với các quan tử đúng
Thư viện utils có mô-đun hóa (lib/ với admin.ts, levels.ts, prisma.ts)
Entry Points:
Main: app/layout.tsx - Layout gốc với fonts Brutalist
Marketing: app/(marketing)/page.tsx - Landing page
Dashboard: app/dashboard/page.tsx - Giao diện học tập chính
Auth: app/api/auth/callback/route.ts - OAuth callback
Files Quan Trọng:
File	Mục đích
prisma/schema.prisma	Schema DB hoàn chỉnh (23 models)
lib/admin.ts	Kiểm tra role/admin email
app/actions/study.ts	Thuật toán SRS implementation
components/study/FlashcardStudy.tsx	UI học tập chính
app/api/payment/webhook/route.ts	Xử lý thanh toán
middleware.ts	Quản lý session Supabase
⚠️ Vấn Đề & Rủi Ro
1. LỖI BẢO MẬT (NGHIÊM TRỌNG)
Email Admin Hardcoded

// lib/admin.ts:1
export const ADMIN_EMAIL = 'admin@gmail.com'
Rủi ro: Ai có email admin@gmail.com đăng nhập qua Supabase sẽ thành admin. Nên dùng DB-stored roles hoặc env-var whitelist.

Authorization Thiếu trên Admin Endpoints

// app/api/admin/users/[userId]/manage/route.ts:120-135
if (!user || !isAdminUser(user)) { return 403 }
// Sau đó kiểm tra Prisma role nhưng catch lỗi silently
Rủi ro: Catch block bỏ qua lỗi - nếu Prisma client không có field role, bất kỳ admin email nào cũng pass. Đây là lỗi privilege escalation tiềm ẩn.

Không có Rate Limiting
Login endpoint (app/api/auth/login/route.ts) - Không giới hạn rate OTP requests
Payment webhook - Đã verify signature PayOS, nhưng các endpoint khác dễ bị tấn công
Support ticket upload - Không rõ validation file size/type
File Upload Security

// app/api/support/upload-attachment/route.ts (tồn tại nhưng chưa đọc)
Có thể thiếu:

Allowlist file type (check MIME, không chỉ extension)
Giới hạn file size
Ngăn path traversal
Virus scanning
Log Dữ liệu Nhạy Cảm

// app/api/ai/check-writing/route.ts:64
console.error('AI Check Error:', error)
Error có thể chứa user content (content parameter) - rủi ro rò rỉ PII.

SQL Injection Prevention
✅ Tốt: Dùng Prisma parameterized queries - không thấy string concatenation.

CSRF Protection
⚠️ Chưa rõ: Next.js có CSRF built-in cho forms, nhưng API routes dùng fetch cần bảo vệ thêm. Các operation thay đổi state (payment, admin) nên verify Origin header.

2. THIẾU KIỂM SOÁT BẢO MẬT (CAO)
Không có Validation Schemas
Dùng req.json() cast trực tiếp không có Zod
Ví dụ: app/api/payment/request-refund/route.ts:24 cast thành RefundPayload nhưng không validate sâu
Nên dùng Zod cho TẤT CẢ API routes công khai
Validate Environment Variables

// app/api/payment/webhook/route.ts:6-10
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})
Dùng non-null assertion (!) - nếu thiếu env vars, app crash lúc startup. Nên validate khi khởi tạo.

Thiếu Helmet/securityHeaders
Không có CSP, HSTS, hay security headers khác trong next.config.ts.

3. CHẤT LƯỢNG CODE (TRUNG BÌNH)
Console.Error Dịch Vụ (46 files)
Mọi API route đều có console.error. Nên dùng structured logging (Pino/Winston) với request IDs.

Any Types trong Components

// components/dashboard/DashboardShell.tsx:10-11
type DashboardShellProps = {
  user: any
  dbUser: any
}
Dùng any phá hủy mục đích TypeScript. Cần định nghĩa User types rõ ràng.

Lặp Lại Admin Check Logic
Lặp pattern admin check trong 6+ endpoints:


const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user || !isAdminUser(user)) return 403
// Sau đó double-check Prisma role
Refactor: Tạo middleware hoặc helper requireAdmin().

Magic Numbers

// app/actions/study.ts:37
const daysToAdd = Math.pow(2, newLevel) // L1=2d, L2=4d...
// app/api/payment/request-refund/route.ts:56
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
Nên dùng named constants: SRS_INTERVAL_MULTIPLIER = 2, REFUND_PERIOD_DAYS = 7.

Error Handling Không Đồng Bộ
Một số endpoint trả về { error: string }, khác trả về { success: false, message: string }. Nên chuẩn hóa API response:


type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}
4. KIẾN TRÚC (TRUNG BÌNH)
Admin Endpoints Monolithic
app/api/admin/users/[userId]/manage/route.ts xử lý 4 actions (activate_pro, cancel_pro, ban, unban). Nên tách riêng theo REST principle.

Coupling Chặt với PayOS
Payment webhook depend trực tiếp vào PayOS response shape. Nếu đổi provider phải rewrite hoàn toàn. Cần abstraction:


interface PaymentProvider {
  verifyWebhook(payload: unknown): Promise<boolean>
  getOrderCode(payload: unknown): number
}
Study Time Timezone Issues

// app/api/study-time/_helpers (imported but not shown)
getVNDayStartDate() // có thể dùng timezone Việt Nam (+07:00)
Hardcode timezone có thể gây lỗi DST. Dùng Intl.DateTimeFormat hoặc lưu UTC với client conversion.

5. PERFORMANCE (THẤP-TRUNG BÌNH)
Thiếu Pagination
app/api/dashboard/recent/route.ts - "recent" có thể trả tất cả data. Thêm cursor-based pagination.

N+1 Queries Tiềm Ẩn

// components/dashboard/DashboardShell.tsx nhận wordsToday
// Chưa thấy nó được fetch ở đâu - có thể query riêng mỗi lần load dashboard
Dùng Prisma include để batch loads:


const dashboard = await prisma.user.findUnique({
  where: { id },
  include: {
    progress: { include: { word: true } },
    dailyStudyStats: { where: { date: today } }
  }
})
AI API Calls Không Streaming
Groq LLaMA call (app/api/ai/check-writing/route.ts) block đến khi response đầy đủ. Cân nhắc streaming cho UX tốt hơn.

6. KHOẢNG TRĂNG TEST (CAO)
Zero Test Coverage
Không có .test.ts hay .spec.ts files trong project (chỉ có trong node_modules)
Critical paths chưa test: SRS algorithm, payment webhook, admin actions, refund logic
Vi phạm rule của project: testing.md yêu cầu 80% coverage
Thiếu E2E Tests
Không có Playwright tests cho:

User registration → flashcard study → payment flow
Admin coupon creation → user redemption
Refund request → admin processing
📈 Phân Tích Test Coverage

Project: ai-language-learning
├── Tổng files (src): ~120 .ts/.tsx files
├── Test files: 0 ❌
├── Coverage expected: 80% minimum (per testing.md)
├── Coverage thực tế: ~0% ⚠️
Khuyến nghị: Dùng agent tdd-guide để xây dựng testing foundation ngay.

🎯 Ưu Tiên Khuyến Nghị
Ngay Lập Tức (Fix Tuần Này)
✅ Thêm rate limiting vào auth endpoints
✅ Implement Zod validation cho TẤT CẢ API routes
✅ Thay any types bằng interfaces đúng
✅ Chuẩn hóa API response format
✅ Audit .env - đảm bảo secrets không commit (check git history)
✅ Setup structured logging (Pino) với request correlation IDs
✅ Thêm test coverage - bắt đầu với SRS algorithm và payment webhook
Ngắn Hạn (Sprint Tiếp)
🔄 Refactor admin endpoints dùng middleware requireAdmin()
🔄 Extract payment provider abstraction
🔄 Thêm pagination vào dashboard queries
🔄 Implement file upload validation (size, type, virus scan)
🔄 Thêm CSP security headers
🔄 Fix admin email hardcoding - chuyển sang env var hoặc DB config
Dài Hạn (Kiến Trúc)
🗓️ Thêm request tracing (OpenTelemetry) cho debugging
🗓️ Implement audit logging cho admin actions
🗓️ Consider tách admin panel sang route group riêng với middleware stricter
🗓️ Thêm feature flags cho gradual rollout
🗓️ Setup CI/CD với automated security scanning (Snyk, Trivy)
🔒 Security Checklist Trước Production
 Secrets management - Verify .env trong .gitignore, rotate keys bị lộ
 SQL injection - ✅ Prisma safe, không string concatenation
 XSS prevention - Next.js React escaping ✅, nhưng check dangerouslySetInnerHTML
 CSRF tokens - Verify state-changing API routes check Origin header hoặc dùng same-site cookies
 File upload validation - Implement MIME type và size checks
 Rate limiting - Trên auth, payment, support endpoints
 Input validation - Thêm Zod schemas cho tất cả inputs công khai
 Error message sanitization - Không leak DB details hay stack traces trong production
 Admin authorization - Xóa hardcoded email, dùng DB role lookup only
 CSP headers - Configure Content Security Policy
 Dependency audit - Chạy npm audit và fix vulnerabilities
 Logging - Xóa PII từ logs, implement audit trail
📊 Điểm Chất Lượng Code
Category	Score	Ghi chú
Security	4/10	Lỗi auth nghiêm trọng, thiếu validation
Architecture	7/10	Tách biệt tốt, nhưng cần refactor
Code Quality	6/10	Type-safe mostly, nhưng any và magic numbers
Testing	0/10	Không có tests dù yêu cầu 80%
Maintainability	7/10	Tổ chức rõ, nhưng lặp admin checks
Performance	6/10	Rủi ro N+1, thiếu pagination
DevEx	8/10	Tooling tốt (TypeScript, ESLint, Prettier implied)
Overall: 5.4/10 - Cần fix security và testing ngay.

🎯 Files Quan Trọng Nhất Để Review/Refactor
lib/admin.ts - Auth logic flawed, cần DB-based role check
app/api/admin/users/[userId]/manage/route.ts - Consolidate action handlers
app/api/payment/webhook/route.ts - Critical path, cần error handling tốt hơn
app/actions/study.ts - Core algorithm, cần unit tests
prisma/schema.prisma - Thêm field role vào User model (hiện chỉ trong metadata)
TẤT CẢ API routes - Thêm Zod validation middleware
middleware.ts - Hiện chỉ session sync, cần security hardening
🏆 Điều Tốt Đang Có
✅ Stack hiện đại - Next.js 16, TypeScript, Prisma, Supabase
✅ Design system đẹp - Brutalist aesthetic nhất quán với Tailwind
✅ Database schema - Well-normalized với foreign keys và indexes đúng
✅ SRS algorithm - Spaced repetition được implement chính xác
✅ Transaction safety - Payment webhook dùng Prisma transactions
✅ Không có console.log pollution - Chỉ console.error trong production code
✅ Component structure sạch - Separation of concerns tốt
Kết luận: Đây là một MVP hứa hẹn với nền tảng vững chắc, nhưng lỗi bảo mật nghiêm trọng và zero test coverage làm nó không phù hợp cho production trong trạng thái hiện tại. Ưu tiên fix security và xây dựng testing discipline trước khi scale.
# 📊 PROGRESS — LinguaClay AI
> Cập nhật lần cuối: **20/04/2026 — 14:15 (GMT+7)**

---

## 🗺️ Tổng quan theo Phase

| Phase | Tên | Thời gian | Trạng thái |
|---|---|---|---|
| **Phase 1** | MVP — Từ vựng & Flashcard | Tuần 1–8 | ✅ **Hoàn thành ~95%** |
| **Phase 2** | Ngữ pháp & Viết | Tuần 9–16 | ✅ **Hoàn thành ~85%** |
| **Phase 3** | Monetization & AI Chatbot | Tuần 17–24 | 🟡 **Đang triển khai** |

---

## ✅ Phase 1 — Đã hoàn thành

### 🏗️ Hạ tầng & Cấu hình

| Hạng mục | Chi tiết | Trạng thái |
|---|---|---|
| Next.js 14 App Router + TypeScript | Khởi tạo project | ✅ |
| Prisma ORM + Supabase PostgreSQL | Kết nối DB, migrate schema | ✅ |
| Supabase Auth | Email/password login + callback | ✅ |
| Connection Pooling | PgBouncer port 6543 + directUrl 5432 | ✅ |
| Claymorphism Design System | CSS tokens, shadows, animations | ✅ |
| Google Fonts (Inter/Heading) | `globals.css` + Tailwind config | ✅ |

---

### 🗄️ Database Schema (Prisma)

```
User           — id, email, name, image, targetLanguage, proficiencyLevel
Topic          — id, name, slug, description, image, level, language, isAIGenerated
Word           — id, original, pronunciation, translation, example, exampleTranslation, topicId
UserProgress   — userId, wordId, masteryLevel (0–5), lastReviewed, nextReview, isDifficult
Exercise       — type, question, options[], correctAnswer, wordId, userId
Order          — id, orderCode (unique), userId, planId, amount, status (PENDING/SUCCESS)
```

> **Thay đổi quan trọng (Monetization):**
> - Thêm các trường `isPro`, `proType`, `proStartDate`, `proEndDate` vào model **User**.
> - Thêm model **Order** để đối soát giao dịch tự động.

> **Thay đổi so với PLAN.md gốc:**
> - Đổi `VocabularySet` → `Topic` (phù hợp hơn với UX)
> - Thêm `exampleTranslation` vào Word
> - `masteryLevel` dùng thang **0–5** (SRS) thay vì 0–100

---

### 🔐 Authentication

| Tính năng | File | Trạng thái |
|---|---|---|
| Custom Login/Signup UI | `app/(auth)/login/page.tsx` | ✅ |
| Supabase Auth Callback | `app/api/auth/callback/route.ts` | ✅ |
| User sync Supabase → Prisma | `app/api/auth/sync-user/route.ts` | ✅ |
| Dashboard Layout + Guard | `app/dashboard/layout.tsx` | ✅ |

---

### 🏠 Dashboard (`/dashboard`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Header thời gian thực | Lời chào theo giờ GMT+7 (sáng/chiều/tối/đêm), cập nhật mỗi phút | ✅ |
| Avatar + Tên cá nhân hóa | Lấy từ Prisma DB, cập nhật ngay sau khi sửa Settings | ✅ |
| Banner "Học tiếp" | Query `UserProgress.findFirst` theo `lastReviewed desc` → link `/study/[slug]` | ✅ |
| Banner "Bắt đầu" (empty state) | Hiện khi chưa học gì, redirect `/dashboard/flashcards` | ✅ |
| Thống kê "Đã thuộc" | Đếm `masteryLevel >= 4` từ DB | ✅ |
| Thống kê "Cần ôn tập" | Đếm `masteryLevel < 4` | ✅ |
| Streak thực tế | Tính ngày liên tiếp từ `lastReviewed` theo GMT+7 (không phải mock) | ✅ |
| Topic Cards | 6 chủ đề mới nhất, badge ôn tập, progress bar per-topic | ✅ |
| Badge "Ôn tập" | Số từ có `nextReview <= now`, hiện góc cam trên thẻ | ✅ |
| Progress Bar per Topic | `(masteredCount / totalWords) * 100%`, màu cam→xanh khi ≥ 80% | ✅ |

**Files:** `app/dashboard/page.tsx`, `components/dashboard/Header.tsx`, `app/dashboard/layout.tsx`, `components/dashboard/MobileNav.tsx`, `components/dashboard/Sidebar.tsx`

---

### 📈 Phân tích học tập (`/dashboard/progress`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Donut Chart | Phân bổ cấp độ SRS (0-5) bài bản | ✅ |
| Arc Gauge | Tỷ lệ Retention (Ghi nhớ vs Lãng quên) | ✅ |
| Bar Chart Split | Tốc độ học chia theo **Từ mới** vs **Ôn lại** | ✅ |
| Stats Grid | Đã học tổng, Thuộc lòng, Streak, Cần ôn ngay | ✅ |
| Interactive SRS Table | Click vào cấp độ để hiện danh sách từ vựng | ✅ |
| Native SVG | Tối ưu tốc độ, hiệu ứng claymorphism shadow | ✅ |

**Files:** `app/dashboard/progress/page.tsx`, `components/dashboard/MasteryDetails.tsx`

---

### ⚙️ Settings (`/dashboard/settings`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Avatar Preview tức thì | `URL.createObjectURL` → preview trước khi lưu, badge "Chưa lưu" | ✅ |
| Upload Avatar (server-side) | Route `/api/user/upload-avatar` → Supabase Storage, bypass RLS | ✅ |
| Cập nhật tên | Route `/api/user/update-profile` → Prisma | ✅ |
| Floating Toast | Slide-in từ góc phải, pastel màu, tự đóng 4s | ✅ |
| Ngôn ngữ mục tiêu | EN / CN / JP, lưu vào `User.targetLanguage` | ✅ |
| Trình độ | Beginner / Elementary / Intermediate / Advanced | ✅ |
| Header refresh sau lưu | `router.refresh()` → Server Components re-fetch, tên + avatar cập nhật ngay | ✅ |

> ⚠️ **Cần làm thủ công:** Thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env` để upload avatar bypass RLS hoàn toàn.

**Files:** `app/dashboard/settings/page.tsx`, `app/api/user/upload-avatar/route.ts`, `app/api/user/update-profile/route.ts`

---

### 📚 Thư viện Flashcard (`/dashboard/flashcards`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Topic Grid | Hiển thị tất cả Topic, search realtime | ✅ |
| Real-time Search | `SearchInput` component, `startsWith` + `contains` | ✅ |
| AI Generate Button | Tạo bộ từ vựng mới theo chủ đề qua Groq (Llama 3.1 8B) | ✅ |
| Chỉ số từ vựng | `_count.words` per topic | ✅ |
| AI Banner | CTA tạo chủ đề mới bằng AI | ✅ |

**Files:** `app/dashboard/flashcards/page.tsx`, `app/api/flashcards/generate/route.ts`, `components/dashboard/GenerateFlashcardButton.tsx`

---

### 🃏 Hệ thống Học Flashcard (`/study/[slug]`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| 2-bước User Flow | Bước 1: xem từ → Bước 2: lật → đánh giá | ✅ |
| Lật thẻ animation | Fade cross-dissolve, mặt trước/sau rõ ràng | ✅ |
| Text-to-Speech | Web Speech API, nút loa (không lật thẻ khi bấm) | ✅ |
| Nút "Đã nhớ 🎯" | SRS: `level++`, `nextReview = now + 2^level days` | ✅ |
| Nút "Chưa thuộc 😅" | SRS: `level = 0`, `nextReview = now + 30 phút` | ✅ |
| Auto-advance | Tự chuyển card sau 700ms (đủ thấy feedback) | ✅ |
| Mastery Bar | 5 đốm clay: cam (đang học) → xanh (level 5 = thuộc lòng) | ✅ |
| Progress Pebbles | Màu xanh (mastered ≥4), cam (đã trả lời), xanh nhạt (chưa) | ✅ |
| Flash Feedback | `⭐ Level X/5` hoặc `💪 Tiếp tục cố gắng!` | ✅ |
| Empty State | Thông báo khi topic không có từ | ✅ |
| Optimistic Update | `masteryMap` cập nhật ngay trước khi API trả về | ✅ |

**Files:** `components/study/FlashcardStudy.tsx`, `components/study/Flashcard.tsx`, `app/study/[slug]/page.tsx`

---

### ⚙️ Thuật toán SRS (Spaced Repetition System)

```
Đúng (isCorrect = true):
  newLevel = min(currentLevel + 1, 5)
  nextReview = now + 2^newLevel days
  → L1: 2 ngày | L2: 4 | L3: 8 | L4: 16 | L5: 32

Sai (isCorrect = false):
  newLevel = 0
  nextReview = now + 30 phút
```

**File:** `app/actions/study.ts` (Server Action)

---

### 🔌 API Routes

| Route | Method | Mục đích |
|---|---|---|
| `/api/auth/sync-user` | POST | Sync Supabase user → Prisma DB |
| `/api/dashboard/recent` | GET | Chủ đề học gần nhất |
| `/api/user/me` | GET | Thông tin profile từ Prisma |
| `/api/user/update-profile` | POST | Cập nhật tên người dùng |
| `/api/user/upload-avatar` | POST | Upload ảnh lên Supabase Storage (server-side) |
| `/api/flashcards/generate` | POST | AI tạo bộ flashcard mới (Groq Llama 3.1) |
| `/api/payment/create-link` | POST | Tạo link thanh toán PayOS VietQR |
| `/api/payment/webhook` | POST | Nhận tín hiệu thanh toán thành công (Async) |
| `/api/payment/verify-session` | GET | Xác thực và kích hoạt PRO ngay khi redirect (Sync) |
| `/api/payment/request-refund` | POST | Tiếp nhận yêu cầu hoàn tiền và thông tin ngân hàng |

**Server Actions:**
- `app/actions/study.ts` → `updateWordProgress(userId, wordId, isCorrect)`

---

## 🚧 Còn thiếu / Cần làm

### ⚡ Việc nhỏ (hoàn thành Phase 1)

| Việc | Mức độ ưu tiên | Ghi chú |
|---|---|---|
| Thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env` | 🔴 Cao | Fix upload avatar RLS, key lấy từ Supabase → Settings → API |
| Tạo bucket `avatars` trong Supabase Storage | 🔴 Cao | Đặt Public, thêm RLS policies |
| Seed data từ vựng (500+ từ) | 🟡 Trung bình | HSK 1–3 + English A1–B1 |
| Trang `/dashboard/progress` | Biểu đồ chi tiết streak, mastery theo thời gian với native SVG | ✅ |
| Test `Exercise` flow | 🟡 Trung bình | Multiple choice, fill blank |
| Fix TypeScript errors cũ trong `utils/supabase/server.ts` | 🟢 Thấp | Lỗi cũ, không ảnh hưởng runtime |

---

### 📗 Phase 2 — Ngữ pháp & AI Tutor (`/dashboard/grammar`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Thư viện 200 chủ điểm | Phân chia 3 cấp độ: Beginner (1-70), Elementary (71-140), Intermediate (141-200) | ✅ |
| Cấu trúc "Gia sư AI" | Hiển thị 4 khối: Công thức (Formula), Thành phần (Breakdown), Cách dùng (Usage), Dấu hiệu (Signs) | ✅ |
| Hệ thống Slugging chuẩn | `beg-n`, `elem-n`, `inter-n` giúp URL sạch đẹp và chuẩn SEO | ✅ |
| Đồng bộ Cloud (Supabase) | Đã đẩy toàn bộ 200 bản ghi lên DB qua script `sync-grammar.mjs` | ✅ |
| Interactive Breakdown | Các thành phần (S, V, O, Adj...) hiển thị dưới dạng Pill màu sắc Claymorphism | ✅ |
| Modal Luyện tập English | Sắp xếp câu (Unscramble) sử dụng ví dụ tiếng Anh thực tế | ✅ |
| Gợi ý (Tip/Hint) 💡 | Hiển thị câu dịch tiếng Việt khi hover để hỗ trợ người dùng | ✅ |
| Thuật toán Shuffle | Tự động làm sạch dấu câu và xáo trộn từ ngẫu nhiên | ✅ |
| AI Content Generation | Script tự động mở rộng nội dung qua API Groq (Llama 3.1) | ✅ |

- [x] AI Writing Feedback System (Schema + API)
- [x] UI Luyện viết (`/study/[slug]/write`)
- [x] Exercise Engine (Reordering + Fill-blank)
- [x] AI Content Generation Batch (API Admin)
- [x] Seeding 200 Grammar Topics (Massive Data) 
- [x] Grammar Lessons UI (Gia sư AI)
- [x] Tích hợp thanh toán PayOS (VietQR)
- [x] Hệ thống kích hoạt PRO tự động (Webhook + Active Verify)
- [ ] Comprehensive Testing với timer (Tuần 15–16)

### 💰 Monetization & Membership (`/dashboard/plans`)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Pricing UI | 3 Card Claymorphism (3-6-12 tháng) với hiệu ứng Anchor trung tâm | ✅ |
| PayOS Integration | Tích hợp SDK chính thức, thanh toán QR nhanh gọn | ✅ |
| Webhook Handler | Tự động mở khóa PRO khi nhận tín hiệu từ ngân hàng | ✅ |
| Active Verification | API `/verify-session` kiểm tra trạng thái tức thì khi redirect | ✅ |
| Membership Guard | Sidebar & Plans UI tự động ẩn/hiện theo trạng thái PRO | ✅ |
| Purchase Protection | Khóa gói thấp hơn khi người dùng đang dùng gói cao nhất | ✅ |
| Confirm Dialog | Hộp thoại xác nhận trước khi đẩy sang cổng thanh toán | ✅ |
| Refund System | Hoàn tiền 7 ngày, thu thập thông tin ngân hàng tự động | ✅ |
| Sidebar 2.0 | Cấu trúc Parent/Child, hiệu ứng Accordion mượt mà | ✅ |

**Files:** `app/dashboard/plans/page.tsx`, `api/payment/create-link/route.ts`, `api/payment/webhook/route.ts`, `api/payment/verify-session/route.ts`, `api/payment/request-refund/route.ts`, `components/dashboard/Sidebar.tsx`

### 🎤 Phase 3 — Chưa bắt đầu

- [ ] Listening với ElevenLabs TTS (Tuần 17–18)
- [ ] Speaking với Web Speech API (Tuần 19–20)
- [ ] AI Chatbot hội thoại Claude Sonnet (Tuần 21–22)
- [ ] Adaptive Learning & Recommendations (Tuần 23–24)

---

## 🎨 Design System đã triển khai

| Token | Giá trị | Dùng cho |
|---|---|---|
| `shadow-clay-card` | Drop shadow nổi | Các card chính |
| `shadow-clay-button` | Shadow nhẹ | Nút bấm, pill |
| `shadow-clay-pressed` | Shadow ấn vào | Nút đang active |
| `shadow-clay-inset` | Shadow lõm | Input, progress bar track |
| `clay-blue` | `#6496FF` approx | Primary accent |
| `clay-orange` | `#F4A460` approx | Warning, CTA phụ |
| `clay-green` | `#A8D5BA` approx | Success, mastered |
| `clay-deep` | `#3D3027` approx | Text chính |
| `clay-cream` | `#F5EFE6` approx | Background nhẹ |
| `warm-white` | `#FEFAF5` approx | Card background |

**Animations:**
- `fadeIn` — Toast xuất hiện từ trên
- `slideInRight` — Toast nổi từ phải
- `animate-breathe` — Pulse nhẹ cho icon
- `animate-pulse` — Progress bar đang active
- `animate-shimmer` — Hiệu ứng áng kim lấp lánh cho nút Premium

---

## 🏆 Thống kê file đã tạo/sửa

| Thư mục | Số file quan trọng |
|---|---|
| `app/dashboard/` | `page.tsx`, `layout.tsx`, `settings/page.tsx`, `flashcards/page.tsx` |
| `app/api/` | 6 route handlers |
| `app/actions/` | `study.ts` (SRS algorithm) |
| `app/study/` | `[slug]/page.tsx` |
| `components/dashboard/` | `Header.tsx`, `GenerateFlashcardButton.tsx`, `SearchInput.tsx` |
| `components/study/` | `Flashcard.tsx`, `FlashcardStudy.tsx` |
| `app/globals.css` | Design tokens + animations |
| `prisma/schema.prisma` | 5 models |

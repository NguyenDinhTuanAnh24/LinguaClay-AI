import Link from 'next/link'

const zaloSupportLink = process.env.NEXT_PUBLIC_ZALO_SUPPORT_URL || 'https://zalo.me/0866555468'
const telegramSupportLink = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || 'https://t.me/tzora24'

export default function StudyNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-4">
      <div className="mx-auto w-full max-w-2xl border-2 border-black bg-[#efebe4] p-6 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em]">Lỗi 404</p>
        <h1 className="mt-3 text-2xl font-black uppercase md:text-3xl">Tài khoản bị chặn truy cập</h1>
        <p className="mt-4 text-sm leading-6 md:text-base">
          Tài khoản của bạn đã bị vi phạm chính sách, điều khoản của hệ thống. Vui lòng liên hệ ADMIN để giải quyết.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link
            href={zaloSupportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-white px-4 py-3 text-center text-sm font-bold uppercase tracking-wide transition hover:bg-black hover:text-white"
          >
            Liên hệ Zalo
          </Link>
          <Link
            href={telegramSupportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-white px-4 py-3 text-center text-sm font-bold uppercase tracking-wide transition hover:bg-black hover:text-white"
          >
            Liên hệ Telegram
          </Link>
        </div>
      </div>
    </main>
  )
}

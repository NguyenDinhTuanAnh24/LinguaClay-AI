import React from 'react'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="py-32 border-b-2 border-newsprint-black bg-newsprint-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 text-newsprint-black hover:underline font-bold uppercase tracking-widest text-sm">
          ← Quay lại trang chủ
        </Link>
        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase text-newsprint-black mb-8 pt-10">
          TUYỂN DỤNG
        </h1>
        <p className="text-xl font-sans leading-relaxed text-newsprint-gray-dark max-w-2xl border-l-4 border-newsprint-black pl-6">
          Ngôn ngữ kết hợp thiết kế Brutalist. Đang trong quá trình hoàn thiện!
        </p>
      </div>
    </div>
  )
}

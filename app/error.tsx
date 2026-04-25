'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Boundary Error:', error)
  }, [error])

  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center bg-[#F5F0E8] p-4 text-center pb-24">
      <div className="border-[3px] border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] max-w-md w-full gap-4 flex flex-col">
          <h2 className="text-2xl font-serif font-black uppercase text-black">Đã có lỗi xảy ra!</h2>
          <p className="text-sm font-sans text-gray-700">Client Component của chúng tôi vừa gặp trục trặc kỹ thuật. Vui lòng thử lại.</p>
          <button
            onClick={() => reset()}
            className="w-full bg-red-600 text-white font-black uppercase text-sm px-6 py-4 border-[3px] border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
          >
            Thử Lại Ngay
          </button>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: string
    name: string
    price: number
    duration: string
  } | null
  userId: string
}

export default function PaymentModal({ isOpen, onClose, plan, userId }: PaymentModalProps) {
  if (!plan) return null

  // Tạo note chuyển khoản: LC PRO [UserId] [PlanType]
  const paymentNote = `LC PRO ${userId.slice(-6).toUpperCase()} ${plan.id}`
  const qrUrl = `https://img.vietqr.io/image/MB-0866555468-compact.png?amount=${plan.price}&addInfo=${encodeURIComponent(paymentNote)}&accountName=NGUYEN%20TUAN%20ANH`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-clay-deep/60 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="pointer-events-auto w-full max-w-md bg-clay-cream rounded-[50px] shadow-2xl border-4 border-white overflow-hidden relative"
            >
              <div className="bg-gradient-to-br from-clay-blue to-clay-green p-8 text-white text-center space-y-2">
                <div className="text-4xl mb-2">💎</div>
                <h2 className="text-2xl font-heading font-black">Xác nhận nâng cấp</h2>
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{plan.name} • {plan.duration}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* QR Code Section */}
                <div className="bg-white rounded-[40px] p-6 shadow-clay-card flex flex-col items-center space-y-4">
                   <div className="w-full aspect-square bg-clay-cream rounded-[30px] flex items-center justify-center overflow-hidden border-2 border-clay-shadow/10 p-4">
                      <img 
                        src={qrUrl} 
                        alt="VietQR Payment" 
                        className="w-full h-full object-contain"
                      />
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-clay-muted uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                      <h3 className="text-2xl font-heading font-black text-clay-deep">{plan.price.toLocaleString()}đ</h3>
                   </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                   <div className="bg-clay-blue/5 border-2 border-clay-blue/20 rounded-[25px] p-5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                         <span className="font-black text-clay-muted uppercase tracking-tighter">Nội dung chuyển khoản:</span>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(paymentNote)
                             alert('Đã copy nội dung!')
                           }}
                           className="bg-clay-blue text-white p-1.5 rounded-lg shadow-clay-button text-[10px] font-bold"
                         >
                           COPY 📋
                         </button>
                      </div>
                      <div className="bg-white px-4 py-3 rounded-xl border-2 border-clay-blue/10 font-mono font-black text-clay-blue text-center overflow-hidden whitespace-nowrap overflow-ellipsis">
                         {paymentNote}
                      </div>
                   </div>

                   <p className="text-[10px] text-clay-muted font-bold text-center leading-relaxed">
                      💡 Mẹo: Dùng ứng dụng Ngân hàng quét QR để nội dung và số tiền được điền tự động.
                   </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-clay-deep text-white font-heading font-black text-sm rounded-[22px] shadow-clay-button active:scale-95 transition-all"
                >
                  Xong, Đã chuyển khoản ✅
                </button>
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

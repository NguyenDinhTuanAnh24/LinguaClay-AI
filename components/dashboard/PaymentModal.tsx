'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, ShieldCheck, QrCode } from 'lucide-react'

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
            className="fixed inset-0 bg-newsprint-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pointer-events-auto w-full max-w-md bg-white border-[4px] border-newsprint-black shadow-brutalist-heavy overflow-hidden relative"
            >
              <div className="bg-red-600 border-b-[4px] border-newsprint-black p-8 text-white text-center space-y-4">
                <div className="w-16 h-16 bg-newsprint-black border-[3px] border-white mx-auto flex items-center justify-center shadow-brutalist-soft -rotate-3 transition-transform">
                  <ShieldCheck size={32} strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Xác nhận nâng cấp</h2>
                  <p className="text-[10px] font-sans font-black text-white/80 uppercase tracking-[0.2em]">{plan.name} • {plan.duration}</p>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-newsprint-paper">
                {/* QR Code Section */}
                <div className="bg-white border-[3px] border-newsprint-black p-6 shadow-brutalist-card flex flex-col items-center space-y-6 relative overflow-hidden group">
                   <div className="absolute top-2 right-2 text-newsprint-black/5 rotate-12"><QrCode size={100} /></div>
                   <div className="w-full aspect-square bg-newsprint-paper border-[2px] border-newsprint-black/10 p-2 relative z-10">
                      <img 
                        src={qrUrl} 
                        alt="VietQR Payment" 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                   </div>
                   <div className="text-center relative z-10 w-full border-t-[2px] border-newsprint-black pt-4">
                      <p className="text-[10px] font-sans font-black text-newsprint-gray-dark uppercase tracking-widest mb-1">TỔNG THANH TOÁN</p>
                      <h3 className="text-4xl font-serif font-black text-newsprint-black">{plan.price.toLocaleString()}đ</h3>
                   </div>
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                   <div className="bg-white border-[3px] border-newsprint-black p-5 space-y-4 shadow-brutalist-soft">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-sans font-black text-newsprint-gray-dark uppercase tracking-tighter">NỘI DUNG CHUYỂN KHOẢN:</span>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(paymentNote)
                           }}
                           className="bg-newsprint-black text-white px-3 py-1.5 border-[2px] border-newsprint-black text-[9px] font-sans font-black uppercase hover:bg-white hover:text-newsprint-black transition-all flex items-center gap-2"
                         >
                           COPY <Copy size={12} strokeWidth={3} />
                         </button>
                      </div>
                      <div className="bg-newsprint-paper px-4 py-4 border-[2px] border-newsprint-black font-sans font-black text-newsprint-black text-center text-sm tracking-widest break-all">
                         {paymentNote}
                      </div>
                   </div>

                   <p className="text-[10px] text-newsprint-gray-dark font-sans font-bold text-center leading-relaxed uppercase tracking-tight">
                      QUÉT MÃ QR ĐỂ TỰ ĐỘNG ĐIỀN THÔNG TIN THANH TOÁN.
                   </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-newsprint-black text-white font-sans font-black text-xs uppercase tracking-[0.2em] border-[3px] border-newsprint-black shadow-brutalist-soft hover:bg-red-600 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  XONG, ĐÃ CHUYỂN KHOẢN <Check size={18} strokeWidth={3} />
                </button>
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 border-[2px] border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-all group"
              >
                <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

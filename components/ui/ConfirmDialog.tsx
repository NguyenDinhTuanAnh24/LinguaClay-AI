'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, HelpCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  danger = false
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (typeof window === 'undefined') return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-[rgba(20,20,20,0.55)] z-[9998]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#F5F0E8] border-[4px] border-newsprint-black shadow-brutalist-heavy p-10 pointer-events-auto relative overflow-hidden"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-newsprint-paper border-b-[3px] border-l-[3px] border-newsprint-black -mr-8 -mt-8 rotate-45" />

              <div className="text-center space-y-6 relative z-10">
                <div className={`w-20 h-20 mx-auto border-[3px] flex items-center justify-center shadow-brutalist-soft transition-transform hover:-rotate-3 ${
                  danger
                    ? 'bg-[#FEEBEC] text-[#B42318] border-[#B42318]'
                    : 'bg-[#141414] text-white border-[#F3F3F3]'
                }`}>
                  {danger ? <AlertTriangle size={34} strokeWidth={3.2} /> : <HelpCircle size={34} strokeWidth={3.2} />}
                </div>
                
                <div className="space-y-2">
                  <h3 className={`text-3xl font-serif font-black uppercase tracking-normal leading-[1.1] ${
                    danger ? 'text-[#8F1D14]' : 'text-newsprint-black'
                  }`}>{title}</h3>
                  <p className="text-[11px] text-newsprint-black/90 font-sans font-bold uppercase tracking-normal leading-[1.5] px-4">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={onConfirm}
                    className={`w-full py-5 border-[3px] shadow-brutalist-soft hover:shadow-none hover:translate-y-1 active:translate-y-2 transition-all text-xs font-sans font-black uppercase tracking-widest ${
                      danger
                        ? 'bg-[#B42318] border-[#B42318] text-white hover:bg-[#8F1D14]'
                        : 'bg-[#141414] border-[#141414] text-white hover:bg-[#000000]'
                    }`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full py-5 bg-white border-[3px] border-newsprint-black hover:bg-[#ECE6DD] transition-all text-xs font-sans font-black text-newsprint-black uppercase tracking-widest"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

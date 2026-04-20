'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen fixed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-clay-deep/30 backdrop-blur-[4px] z-[9998]"
          />
          
          {/* Modal Container - Full screen fixed flex */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-sm bg-white rounded-[45px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-4 border-white p-10 pointer-events-auto"
            >
              <div className="text-center space-y-5">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-clay-inset ${danger ? 'bg-red-50 text-red-500' : 'bg-clay-blue/10 text-clay-blue'}`}>
                  {danger ? '⚠️' : '❓'}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-black text-clay-deep tracking-tight">{title}</h3>
                  <p className="text-sm text-clay-muted font-medium px-4 leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-4 bg-white rounded-[22px] shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all text-xs font-heading font-black text-clay-muted border-2 border-clay-cream/50 uppercase tracking-wider"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 py-4 rounded-[22px] shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all text-xs font-heading font-black text-white uppercase tracking-wider ${danger ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-red-200' : 'bg-gradient-to-r from-clay-blue to-clay-blue-dark'}`}
                  >
                    {confirmText}
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

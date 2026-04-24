'use client'

import { useRef, useState } from 'react'

export type AdminToastType = 'success' | 'error' | 'info'
export type AdminToastItem = { id: number; message: string; type: AdminToastType }
export type AdminConfirmItem = {
  message: string
  confirmText: string
  cancelText: string
}

export function useAdminToast(durationMs = 2600) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([])
  const counterRef = useRef(0)

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const showToast = (message: string, type: AdminToastType) => {
    const id = ++counterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => dismissToast(id), durationMs)
  }

  return { toasts, showToast }
}

export function AdminToastStack({ toasts }: { toasts: AdminToastItem[] }) {
  if (!toasts.length) return null

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[280px] border px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(20,20,20,0.9)] ${
            toast.type === 'success'
              ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
              : toast.type === 'error'
                ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
                : 'border-[#1F2937] bg-[#F3F4F6] text-[#1F2937]'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export function useAdminConfirm() {
  const [confirm, setConfirm] = useState<AdminConfirmItem | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const requestConfirm = (
    message: string,
    options?: Partial<Pick<AdminConfirmItem, 'confirmText' | 'cancelText'>>
  ): Promise<boolean> => {
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    setConfirm({
      message,
      confirmText: options?.confirmText || 'Xác nhận',
      cancelText: options?.cancelText || 'Hủy',
    })
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }

  const resolveConfirm = (value: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(value)
      resolverRef.current = null
    }
    setConfirm(null)
  }

  return {
    confirm,
    requestConfirm,
    confirmYes: () => resolveConfirm(true),
    confirmNo: () => resolveConfirm(false),
  }
}

export function AdminConfirmToast({
  confirm,
  onConfirm,
  onCancel,
}: {
  confirm: AdminConfirmItem | null
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!confirm) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(20,20,20,0.28)] p-4">
      <div className="min-w-[320px] max-w-[420px] border border-[#141414] bg-[#F5F0E8] p-3 text-sm font-semibold text-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,0.9)]">
        <p>{confirm.message}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-[#141414] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em]"
          >
            {confirm.cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="border border-[#141414] bg-[#141414] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#F5F0E8]"
          >
            {confirm.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

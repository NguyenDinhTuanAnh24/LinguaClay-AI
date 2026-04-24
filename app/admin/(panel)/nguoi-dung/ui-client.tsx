'use client'
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { AdminConfirmToast, AdminToastStack, useAdminConfirm, useAdminToast } from '../_components/admin-toast'

export type UserPanelItem = {
  id: string
  name: string
  email: string
  avatar: string
  avatarUrl?: string | null
  plan: 'Free' | 'Pro'
  planLabel: string
  isYearPlan: boolean
  isActive: boolean
  isBanned: boolean
  streak: number
  joinedAt: string
  status: 'Active' | 'Banned'
  srsProgress: string
  studyHistory: string[]
}

type ActionType = 'activate_pro' | 'cancel_pro' | 'ban' | 'unban'

function getPlanLabel(isPro: boolean, proType: string | null): string {
  if (!isPro) return 'Bản miễn phí'
  const key = (proType || '').toUpperCase()
  if (key.includes('3_MONTHS')) return 'Bản tiêu chuẩn (3 tháng)'
  if (key.includes('6_MONTHS')) return 'Bản chuyên sâu (6 tháng)'
  if (key.includes('1_YEAR') || key.includes('12') || key.includes('YEAR')) return 'Bản toàn diện (1 năm)'
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  if (adminMatch) return `Gói ADMIN cấp (${adminMatch[1]} tháng)`
  return 'Đã nâng cấp'
}

function isYearPlanType(isPro: boolean, proType: string | null): boolean {
  if (!isPro) return false
  const key = (proType || '').toUpperCase()
  if (key.includes('1_YEAR') || key.includes('YEAR') || key.includes('12_MONTHS')) return true
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  return adminMatch ? Number(adminMatch[1]) >= 12 : false
}

function AvatarBadge({ initials, avatarUrl, size = 28 }: { initials: string; avatarUrl?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const showImage = !!avatarUrl && !imgError
  return (
    <span
      className="grid place-items-center overflow-hidden border border-[#141414] bg-[#141414] text-xs font-black text-[#F5F0E8]"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={initials}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        initials
      )}
    </span>
  )
}

export function NguoiDungClient({ users, canManage }: { users: UserPanelItem[]; canManage: boolean }) {
  const [usersState, setUsersState] = useState(users)
  const [busyAction, setBusyAction] = useState<ActionType | null>(null)
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'Free' | 'Pro'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Banned'>('all')
  const [selectedId, setSelectedId] = useState(usersState[0]?.id ?? '')
  const { toasts, showToast } = useAdminToast()
  const { confirm, requestConfirm, confirmYes, confirmNo } = useAdminConfirm()
  const [proMonths, setProMonths] = useState<number>(1)
  const [couponCode, setCouponCode] = useState('')
  const [assigningCoupon, setAssigningCoupon] = useState(false)

  const filteredUsers = useMemo(() => {
    return usersState.filter((user) => {
      const q = query.trim().toLowerCase()
      const matchQuery = q.length === 0 || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      const matchPlan = planFilter === 'all' || user.plan === planFilter
      const matchStatus = statusFilter === 'all' || user.status === statusFilter
      return matchQuery && matchPlan && matchStatus
    })
  }, [query, planFilter, statusFilter, usersState])

  const selectedUser = filteredUsers.find((x) => x.id === selectedId) ?? filteredUsers[0] ?? usersState[0]
  const upgradeLocked = Boolean(selectedUser?.isYearPlan)

  const runAction = async (action: ActionType) => {
    if (!selectedUser || !canManage) return
    if (action === 'activate_pro' && selectedUser.isYearPlan) {
      showToast('Người dùng đã có gói 1 năm, không thể cấp thêm.', 'info')
      return
    }
    const confirmMessageMap: Record<ActionType, string> = {
      activate_pro: `Xác nhận cấp gói nâng cấp ${proMonths} tháng cho ${selectedUser.email}?`,
      cancel_pro: `Xác nhận hủy gói nâng cấp của ${selectedUser.email}?`,
      ban: `Xác nhận ban tài khoản ${selectedUser.email}?`,
      unban: `Xác nhận mở khóa tài khoản ${selectedUser.email}?`,
    }
    const canceledMessageMap: Record<ActionType, string> = {
      activate_pro: 'Đã hủy thao tác cấp gói nâng cấp.',
      cancel_pro: 'Đã hủy thao tác hủy gói nâng cấp.',
      ban: 'Đã hủy thao tác ban tài khoản.',
      unban: 'Đã hủy thao tác mở khóa tài khoản.',
    }
    const confirmed = await requestConfirm(confirmMessageMap[action], {
      confirmText: 'Đồng ý',
      cancelText: 'Hủy',
    })
    if (!confirmed) {
      showToast(canceledMessageMap[action], 'info')
      return
    }
    try {
      setBusyAction(action)
      const res = await fetch(`/api/admin/users/${selectedUser.id}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...(action === 'activate_pro' ? { months: proMonths } : {}),
        }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error || 'Không thể cập nhật người dùng')
      }

      const json = (await res.json()) as {
        user: { isPro: boolean; proType: string | null; isActive: boolean; isBanned: boolean }
        emailSent?: boolean
        emailProvider?: 'resend' | 'gmail' | null
        emailError?: string
      }
      setUsersState((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                plan: json.user.isPro ? 'Pro' : 'Free',
                planLabel: getPlanLabel(json.user.isPro, json.user.proType),
                isYearPlan: isYearPlanType(json.user.isPro, json.user.proType),
                isActive: json.user.isActive,
                isBanned: json.user.isBanned,
                status: json.user.isBanned || !json.user.isActive ? 'Banned' : 'Active',
              }
            : u
        )
      )

      if (action === 'ban') {
        if (json.emailSent === false) {
          showToast(`Đã ban tài khoản ${selectedUser.email}, nhưng gửi email thất bại (${json.emailError || 'Unknown error'}).`, 'error')
        } else if (json.emailSent) {
          showToast(`Đã ban tài khoản ${selectedUser.email} và đã gửi email (${json.emailProvider || 'mail'}).`, 'success')
        } else {
          showToast(`Đã ban tài khoản ${selectedUser.email}.`, 'success')
        }
      }
      if (action === 'unban') {
        showToast(`Đã mở khóa tài khoản ${selectedUser.email}.`, 'success')
      }
      if (action === 'activate_pro') {
        showToast(`Đã cấp gói nâng cấp ${proMonths} tháng cho ${selectedUser.email}.`, 'success')
      }
      if (action === 'cancel_pro') {
        showToast(`Đã hủy gói nâng cấp của ${selectedUser.email}.`, 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi cập nhật'
      showToast(message, 'error')
    } finally {
      setBusyAction(null)
    }
  }

  const assignCoupon = async () => {
    if (!selectedUser || !canManage) return
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      showToast('Vui lòng nhập mã khuyến mãi.', 'error')
      return
    }
    try {
      setAssigningCoupon(true)
      const res = await fetch('/api/admin/coupons/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          couponCode: code,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Không thể cấp khuyến mãi')
      }
      setCouponCode('')
      showToast(`Đã cấp mã ${code} cho ${selectedUser.email}.`, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cấp khuyến mãi'
      showToast(message, 'error')
    } finally {
      setAssigningCoupon(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminConfirmToast confirm={confirm} onConfirm={confirmYes} onCancel={confirmNo} />
      <AdminToastStack toasts={toasts} />

      <section
        className="border border-[#141414] bg-[#F5F0E8] p-6 transition-all hover:-translate-y-px hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,0.95)]"
        style={{ boxShadow: '8px 8px 0 0 rgba(20,20,20,0.92)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">Admin Module</p>
        <h1 className="mt-2 text-4xl font-serif font-black text-[#141414]">Người dùng</h1>
        <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Theo dõi user, lọc nhanh và thao tác ngay trên panel bên phải.</p>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <article className="border border-[#141414] bg-[#F5F0E8] p-4" style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex h-9 min-w-[260px] items-center gap-2 border border-[#141414] bg-[#F5F0E8] px-3 text-sm">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="w-full bg-transparent outline-none"
              />
            </label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as 'all' | 'Free' | 'Pro')}
              className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
            >
              <option value="all">Tất cả gói</option>
              <option value="Free">Bản miễn phí</option>
              <option value="Pro">Đã nâng cấp</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Banned')}
              className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Active</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-[#141414]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#ECE6DB]">
                <tr>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Tên</th>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Email</th>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Gói</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Streak</th>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày đăng ký</th>
                  <th className="border border-[#141414] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em]">Trạng thái</th>
                  <th className="border border-[#141414] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em]">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer ${selectedUser?.id === user.id ? 'bg-[#E8E1D5]' : 'odd:bg-[#F5F0E8] even:bg-[#EFEAE0]'}`}
                    onClick={() => setSelectedId(user.id)}
                  >
                    <td className="border border-[#141414] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <AvatarBadge initials={user.avatar} avatarUrl={user.avatarUrl} size={28} />
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="border border-[#141414] px-3 py-2">{user.email}</td>
                    <td className="border border-[#141414] px-3 py-2 font-semibold">{user.planLabel}</td>
                    <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{user.streak}</td>
                    <td className="border border-[#141414] px-3 py-2 tabular-nums">{user.joinedAt}</td>
                    <td className="border border-[#141414] px-3 py-2 text-center">
                      <span
                        className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase ${
                          user.status === 'Active' ? 'border-[#166534] text-[#166534]' : 'border-[#B91C1C] text-[#B91C1C]'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="border border-[#141414] px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedId(user.id)
                        }}
                        className="border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="border border-[#141414] bg-[#F5F0E8] p-4" style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}>
          {selectedUser ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#4B4B4B]">Panel người dùng</p>
              <div className="mt-2 flex items-center gap-2">
                <AvatarBadge initials={selectedUser.avatar} avatarUrl={selectedUser.avatarUrl} size={36} />
                <h2 className="text-xl font-serif font-black">{selectedUser.name}</h2>
              </div>
              <p className="text-sm font-semibold text-[#4B4B4B]">{selectedUser.email}</p>

              <div className="mt-4 space-y-3">
                <div className="border border-[#141414] bg-[#EFEAE0] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em]">Thông tin cá nhân</p>
                  <p className="mt-2 text-sm font-semibold">Gói hiện tại: {selectedUser.planLabel}</p>
                  <p className="text-sm font-semibold">Ngày đăng ký: {selectedUser.joinedAt}</p>
                  <p className="text-sm font-semibold">Trạng thái: {selectedUser.status}</p>
                </div>
                <div className="border border-[#141414] bg-[#EFEAE0] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em]">Tiến độ SRS</p>
                  <p className="mt-2 text-sm font-semibold">{selectedUser.srsProgress}</p>
                </div>
                <div className="border border-[#141414] bg-[#EFEAE0] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em]">Lịch sử học tập</p>
                  <ul className="mt-2 space-y-1 text-sm font-semibold text-[#4B4B4B]">
                    {selectedUser.studyHistory.map((log) => (
                      <li key={log}>• {log}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="border border-[#141414] bg-[#EFEAE0] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em]">Gửi khuyến mãi</p>
                  <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã (VD: SPRING20)"
                      className="h-8 border border-[#141414] bg-[#F5F0E8] px-2 text-xs font-semibold"
                      disabled={!canManage || assigningCoupon || busyAction !== null}
                    />
                    <button
                      type="button"
                      onClick={assignCoupon}
                      disabled={!canManage || assigningCoupon || busyAction !== null}
                      className="h-8 border border-[#141414] bg-[#141414] px-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assigningCoupon ? 'Đang gửi...' : 'Gửi mã'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-[#4B4B4B]">Thời hạn gói cấp</label>
                  <select
                    value={proMonths}
                    onChange={(e) => setProMonths(Number(e.target.value))}
                    className="h-8 border border-[#141414] bg-[#F5F0E8] px-2 text-xs font-bold"
                    disabled={!canManage || busyAction !== null || upgradeLocked}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month} tháng
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!canManage || busyAction !== null || upgradeLocked}
                  onClick={() => runAction('activate_pro')}
                  className={`border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed ${
                    upgradeLocked
                      ? 'border-[#9CA3AF] bg-[#E5E7EB] text-[#6B7280] opacity-70'
                      : 'border-[#141414] bg-[#141414] text-[#F5F0E8] disabled:opacity-50'
                  }`}
                >
                  {busyAction === 'activate_pro'
                    ? 'Đang xử lý...'
                    : upgradeLocked
                      ? 'Đã có gói 1 năm'
                      : `Cấp gói nâng cấp (${proMonths} tháng)`}
                </button>
                <button
                  type="button"
                  disabled={!canManage || busyAction !== null}
                  onClick={() => runAction('cancel_pro')}
                  className="border border-[#141414] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === 'cancel_pro' ? 'Đang xử lý...' : 'Hủy gói'}
                </button>
                {selectedUser.status === 'Banned' ? (
                  <button
                    type="button"
                    disabled={!canManage || busyAction !== null}
                    onClick={() => runAction('unban')}
                    className="border border-[#166534] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === 'unban' ? 'Đang xử lý...' : 'Hủy ban tài khoản'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canManage || busyAction !== null}
                    onClick={() => runAction('ban')}
                    className="border border-[#B91C1C] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === 'ban' ? 'Đang xử lý...' : 'Ban tài khoản'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-[#4B4B4B]">Không có dữ liệu người dùng.</p>
          )}
        </aside>
      </section>
    </div>
  )
}

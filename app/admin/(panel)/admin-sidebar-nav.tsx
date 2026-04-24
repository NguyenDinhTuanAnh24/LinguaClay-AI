'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpenText, Users, Wallet, Bot, HandHelping } from 'lucide-react'

type ModuleItem = {
  label: string
  href: string
  enabled: boolean
  icon: 'dashboard' | 'materials' | 'users' | 'payments' | 'ai' | 'supportRefund'
}

const iconMap = {
  dashboard: LayoutDashboard,
  materials: BookOpenText,
  users: Users,
  payments: Wallet,
  ai: Bot,
  supportRefund: HandHelping,
}

export function AdminSidebarNav({ modules }: { modules: ModuleItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4">
      <ul className="space-y-2">
        {modules.map((item) => {
          const Icon = iconMap[item.icon]
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

          return (
            <li key={item.label}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 border px-3 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,0.9)]"
                  style={{
                    borderColor: '#141414',
                    background: active ? '#141414' : '#F5F0E8',
                    color: active ? '#F5F0E8' : '#141414',
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              ) : (
                <div
                  className="flex cursor-not-allowed items-center justify-between gap-3 border px-3 py-3 text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ borderColor: '#141414', background: '#F5F0E8', color: '#8B857D', opacity: 0.48 }}
                  aria-disabled="true"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={15} />
                    {item.label}
                  </span>
                  <span className="text-[9px] tracking-[0.1em]">Sắp mở</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

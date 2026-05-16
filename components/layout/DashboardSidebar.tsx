'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Building2, LayoutDashboard, ShoppingBag, Heart, Briefcase,
  Upload, BarChart2, Wallet, Users, FileText, DollarSign,
  Settings, LogOut, Menu, X, Bell, Shield, ArrowDownToLine
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ArchiProfile } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

const customerLinks: SidebarLink[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/dashboard/purchases', label: 'My Purchases', icon: <ShoppingBag size={18} /> },
  { href: '/dashboard/favorites', label: 'Saved Plans', icon: <Heart size={18} /> },
  { href: '/dashboard/hire', label: 'Hire Requests', icon: <Briefcase size={18} /> },
]

const engineerLinks: SidebarLink[] = [
  { href: '/engineer', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/engineer/plans', label: 'My Plans', icon: <FileText size={18} /> },
  { href: '/engineer/plans/upload', label: 'Upload Plan', icon: <Upload size={18} /> },
  { href: '/engineer/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { href: '/engineer/earnings', label: 'Earnings', icon: <DollarSign size={18} /> },
  { href: '/engineer/wallet', label: 'Wallet', icon: <Wallet size={18} /> },
  { href: '/engineer/hire', label: 'Hire Requests', icon: <Briefcase size={18} /> },
]

const adminLinks: SidebarLink[] = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { href: '/admin/engineers', label: 'Engineers', icon: <Shield size={18} /> },
  { href: '/admin/plans', label: 'Plans', icon: <FileText size={18} /> },
  { href: '/admin/transactions', label: 'Transactions', icon: <DollarSign size={18} /> },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: <ArrowDownToLine size={18} /> },
]

interface DashboardSidebarProps {
  profile: ArchiProfile
}

export default function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const links = profile.role === 'admin' ? adminLinks : profile.role === 'engineer' ? engineerLinks : customerLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-[#2E2E2E]">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-black" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-white">Archi</span>
            <span className="text-[#D4AF37]">Hub</span>
          </span>
        </Link>
      </div>

      {/* Profile */}
      <div className="p-5 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-[#D4AF37] capitalize">{profile.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/engineer' && link.href !== '/admin' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={isActive ? 'text-[#D4AF37]' : ''}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-[#2E2E2E] space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen(false)}
        >
          <Settings size={18} />
          Settings
        </Link>
        <Link
          href="/marketplace"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen(false)}
        >
          <Bell size={18} />
          Notifications
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B] border-b border-[#2E2E2E] h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="p-1.5 text-gray-400 hover:text-white">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <Building2 size={14} className="text-black" />
          </div>
          <span className="font-bold text-sm">
            <span className="text-white">Archi</span><span className="text-[#D4AF37]">Hub</span>
          </span>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-[#0D0D0D] border-r border-[#2E2E2E] h-full">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0D0D0D] border-r border-[#2E2E2E] h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}

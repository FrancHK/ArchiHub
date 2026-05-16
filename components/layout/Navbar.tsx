'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, User, LayoutDashboard, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ArchiProfile } from '@/lib/types/database'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/engineers', label: 'Engineers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<ArchiProfile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase.from('archi_profiles').select('*').eq('id', authUser.id).single()
          .then(({ data }) => setUser(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'engineer' ? '/engineer' : '/dashboard'

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#2E2E2E]' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-black" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Archi</span>
            <span className="text-[#D4AF37]">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-[#D4AF37] ${pathname.startsWith(link.href) ? 'text-[#D4AF37]' : 'text-gray-400'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white leading-tight">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[#161616] border border-[#2E2E2E] rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-[#D4AF37]" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} className="text-[#D4AF37]" />
                      Profile
                    </Link>
                    <div className="border-t border-[#2E2E2E]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="gold" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0B0B0B]/98 backdrop-blur-md border-b border-[#2E2E2E]">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium py-2 transition-colors ${pathname.startsWith(link.href) ? 'text-[#D4AF37]' : 'text-gray-400'}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#2E2E2E] pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={dashboardHref} onClick={() => setMenuOpen(false)}>
                    <Button variant="dark" size="md" fullWidth>Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="md" fullWidth onClick={handleLogout}>Sign out</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="dark" size="md" fullWidth>Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button variant="gold" size="md" fullWidth>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

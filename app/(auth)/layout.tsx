import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0B] px-4 py-16">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-black" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">Archi</span>
              <span className="text-[#D4AF37]">Hub</span>
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  )
}

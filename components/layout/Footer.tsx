import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#2E2E2E] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-black" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-white">Archi</span>
                <span className="text-[#D4AF37]">Hub</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Africa&apos;s premier marketplace for architectural plans and engineering services. Connecting talent with opportunity.
            </p>
            <div className="flex items-center gap-3">
              {['𝕏', 'in', '▷', 'fb'].map((label, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-200 text-xs font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/marketplace', label: 'Browse Plans' },
                { href: '/engineers', label: 'Find Engineers' },
                { href: '/register?role=engineer', label: 'Sell Your Plans' },
                { href: '/about', label: 'How It Works' },
                { href: '/pricing', label: 'Pricing' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/refund', label: 'Refund Policy' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={16} className="text-[#D4AF37] shrink-0" />
                support@archihub.com
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={16} className="text-[#D4AF37] shrink-0" />
                +254 700 000 000
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin size={16} className="text-[#D4AF37] shrink-0" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {year} ArchiHub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[#D4AF37] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

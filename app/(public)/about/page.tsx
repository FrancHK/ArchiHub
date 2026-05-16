import { Building2, Shield, TrendingUp, Users, Heart, Globe } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AboutPage() {
  const values = [
    { icon: <Shield size={24} />, title: 'Trust & Verification', desc: 'Every engineer on our platform is manually verified to ensure professionalism and competence.' },
    { icon: <Heart size={24} />, title: 'Client First', desc: 'We design every feature around the homeowner experience — from browsing to building.' },
    { icon: <TrendingUp size={24} />, title: 'Engineer Growth', desc: 'We give engineers the tools to grow their practice, reach more clients, and earn more.' },
    { icon: <Globe size={24} />, title: 'Africa-Focused', desc: 'Built for Africa\'s unique construction landscape, climate, and architectural traditions.' },
  ]

  const team = [
    { name: 'Alex Kimani', role: 'CEO & Co-Founder', bio: 'Civil engineer with 15 years of construction experience across East Africa.' },
    { name: 'Grace Odhiambo', role: 'CTO', bio: 'Full-stack engineer passionate about building products that matter.' },
    { name: 'James Mwangi', role: 'Head of Design', bio: 'Award-winning architect turned UX designer.' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-20">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl mb-6">
            <Building2 size={28} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Building Africa&apos;s <span className="text-[#D4AF37]">Future</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            ArchiHub was founded with a simple belief: everyone deserves access to professional architectural expertise and high-quality house plans, regardless of where they are.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-[#161616] border border-[#D4AF37]/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Our Mission</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
            To democratize access to world-class architectural design and engineering expertise across Africa — connecting talented professionals with homeowners and developers who want to build better.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            What We <span className="text-[#D4AF37]">Stand For</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 flex gap-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1.5">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            The <span className="text-[#D4AF37]">Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map(member => (
              <div key={member.name} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/20 to-[#A88A1C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-[#D4AF37] mb-2">{member.role}</p>
                <p className="text-sm text-gray-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Us?</h2>
          <p className="text-gray-400 mb-8">Whether you&apos;re building a home or looking to grow your practice, ArchiHub is for you.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register"><Button variant="gold" size="lg">Get Started</Button></Link>
            <Link href="/contact"><Button variant="outline" size="lg">Contact Us</Button></Link>
          </div>
        </section>
      </div>
    </div>
  )
}

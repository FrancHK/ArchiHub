import Link from 'next/link'
import { ArrowRight, Building2, Star, Shield, TrendingUp, Download, Users, Home, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import type { ArchiPlan, ArchiEngineerProfile, ArchiProfile } from '@/lib/types/database'
import PlanCard from '@/components/marketplace/PlanCard'
import EngineerCard from '@/components/engineer/EngineerCard'
import HeroSection from './HeroSection'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion'

async function getFeaturedData() {
  const supabase = await createClient()

  const [{ data: plans }, { data: engineers }] = await Promise.all([
    supabase
      .from('archi_plans')
      .select('*, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*))')
      .eq('is_published', true)
      .order('total_sales', { ascending: false })
      .limit(6),
    supabase
      .from('archi_engineer_profiles')
      .select('*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)')
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(4),
  ])

  return { plans: plans || [], engineers: engineers || [] }
}

export default async function LandingPage() {
  const { plans, engineers } = await getFeaturedData()

  const stats = [
    { label: 'House Plans', value: '500+', icon: <Home size={20} /> },
    { label: 'Verified Engineers', value: '120+', icon: <Shield size={20} /> },
    { label: 'Happy Clients', value: '2,400+', icon: <Users size={20} /> },
    { label: 'Plans Sold', value: '800+', icon: <TrendingUp size={20} /> },
  ]

  const steps = [
    { step: '01', title: 'Browse Plans', desc: 'Explore hundreds of professionally designed house plans sorted by style, size, and budget.' },
    { step: '02', title: 'Purchase & Download', desc: 'Buy your chosen plan instantly and download full architectural drawings in PDF format.' },
    { step: '03', title: 'Hire an Engineer', desc: 'Connect with a verified engineer for on-site supervision and project management.' },
    { step: '04', title: 'Build Your Dream', desc: 'Start construction with confidence knowing professionals are guiding every stage.' },
  ]

  const testimonials = [
    { name: 'David Kamau', role: 'Homeowner, Nairobi', rating: 5, text: 'Found the perfect 4-bedroom design on ArchiHub. The quality of the plan was outstanding and the engineer hired through the platform was fantastic.' },
    { name: 'Arch. Sarah Mwangi', role: 'Architect', rating: 5, text: 'ArchiHub transformed my practice. I\'ve sold over 50 plans and built a steady income stream beyond my private clients.' },
    { name: 'Peter Otieno', role: 'Property Developer', rating: 5, text: 'The platform saves me weeks of searching. I can browse, compare, and purchase architectural plans in minutes. Truly professional.' },
  ]

  const houseTypes = [
    { label: 'Modern', emoji: '🏙️', href: '/marketplace?house_type=modern' },
    { label: 'Classic', emoji: '🏛️', href: '/marketplace?house_type=classic' },
    { label: 'Bungalow', emoji: '🏡', href: '/marketplace?house_type=bungalow' },
    { label: 'Villa', emoji: '🏰', href: '/marketplace?house_type=villa' },
    { label: 'Contemporary', emoji: '🏢', href: '/marketplace?house_type=contemporary' },
    { label: 'Apartment', emoji: '🏗️', href: '/marketplace?house_type=apartment' },
  ]

  return (
    <div className="overflow-x-hidden">
      {/* ──── Hero (client, animated) ──── */}
      <HeroSection />

      {/* ──── Stats ──── */}
      <section className="py-16 border-y border-[#2E2E2E] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggerContainer stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[#D4AF37]">{stat.icon}</span>
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-[#D4AF37]">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──── Categories ──── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Browse by <span className="text-[#D4AF37]">Style</span>
          </h2>
          <p className="text-gray-400">Find the perfect architecture style for your vision</p>
        </FadeIn>

        <StaggerContainer stagger={0.07} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {houseTypes.map(type => (
            <StaggerItem key={type.label}>
              <Link href={type.href}>
                <div className="group bg-[#161616] border border-[#2E2E2E] rounded-2xl p-5 text-center hover:border-[#D4AF37]/40 hover:bg-[#1A1700] transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  <span className="text-3xl mb-2 block">{type.emoji}</span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-[#D4AF37] transition-colors">{type.label}</span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ──── Featured Plans ──── */}
      {plans.length > 0 && (
        <section className="py-20 bg-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Featured <span className="text-[#D4AF37]">Plans</span>
                </h2>
                <p className="text-gray-400">Most popular architectural designs this month</p>
              </div>
              <Link href="/marketplace" className="hidden md:flex items-center gap-1.5 text-[#D4AF37] text-sm hover:gap-2.5 transition-all">
                View all <ChevronRight size={16} />
              </Link>
            </FadeIn>

            <StaggerContainer stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(plans as ArchiPlan[]).map(plan => (
                <StaggerItem key={plan.id}>
                  <PlanCard plan={plan} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.2} className="text-center mt-10">
              <Link href="/marketplace">
                <Button variant="outline" size="lg">
                  View All Plans <ArrowRight size={16} />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ──── How it works ──── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            How <span className="text-[#D4AF37]">It Works</span>
          </h2>
          <p className="text-gray-400">Get from idea to construction in four simple steps</p>
        </FadeIn>

        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <StaggerItem key={step.step}>
              <div className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-bold text-[#D4AF37]/20">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ──── Top Engineers ──── */}
      {engineers.length > 0 && (
        <section className="py-20 bg-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Top <span className="text-[#D4AF37]">Engineers</span>
                </h2>
                <p className="text-gray-400">Verified professionals ready for your project</p>
              </div>
              <Link href="/engineers" className="hidden md:flex items-center gap-1.5 text-[#D4AF37] text-sm hover:gap-2.5 transition-all">
                View all <ChevronRight size={16} />
              </Link>
            </FadeIn>

            <StaggerContainer stagger={0.09} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(engineers as (ArchiEngineerProfile & { profile?: ArchiProfile })[]).map(engineer => (
                <StaggerItem key={engineer.id}>
                  <EngineerCard engineer={engineer} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ──── Testimonials ──── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            What Our <span className="text-[#D4AF37]">Clients Say</span>
          </h2>
        </FadeIn>

        <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <StaggerItem key={t.name}>
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-colors h-full">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-[#D4AF37]">{t.role}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ──── CTA Banner ──── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1400] via-[#0B0B0B] to-[#0B0B0B]" />
        <div className="absolute inset-0 bg-[#D4AF37]/3" />
        <FadeIn y={32} className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl mb-6">
            <Building2 size={28} className="text-[#D4AF37]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Build <span className="text-[#D4AF37]">Something Great?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners and professionals on Africa&apos;s most trusted architecture platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="gold" size="xl">
                Get Started Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="dark" size="xl">
                <Download size={18} />
                Browse Plans
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Building2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

type Role = 'customer' | 'engineer'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as Role) || 'customer'

  const [role, setRole] = useState<Role>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [title, setTitle] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from('archi_profiles').upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
      })

      if (role === 'engineer') {
        await supabase.from('archi_engineer_profiles').insert({
          user_id: authData.user.id,
          title,
          experience_years: parseInt(experienceYears) || 0,
          is_verified: false,
        })
      }

      if (authData.session) {
        router.push(role === 'engineer' ? '/engineer' : '/dashboard')
        router.refresh()
      } else {
        setSuccess(true)
      }
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-[#D4AF37]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-gray-400 text-sm mb-6">
          We sent a confirmation link to <strong className="text-white">{email}</strong>. Please verify your email to complete registration.
        </p>
        <Link href="/login">
          <Button variant="gold" fullWidth>Back to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Join ArchiHub</h1>
      <p className="text-gray-400 text-sm mb-6">Create your account to get started</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {([
          { value: 'customer', label: 'Home Buyer', icon: <Users size={18} />, desc: 'Browse & buy plans' },
          { value: 'engineer', label: 'Engineer', icon: <Building2 size={18} />, desc: 'Sell plans & get hired' },
        ] as const).map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all duration-200',
              role === r.value
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-[#2E2E2E] text-gray-400 hover:border-[#D4AF37]/30'
            )}
          >
            {r.icon}
            <span className="font-semibold text-sm">{r.label}</span>
            <span className="text-xs opacity-70">{r.desc}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} icon={<User size={16} />} required />
        <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} required />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Minimum 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          required
        />

        {role === 'engineer' && (
          <>
            <Input label="Professional Title" placeholder="e.g. Structural Engineer, Architect" value={title} onChange={e => setTitle(e.target.value)} />
            <Input label="Years of Experience" type="number" placeholder="e.g. 5" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} min="0" />
            <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              Your engineer account will be reviewed and verified by our admin team before you can sell plans.
            </p>
          </>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <Button type="submit" variant="gold" size="lg" fullWidth loading={loading} className="mt-2">Create Account</Button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-[#D4AF37] hover:underline">Terms</Link> and{' '}
        <Link href="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</Link>.
      </p>

      <div className="mt-5 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-[#D4AF37] hover:underline font-medium">Sign in</Link>
      </div>
    </div>
  )
}

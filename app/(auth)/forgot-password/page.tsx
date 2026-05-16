'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-[#D4AF37]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-gray-400 text-sm mb-6">
          We sent a password reset link to <strong className="text-white">{email}</strong>.
        </p>
        <Link href="/login">
          <Button variant="gold" fullWidth>Back to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Reset Password</h1>
      <p className="text-gray-400 text-sm mb-7">Enter your email and we&apos;ll send a reset link</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    </div>
  )
}

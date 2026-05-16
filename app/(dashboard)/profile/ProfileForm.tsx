'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import type { ArchiProfile } from '@/lib/types/database'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'

interface Props {
  profile: ArchiProfile
}

export default function ProfileForm({ profile }: Props) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    location: profile.location || '',
    bio: profile.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar display */}
      <div className="flex items-center gap-4 p-5 bg-[#161616] border border-[#2E2E2E] rounded-xl">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
        <div>
          <p className="font-semibold text-white">{profile.full_name || 'Your Name'}</p>
          <p className="text-sm text-[#D4AF37] capitalize">{profile.role}</p>
          <p className="text-xs text-gray-500 mt-1">Profile photo is managed through your account provider</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-5">Personal Information</h2>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
          <Input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Your full name"
            icon={<User size={16} />}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <Input
            value={profile.email || ''}
            disabled
            icon={<Mail size={16} />}
            className="opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-600 mt-1">Email cannot be changed here</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+254 700 000 000"
            icon={<Phone size={16} />}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Location</label>
          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="City, Country"
            icon={<MapPin size={16} />}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-white placeholder:text-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm text-green-400">Profile updated successfully</div>
      )}

      <Button type="submit" variant="gold" loading={loading} className="w-full sm:w-auto">
        <Save size={16} />
        Save Changes
      </Button>
    </form>
  )
}

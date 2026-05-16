'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface HireButtonProps {
  engineerId: string
  engineerName: string
  isLoggedIn: boolean
}

export default function HireButton({ engineerId, engineerName, isLoggedIn }: HireButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    project_title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineer_id: engineerId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="gold"
        size="lg"
        fullWidth
        onClick={() => {
          if (!isLoggedIn) { router.push('/login'); return }
          setOpen(true)
        }}
      >
        <Briefcase size={16} />
        Hire Engineer
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setSuccess(false) }} title={`Hire ${engineerName}`} size="md">
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Sent!</h3>
            <p className="text-gray-400 text-sm mb-5">The engineer will review your project and respond soon.</p>
            <Button variant="gold" onClick={() => { setOpen(false); setSuccess(false); router.push('/dashboard/hire') }}>
              View My Requests
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Title"
              placeholder="e.g. 3-Bedroom House Construction"
              value={form.project_title}
              onChange={e => setForm({ ...form, project_title: e.target.value })}
              required
            />
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Project Description</label>
              <textarea
                className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
                rows={3}
                placeholder="Describe your project requirements..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Budget ($)"
                type="number"
                placeholder="5000"
                value={form.budget_min}
                onChange={e => setForm({ ...form, budget_min: e.target.value })}
              />
              <Input
                label="Max Budget ($)"
                type="number"
                placeholder="20000"
                value={form.budget_max}
                onChange={e => setForm({ ...form, budget_max: e.target.value })}
              />
            </div>
            <Input
              label="Location"
              placeholder="e.g. Nairobi, Kenya"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
              Send Hire Request
            </Button>
          </form>
        )}
      </Modal>
    </>
  )
}

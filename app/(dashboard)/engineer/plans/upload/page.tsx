'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ImagePlus, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { HOUSE_TYPES } from '@/lib/utils'

export default function UploadPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    floors: '1',
    area_sqft: '',
    house_type: '',
    thumbnail_url: '',
    file_url: '',
    tags: '',
  })

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setTimeout(() => router.push('/engineer/plans'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload plan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={36} className="text-[#D4AF37]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Plan Uploaded!</h2>
        <p className="text-gray-400">Your plan is saved as a draft. Publish it to make it visible to buyers.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Upload House Plan</h1>
        <p className="text-gray-400 mt-1">Fill in the details to list your architectural plan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Upload size={16} className="text-[#D4AF37]" />
            Plan Details
          </h2>

          <Input
            label="Plan Title *"
            placeholder="e.g. Modern 3-Bedroom Family Home"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            required
          />

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Description</label>
            <textarea
              className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
              rows={4}
              placeholder="Describe your plan — style, features, suitable for..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD) *"
              type="number"
              placeholder="e.g. 150"
              value={form.price}
              onChange={e => update('price', e.target.value)}
              required
              min="1"
            />
            <Select
              label="House Type"
              value={form.house_type}
              onChange={e => update('house_type', e.target.value)}
              placeholder="Select type"
              options={HOUSE_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
          </div>
        </div>

        {/* Specs */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white">Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Bedrooms" type="number" placeholder="3" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} min="0" />
            <Input label="Bathrooms" type="number" placeholder="2" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} min="0" />
            <Input label="Floors" type="number" placeholder="1" value={form.floors} onChange={e => update('floors', e.target.value)} min="1" />
            <Input label="Area (sqft)" type="number" placeholder="1500" value={form.area_sqft} onChange={e => update('area_sqft', e.target.value)} min="0" />
          </div>
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. modern, family, eco-friendly"
            value={form.tags}
            onChange={e => update('tags', e.target.value)}
          />
        </div>

        {/* Media */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <ImagePlus size={16} className="text-[#D4AF37]" />
            Media & Files
          </h2>
          <Input
            label="Thumbnail URL"
            placeholder="https://... (image URL for preview)"
            value={form.thumbnail_url}
            onChange={e => update('thumbnail_url', e.target.value)}
            hint="Direct link to the plan preview image"
          />
          <Input
            label="Plan File URL"
            placeholder="https://... (PDF/DWG download link)"
            value={form.file_url}
            onChange={e => update('file_url', e.target.value)}
            hint="Buyers will receive this link after purchase"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="gold" size="lg" loading={loading}>
            <Upload size={16} />
            Save Plan
          </Button>
          <Button type="button" variant="dark" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Get In <span className="text-[#D4AF37]">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg">Have a question? We&apos;d love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-5">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: <Mail size={20} />, label: 'Email', value: 'support@archihub.com' },
                  { icon: <Phone size={20} />, label: 'Phone', value: '+254 700 000 000' },
                  { icon: <MapPin size={20} />, label: 'Address', value: 'Westlands, Nairobi, Kenya' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      <p className="text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Business Hours</h3>
              <div className="space-y-1.5 text-sm text-gray-400">
                <p>Monday – Friday: 8am – 6pm EAT</p>
                <p>Saturday: 9am – 2pm EAT</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <Input label="Subject" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">Message</label>
                  <textarea
                    className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
                    rows={5}
                    placeholder="Your message..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
                  <Send size={16} />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

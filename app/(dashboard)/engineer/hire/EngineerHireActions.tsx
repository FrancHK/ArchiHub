'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Check, X } from 'lucide-react'
import { PROJECT_STAGES } from '@/lib/utils'

interface Props {
  requestId: string
  engineerId: string
}

export default function EngineerHireActions({ requestId }: Props) {
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('planning')

  const updateStatus = async (status: string, current_stage?: string) => {
    setLoading(true)
    await fetch(`/api/hire/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, current_stage }),
    })
    setLoading(false)
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button variant="gold" size="sm" loading={loading} onClick={() => updateStatus('accepted', stage)}>
        <Check size={14} /> Accept
      </Button>
      <Button variant="danger" size="sm" loading={loading} onClick={() => updateStatus('rejected')}>
        <X size={14} /> Decline
      </Button>
      <Select
        value={stage}
        onChange={e => setStage(e.target.value)}
        options={PROJECT_STAGES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        className="h-8 text-sm w-36"
      />
    </div>
  )
}

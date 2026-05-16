'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Download, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface PurchaseButtonProps {
  planId: string
  planTitle: string
  price: number
  isPublished: boolean
  alreadyPurchased: boolean
  fileUrl: string | null
  isLoggedIn: boolean
}

export default function PurchaseButton({ planId, planTitle, price, isPublished, alreadyPurchased, fileUrl, isLoggedIn }: PurchaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [purchased, setPurchased] = useState(alreadyPurchased)

  if (!isPublished) {
    return (
      <Button variant="dark" size="lg" fullWidth disabled>
        <Lock size={16} />
        Not Available
      </Button>
    )
  }

  if (purchased && fileUrl) {
    return (
      <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
        <Button variant="gold" size="lg" fullWidth>
          <Download size={16} />
          Download Plan
        </Button>
      </a>
    )
  }

  if (purchased) {
    return (
      <Button variant="dark" size="lg" fullWidth disabled>
        <Download size={16} />
        Purchase Complete
      </Button>
    )
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant="gold"
        size="lg"
        fullWidth
        onClick={() => router.push(`/login?next=/marketplace/${planId}`)}
      >
        <Lock size={16} />
        Sign in to Purchase
      </Button>
    )
  }

  const handlePurchase = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')
      setPurchased(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button variant="gold" size="lg" fullWidth loading={loading} onClick={handlePurchase}>
        <ShoppingCart size={16} />
        Buy Now — {formatCurrency(price)}
      </Button>
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <p className="text-xs text-gray-500 text-center italic">&ldquo;{planTitle}&rdquo;</p>
    </div>
  )
}

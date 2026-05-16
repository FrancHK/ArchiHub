'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { HOUSE_TYPES } from '@/lib/utils'

export default function PlanFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [houseType, setHouseType] = useState(searchParams.get('house_type') || '')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (houseType) params.set('house_type', houseType)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    if (sort) params.set('sort', sort)
    router.push(`/marketplace?${params.toString()}`)
  }, [search, houseType, bedrooms, minPrice, maxPrice, sort, router])

  const clearFilters = () => {
    setSearch(''); setHouseType(''); setBedrooms(''); setMinPrice(''); setMaxPrice(''); setSort('newest')
    router.push('/marketplace')
  }

  const hasFilters = houseType || bedrooms || minPrice || maxPrice

  return (
    <div className="space-y-4">
      {/* Search bar + controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search plans by style, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            icon={<Search size={16} />}
          />
        </div>

        <Select
          value={sort}
          onChange={e => { setSort(e.target.value); }}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
          ]}
          className="w-48"
        />

        <Button
          variant={showFilters ? 'gold' : 'dark'}
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
        </Button>

        <Button variant="gold" size="md" onClick={applyFilters}>
          Search
        </Button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="House Type"
              value={houseType}
              onChange={e => setHouseType(e.target.value)}
              placeholder="All types"
              options={HOUSE_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
            <Select
              label="Bedrooms"
              value={bedrooms}
              onChange={e => setBedrooms(e.target.value)}
              placeholder="Any"
              options={[1,2,3,4,5,6].map(n => ({ value: String(n), label: `${n} bedroom${n > 1 ? 's' : ''}` }))}
            />
            <Input
              label="Min Price ($)"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
            />
            <Input
              label="Max Price ($)"
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="gold" size="sm" onClick={applyFilters}>Apply Filters</Button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, X, Image as ImageIcon, FileArchive, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { HOUSE_TYPES } from '@/lib/utils'

type PhotoKey = 'photo_front' | 'photo_back' | 'photo_right' | 'photo_left' | 'photo_top' | 'photo_floor_plan'

const PHOTO_SLOTS: { key: PhotoKey; label: string; hint: string }[] = [
  { key: 'photo_front',      label: 'Mbele (Front)',       hint: 'Picha ya uso wa mbele wa nyumba' },
  { key: 'photo_back',       label: 'Nyuma (Back)',        hint: 'Picha ya nyuma ya nyumba' },
  { key: 'photo_right',      label: 'Kulia (Right)',       hint: 'Picha ya upande wa kulia' },
  { key: 'photo_left',       label: 'Kushoto (Left)',      hint: 'Picha ya upande wa kushoto' },
  { key: 'photo_top',        label: 'Juu (Top/Aerial)',    hint: 'Picha ya juu / aerial view' },
  { key: 'photo_floor_plan', label: 'Ramani (Floor Plan)', hint: 'Ramani ya ndani ya nyumba' },
]

interface PhotoState {
  file: File | null
  preview: string | null
  url: string | null
  uploading: boolean
  error: string | null
}

const emptyPhoto = (): PhotoState => ({ file: null, preview: null, url: null, uploading: false, error: null })

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
    tags: '',
  })

  const [photos, setPhotos] = useState<Record<PhotoKey, PhotoState>>({
    photo_front:      emptyPhoto(),
    photo_back:       emptyPhoto(),
    photo_right:      emptyPhoto(),
    photo_left:       emptyPhoto(),
    photo_top:        emptyPhoto(),
    photo_floor_plan: emptyPhoto(),
  })

  const [zipFile, setZipFile] = useState<{ file: File | null; path: string | null; uploading: boolean; error: string | null }>({
    file: null, path: null, uploading: false, error: null,
  })

  const photoRefs = useRef<Partial<Record<PhotoKey, HTMLInputElement>>>({})
  const zipRef = useRef<HTMLInputElement>(null)

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<{ url?: string; path?: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', bucket)
    fd.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  }

  const handlePhotoChange = async (key: PhotoKey, file: File) => {
    const preview = URL.createObjectURL(file)
    setPhotos(prev => ({ ...prev, [key]: { file, preview, url: null, uploading: true, error: null } }))
    try {
      const { url } = await uploadFile(file, 'plan-images', key)
      setPhotos(prev => ({ ...prev, [key]: { file, preview, url: url!, uploading: false, error: null } }))
    } catch (err) {
      setPhotos(prev => ({ ...prev, [key]: { ...prev[key], uploading: false, error: err instanceof Error ? err.message : 'Upload failed' } }))
    }
  }

  const removePhoto = (key: PhotoKey) => {
    const prev = photos[key]
    if (prev.preview) URL.revokeObjectURL(prev.preview)
    setPhotos(p => ({ ...p, [key]: emptyPhoto() }))
    if (photoRefs.current[key]) photoRefs.current[key]!.value = ''
  }

  const handleZipChange = async (file: File) => {
    setZipFile({ file, path: null, uploading: true, error: null })
    try {
      const { path } = await uploadFile(file, 'plan-files', 'zips')
      setZipFile({ file, path: path!, uploading: false, error: null })
    } catch (err) {
      setZipFile({ file, path: null, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' })
    }
  }

  const allPhotosUploaded = PHOTO_SLOTS.every(s => !!photos[s.key].url)
  const anyPhotoUploading = PHOTO_SLOTS.some(s => photos[s.key].uploading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!allPhotosUploaded) {
      setError('Tafadhali pakia picha zote 6 zinazohitajika')
      return
    }
    if (!zipFile.path) {
      setError('Tafadhali pakia faili ya ZIP inayoweza kudownloadwa')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
          thumbnail_url: photos.photo_front.url,
          preview_images: PHOTO_SLOTS.map(s => photos[s.key].url!),
          photo_front:      photos.photo_front.url,
          photo_back:       photos.photo_back.url,
          photo_right:      photos.photo_right.url,
          photo_left:       photos.photo_left.url,
          photo_top:        photos.photo_top.url,
          photo_floor_plan: photos.photo_floor_plan.url,
          zip_url: zipFile.path,
          file_url: zipFile.path,
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
        <h2 className="text-2xl font-bold text-white mb-2">Plan Imepakiwa!</h2>
        <p className="text-gray-400">Plan yako imehifadhiwa kama rasimu. Publish ili kuifanya ionekane kwa wanunuzi.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Upload House Plan</h1>
        <p className="text-gray-400 mt-1">Jaza maelezo ili kuorodhesha plan yako ya usanifu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Upload size={16} className="text-[#D4AF37]" />
            Maelezo ya Plan
          </h2>

          <Input
            label="Jina la Plan *"
            placeholder="mfano: Modern 3-Bedroom Family Home"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            required
          />

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Maelezo</label>
            <textarea
              className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
              rows={4}
              placeholder="Elezea plan yako — mtindo, vipengele, inafaa kwa..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bei (USD) *"
              type="number"
              placeholder="mfano: 150"
              value={form.price}
              onChange={e => update('price', e.target.value)}
              required
              min="1"
            />
            <Select
              label="Aina ya Nyumba"
              value={form.house_type}
              onChange={e => update('house_type', e.target.value)}
              placeholder="Chagua aina"
              options={HOUSE_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
          </div>
        </div>

        {/* Specs */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white">Vipimo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Vyumba vya kulala" type="number" placeholder="3" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} min="0" />
            <Input label="Vyumba vya kuoga" type="number" placeholder="2" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} min="0" />
            <Input label="Ghorofa" type="number" placeholder="1" value={form.floors} onChange={e => update('floors', e.target.value)} min="1" />
            <Input label="Eneo (sqft)" type="number" placeholder="1500" value={form.area_sqft} onChange={e => update('area_sqft', e.target.value)} min="0" />
          </div>
          <Input
            label="Tags (tenganisha kwa koma)"
            placeholder="mfano: modern, familia, eco-friendly"
            value={form.tags}
            onChange={e => update('tags', e.target.value)}
          />
        </div>

        {/* 6 Photos */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ImageIcon size={16} className="text-[#D4AF37]" />
              Picha 6 Zinazohitajika
            </h2>
            <span className="text-xs text-gray-400">
              {PHOTO_SLOTS.filter(s => photos[s.key].url).length}/6 zimepakiwa
            </span>
          </div>

          <p className="text-xs text-gray-500">Picha zote 6 zinahitajika kabla ya kuwasilisha. JPG, PNG, au WebP — max 10MB kila moja.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHOTO_SLOTS.map(({ key, label, hint }) => {
              const p = photos[key]
              return (
                <div key={key} className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-300">{label} <span className="text-red-400">*</span></p>
                  <div
                    className={`relative aspect-[4/3] rounded-lg border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
                      p.url
                        ? 'border-[#D4AF37]/50'
                        : p.error
                        ? 'border-red-500/50'
                        : 'border-[#2E2E2E] hover:border-[#D4AF37]/30'
                    }`}
                    onClick={() => !p.uploading && photoRefs.current[key]?.click()}
                  >
                    {p.preview ? (
                      <>
                        <img src={p.preview} alt={label} className="w-full h-full object-cover" />
                        {p.uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {p.url && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); removePhoto(key) }}
                            className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-red-500/80 transition-colors"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        )}
                        {p.url && (
                          <div className="absolute bottom-1 left-1 bg-[#D4AF37] rounded-full p-0.5">
                            <Check size={10} className="text-black" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-500">
                        <ImageIcon size={20} />
                        <span className="text-xs text-center px-2">{hint}</span>
                      </div>
                    )}
                  </div>
                  {p.error && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={10} /> {p.error}
                    </p>
                  )}
                  <input
                    ref={el => { photoRefs.current[key] = el ?? undefined }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoChange(key, f)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ZIP download file */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <FileArchive size={16} className="text-[#D4AF37]" />
            Faili ya Download (ZIP) <span className="text-red-400">*</span>
          </h2>
          <p className="text-sm text-gray-400">
            Pakia faili ya ZIP iliyo na kila kitu (PDF, DWG, BIM, n.k.). Wanunuzi watapata faili hii baada ya kununua.
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              zipFile.path
                ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5'
                : zipFile.error
                ? 'border-red-500/40'
                : 'border-[#2E2E2E] hover:border-[#D4AF37]/30'
            }`}
            onClick={() => !zipFile.uploading && zipRef.current?.click()}
          >
            {zipFile.uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Inapakia...</p>
              </>
            ) : zipFile.path ? (
              <>
                <FileArchive size={32} className="text-[#D4AF37]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{zipFile.file?.name}</p>
                  <p className="text-xs text-gray-400">{zipFile.file ? (zipFile.file.size / 1024 / 1024).toFixed(1) + ' MB' : ''}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check size={12} /> Imepakiwa
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setZipFile({ file: null, path: null, uploading: false, error: null }); if (zipRef.current) zipRef.current.value = '' }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Ondoa
                </button>
              </>
            ) : (
              <>
                <FileArchive size={32} className="text-gray-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-300">Bonyeza kupakia faili ya ZIP</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ina PDF, DWG, BIM, picha za hali ya juu, n.k. — max 100MB</p>
                </div>
              </>
            )}
          </div>
          {zipFile.error && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle size={14} /> {zipFile.error}
            </p>
          )}
          <input
            ref={zipRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleZipChange(f)
            }}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            disabled={anyPhotoUploading || zipFile.uploading}
          >
            <Upload size={16} />
            Hifadhi Plan
          </Button>
          <Button type="button" variant="dark" size="lg" onClick={() => router.back()}>
            Ghairi
          </Button>
        </div>
      </form>
    </div>
  )
}

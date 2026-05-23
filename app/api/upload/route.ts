import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null
  const folder = formData.get('folder') as string | null

  if (!file || !bucket) {
    return NextResponse.json({ error: 'File and bucket are required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (bucket === 'plan-images') {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return NextResponse.json({ url: urlData.publicUrl, path: data.path })
  }

  // For private buckets return just the path (signed URL generated on demand)
  return NextResponse.json({ path: data.path })
}

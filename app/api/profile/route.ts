import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('archi_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  let engineerProfile = null
  if (profile.role === 'engineer') {
    const { data } = await supabase
      .from('archi_engineer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    engineerProfile = data
  }

  return NextResponse.json({ profile, engineerProfile })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { full_name, phone, location, bio, avatar_url, engineerData } = body

  const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) profileUpdates.full_name = full_name
  if (phone !== undefined) profileUpdates.phone = phone
  if (location !== undefined) profileUpdates.location = location
  if (bio !== undefined) profileUpdates.bio = bio
  if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url

  const { data, error } = await supabase
    .from('archi_profiles')
    .update(profileUpdates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (engineerData) {
    await supabase
      .from('archi_engineer_profiles')
      .update({ ...engineerData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  return NextResponse.json({ profile: data })
}

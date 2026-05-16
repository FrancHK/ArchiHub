import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await supabase
    .from('archi_engineer_profiles')
    .select(`
      *,
      profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  return NextResponse.json({ engineers: data || [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, is_verified, is_active } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof is_verified === 'boolean') updates.is_verified = is_verified
  if (typeof is_active === 'boolean') updates.is_active = is_active

  const { data, error } = await supabase
    .from('archi_engineer_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (typeof is_verified === 'boolean') {
    const ep = data as { user_id: string }
    await supabase.from('archi_notifications').insert({
      user_id: ep.user_id,
      title: is_verified ? 'Account Verified!' : 'Verification Status Updated',
      message: is_verified
        ? 'Congratulations! Your engineer account has been verified. You can now upload and sell plans.'
        : 'Your engineer verification status has been updated.',
      type: 'system',
    })
  }

  return NextResponse.json({ engineer: data })
}

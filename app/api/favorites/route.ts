import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('archi_favorites')
    .select('*, plan:archi_plans(*, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ favorites: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan_id } = await request.json()
  if (!plan_id) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('archi_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan_id', plan_id)
    .single()

  if (existing) {
    await supabase.from('archi_favorites').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }

  await supabase.from('archi_favorites').insert({ user_id: user.id, plan_id })
  return NextResponse.json({ action: 'added' }, { status: 201 })
}

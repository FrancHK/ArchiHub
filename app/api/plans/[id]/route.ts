import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archi_plans')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  return NextResponse.json({ plan: data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: plan } = await supabase
    .from('archi_plans')
    .select('engineer_id, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(user_id)')
    .eq('id', id)
    .single()

  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  const engineerData = plan?.engineer as unknown as { user_id: string } | null
  const isOwner = engineerData?.user_id === user.id
  const isAdmin = profile?.role === 'admin'

  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('archi_plans')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ plan: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('archi_plans').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

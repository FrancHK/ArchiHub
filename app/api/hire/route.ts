import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()

  let query = supabase
    .from('archi_hire_requests')
    .select(`
      *,
      client:archi_profiles!archi_hire_requests_client_id_fkey(*),
      engineer:archi_engineer_profiles!archi_hire_requests_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (profile?.role === 'customer') {
    query = query.eq('client_id', user.id)
  } else if (profile?.role === 'engineer') {
    const { data: ep } = await supabase.from('archi_engineer_profiles').select('id').eq('user_id', user.id).single()
    if (ep) query = query.eq('engineer_id', ep.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ requests: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { engineer_id, project_title, description, budget_min, budget_max, location } = body

  if (!engineer_id || !project_title) {
    return NextResponse.json({ error: 'Engineer and project title required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('archi_hire_requests')
    .insert({
      client_id: user.id,
      engineer_id,
      project_title,
      description,
      budget_min: budget_min ? parseFloat(budget_min) : null,
      budget_max: budget_max ? parseFloat(budget_max) : null,
      location,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Notify engineer
  const { data: ep } = await supabase
    .from('archi_engineer_profiles')
    .select('user_id')
    .eq('id', engineer_id)
    .single()

  if (ep) {
    await supabase.from('archi_notifications').insert({
      user_id: ep.user_id,
      title: 'New Hire Request',
      message: `New project request: "${project_title}"`,
      type: 'hire',
    })
  }

  return NextResponse.json({ request: data }, { status: 201 })
}

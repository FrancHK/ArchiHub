import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status, current_stage } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) updates.status = status
  if (current_stage) updates.current_stage = current_stage

  const { data, error } = await supabase
    .from('archi_hire_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Notify client
  if (data) {
    const req = data as { client_id: string; project_title: string }
    await supabase.from('archi_notifications').insert({
      user_id: req.client_id,
      title: `Hire Request ${status === 'accepted' ? 'Accepted!' : status === 'rejected' ? 'Declined' : 'Updated'}`,
      message: `Your project "${req.project_title}" has been ${status}.`,
      type: 'hire',
    })
  }

  return NextResponse.json({ request: data })
}

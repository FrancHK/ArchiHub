import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await supabase
    .from('archi_withdrawals')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_withdrawals_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `)
    .order('requested_at', { ascending: false })

  return NextResponse.json({ withdrawals: data || [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, admin_note } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

  const { data: withdrawal } = await supabase.from('archi_withdrawals').select('*').eq('id', id).single()
  if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('archi_withdrawals')
    .update({ status, admin_note, processed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // If rejected, refund back to balance
  if (status === 'rejected') {
    const { data: wallet } = await supabase
      .from('archi_wallets')
      .select('*')
      .eq('engineer_id', withdrawal.engineer_id)
      .single()

    if (wallet) {
      await supabase.from('archi_wallets').update({
        balance: wallet.balance + withdrawal.amount,
        pending_balance: Math.max(0, wallet.pending_balance - withdrawal.amount),
        updated_at: new Date().toISOString(),
      }).eq('engineer_id', withdrawal.engineer_id)
    }
  }

  if (status === 'completed') {
    const { data: wallet } = await supabase
      .from('archi_wallets')
      .select('*')
      .eq('engineer_id', withdrawal.engineer_id)
      .single()
    if (wallet) {
      await supabase.from('archi_wallets').update({
        pending_balance: Math.max(0, wallet.pending_balance - withdrawal.amount),
        updated_at: new Date().toISOString(),
      }).eq('engineer_id', withdrawal.engineer_id)
    }
  }

  // Notify engineer
  const { data: ep } = await supabase.from('archi_engineer_profiles').select('user_id').eq('id', withdrawal.engineer_id).single()
  if (ep) {
    await supabase.from('archi_notifications').insert({
      user_id: ep.user_id,
      title: `Withdrawal ${status === 'completed' ? 'Processed' : status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your withdrawal of $${withdrawal.amount} has been ${status}.${admin_note ? ` Note: ${admin_note}` : ''}`,
      type: 'withdrawal',
    })
  }

  return NextResponse.json({ withdrawal: data })
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: engineerProfile } = await supabase
    .from('archi_engineer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!engineerProfile) return NextResponse.json({ error: 'Not an engineer' }, { status: 403 })

  const { data } = await supabase
    .from('archi_withdrawals')
    .select('*')
    .eq('engineer_id', engineerProfile.id)
    .order('requested_at', { ascending: false })

  return NextResponse.json({ withdrawals: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: engineerProfile } = await supabase
    .from('archi_engineer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!engineerProfile) return NextResponse.json({ error: 'Not an engineer' }, { status: 403 })

  const { amount, method, account_details } = await request.json()
  if (!amount || !method) return NextResponse.json({ error: 'Amount and method required' }, { status: 400 })

  const { data: wallet } = await supabase
    .from('archi_wallets')
    .select('balance, pending_balance')
    .eq('engineer_id', engineerProfile.id)
    .single()

  if (!wallet || wallet.balance < parseFloat(amount)) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('archi_withdrawals')
    .insert({
      engineer_id: engineerProfile.id,
      amount: parseFloat(amount),
      method,
      account_details: account_details || {},
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Deduct from wallet balance and move to pending
  await supabase.from('archi_wallets').update({
    balance: wallet.balance - parseFloat(amount),
    pending_balance: (wallet.pending_balance || 0) + parseFloat(amount),
    updated_at: new Date().toISOString(),
  }).eq('engineer_id', engineerProfile.id)

  return NextResponse.json({ withdrawal: data }, { status: 201 })
}

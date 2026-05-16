import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateCommission } from '@/lib/utils'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('archi_sales')
    .select('*, plan:archi_plans(*)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ purchases: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan_id, payment_method = 'card' } = await request.json()
  if (!plan_id) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })

  const { data: plan } = await supabase
    .from('archi_plans')
    .select('*, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(*)')
    .eq('id', plan_id)
    .eq('is_published', true)
    .single()

  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const { data: existing } = await supabase
    .from('archi_sales')
    .select('id')
    .eq('plan_id', plan_id)
    .eq('buyer_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

  const { commission, engineerAmount } = calculateCommission(plan.price)
  const engineer = plan.engineer as { id: string }

  const { data: sale, error: saleError } = await supabase
    .from('archi_sales')
    .insert({
      plan_id,
      buyer_id: user.id,
      engineer_id: engineer.id,
      amount: plan.price,
      engineer_amount: engineerAmount,
      commission_amount: commission,
      payment_method,
      payment_status: 'completed',
    })
    .select()
    .single()

  if (saleError) return NextResponse.json({ error: saleError.message }, { status: 400 })

  // Update engineer wallet
  const { data: wallet } = await supabase
    .from('archi_wallets')
    .select('*')
    .eq('engineer_id', engineer.id)
    .single()

  if (wallet) {
    await supabase
      .from('archi_wallets')
      .update({
        balance: wallet.balance + engineerAmount,
        total_earned: wallet.total_earned + engineerAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('engineer_id', engineer.id)
  } else {
    await supabase.from('archi_wallets').insert({
      engineer_id: engineer.id,
      balance: engineerAmount,
      total_earned: engineerAmount,
    })
  }

  // Update plan total_sales
  await supabase.from('archi_plans').update({ total_sales: plan.total_sales + 1 }).eq('id', plan_id)

  // Update engineer total_sales
  await supabase
    .from('archi_engineer_profiles')
    .update({ total_sales: (plan.engineer as { total_sales: number }).total_sales + 1 })
    .eq('id', engineer.id)

  // Create notification for engineer
  await supabase.from('archi_notifications').insert({
    user_id: (plan.engineer as { user_id: string }).user_id,
    title: 'New Sale!',
    message: `Someone purchased "${plan.title}" for $${plan.price}`,
    type: 'sale',
  })

  return NextResponse.json({ sale }, { status: 201 })
}

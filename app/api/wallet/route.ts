import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const { data: wallet } = await supabase
    .from('archi_wallets')
    .select('*')
    .eq('engineer_id', engineerProfile.id)
    .single()

  const { data: recentSales } = await supabase
    .from('archi_sales')
    .select('*, plan:archi_plans(title, thumbnail_url)')
    .eq('engineer_id', engineerProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    wallet: wallet || { balance: 0, pending_balance: 0, total_earned: 0 },
    recent_sales: recentSales || [],
  })
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { count: totalUsers },
    { count: totalEngineers },
    { count: totalPlans },
    { data: salesData },
    { count: pendingWithdrawals },
    { data: recentSales },
  ] = await Promise.all([
    supabase.from('archi_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('archi_engineer_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('archi_sales').select('amount, commission_amount, created_at').eq('payment_status', 'completed'),
    supabase.from('archi_withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('archi_sales').select(`
      *, plan:archi_plans(title), buyer:archi_profiles!archi_sales_buyer_id_fkey(full_name)
    `).order('created_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = salesData?.reduce((sum, s) => sum + s.amount, 0) || 0
  const totalCommission = salesData?.reduce((sum, s) => sum + s.commission_amount, 0) || 0

  return NextResponse.json({
    stats: {
      total_users: totalUsers || 0,
      total_engineers: totalEngineers || 0,
      total_plans: totalPlans || 0,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      pending_withdrawals: pendingWithdrawals || 0,
    },
    recent_sales: recentSales || [],
  })
}

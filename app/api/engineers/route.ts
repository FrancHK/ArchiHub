import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('archi_engineer_profiles')
    .select(`
      *,
      profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('is_verified', true)

  if (search) {
    query = query.or(`title.ilike.%${search}%`)
  }

  query = query.order('rating', { ascending: false })

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ engineers: data, total: count, page, limit })
}

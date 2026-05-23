import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const house_type = searchParams.get('house_type')
  const bedrooms = searchParams.get('bedrooms')
  const min_price = searchParams.get('min_price')
  const max_price = searchParams.get('max_price')
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('archi_plans')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `, { count: 'exact' })
    .eq('is_published', true)

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (house_type) query = query.eq('house_type', house_type)
  if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms))
  if (min_price) query = query.gte('price', parseFloat(min_price))
  if (max_price) query = query.lte('price', parseFloat(max_price))

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'popular': query = query.order('total_sales', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ plans: data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: engineerProfile } = await supabase
    .from('archi_engineer_profiles')
    .select('id, is_verified')
    .eq('user_id', user.id)
    .single()

  if (!engineerProfile) return NextResponse.json({ error: 'Engineer profile not found' }, { status: 403 })

  const body = await request.json()
  const {
    title, description, price, bedrooms, bathrooms, floors, area_sqft, house_type,
    thumbnail_url, preview_images, file_url, tags,
    photo_front, photo_back, photo_right, photo_left, photo_top, photo_floor_plan, zip_url,
  } = body

  if (!title || !price) return NextResponse.json({ error: 'Title and price are required' }, { status: 400 })

  const { data, error } = await supabase
    .from('archi_plans')
    .insert({
      engineer_id: engineerProfile.id,
      title, description, price: parseFloat(price),
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      floors: floors ? parseInt(floors) : 1,
      area_sqft: area_sqft ? parseFloat(area_sqft) : null,
      house_type, thumbnail_url, preview_images: preview_images || [],
      file_url, tags: tags || [],
      photo_front, photo_back, photo_right, photo_left, photo_top, photo_floor_plan,
      zip_url: zip_url || file_url,
      is_published: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ plan: data }, { status: 201 })
}

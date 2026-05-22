import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, full_name, role, title, experience_years } = await request.json()

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!user) return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })

  // Upsert profile as fallback (trigger handles this, but ensures consistency)
  await admin.from('archi_profiles').upsert({
    id: user.id,
    email,
    full_name,
    role,
  })

  if (role === 'engineer') {
    await admin.from('archi_engineer_profiles').insert({
      user_id: user.id,
      title: title || '',
      experience_years: parseInt(experience_years) || 0,
      is_verified: false,
    })
  }

  return NextResponse.json({ success: true })
}

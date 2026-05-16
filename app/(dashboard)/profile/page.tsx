import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('archi_profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-7 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and profile</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}

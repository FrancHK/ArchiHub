import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('archi_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#0B0B0B]">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 lg:min-h-screen overflow-auto pt-14 lg:pt-0">
        <div className="p-5 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

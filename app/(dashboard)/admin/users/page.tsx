import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('archi_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const roleVariant: Record<string, 'gold' | 'success' | 'neutral'> = {
    admin: 'gold',
    engineer: 'success',
    customer: 'neutral',
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>All Users</h1>
        <p className="text-gray-400 mt-1">{users?.length || 0} registered users</p>
      </div>

      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2E2E2E]">
              <th className="text-left text-xs text-gray-500 px-5 py-3">User</th>
              <th className="text-center text-xs text-gray-500 px-5 py-3">Role</th>
              <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{u.full_name || 'No name'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={roleVariant[u.role] || 'neutral'} size="sm" className="capitalize">{u.role}</Badge>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={u.is_active ? 'success' : 'danger'} size="sm">
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right text-sm text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

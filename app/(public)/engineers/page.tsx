import { createClient } from '@/lib/supabase/server'
import EngineerCard from '@/components/engineer/EngineerCard'
import type { ArchiEngineerProfile, ArchiProfile } from '@/lib/types/database'
import Input from '@/components/ui/Input'
import { Search, Users } from 'lucide-react'

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function EngineersPage({ searchParams }: Props) {
  const { search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('archi_engineer_profiles')
    .select(`
      *,
      profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
    `, { count: 'exact' })
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%`)
  }

  const { data: engineers, count } = await query.limit(20)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Verified <span className="text-[#D4AF37]">Engineers</span>
          </h1>
          <p className="text-gray-400 text-lg">Hire certified professionals for your construction project</p>
        </div>

        {/* Search */}
        <form className="max-w-xl mb-10">
          <Input
            name="search"
            placeholder="Search engineers by specialty..."
            defaultValue={search}
            icon={<Search size={16} />}
          />
        </form>

        {engineers && engineers.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">{count} verified engineer{count !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(engineers as (ArchiEngineerProfile & { profile?: ArchiProfile })[]).map(engineer => (
                <EngineerCard key={engineer.id} engineer={engineer} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <Users size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No engineers found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

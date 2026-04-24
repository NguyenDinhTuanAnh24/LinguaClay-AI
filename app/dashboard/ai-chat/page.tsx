import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import AITutorEditor from '@/components/dashboard/AITutorEditor'

export default async function AITutorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?login=true')
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-[#4B4B4B] font-bold tracking-widest uppercase">Loading AI Tutor...</div>}>
      <AITutorEditor />
    </Suspense>
  )
}


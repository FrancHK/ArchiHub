import { Suspense } from 'react'
import RegisterForm from './RegisterForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <RegisterForm />
    </Suspense>
  )
}

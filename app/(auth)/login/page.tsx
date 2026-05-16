import { Suspense } from 'react'
import LoginForm from './LoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <LoginForm />
    </Suspense>
  )
}

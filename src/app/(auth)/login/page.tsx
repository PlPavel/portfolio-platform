import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Вход' }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}

import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = { title: 'Регистрация' }

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <RegisterForm />
    </main>
  )
}

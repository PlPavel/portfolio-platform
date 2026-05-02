'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('designer')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(
          signUpError.message === 'User already registered'
            ? 'Аккаунт с таким email уже существует'
            : signUpError.message
        )
        return
      }

      setEmailSent(true)
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <div className="text-4xl mb-2">📬</div>
          <CardTitle className="text-2xl">Проверьте почту</CardTitle>
          <CardDescription>
            Отправили письмо на{' '}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Перейдите по ссылке в письме, чтобы подтвердить аккаунт.
            {role === 'designer' && (
              <> После этого вы настроите профиль дизайнера.</>
            )}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Вернуться ко входу
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
        <CardDescription>Выберите роль и введите данные</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* Role selection */}
          <div className="space-y-2">
            <Label>Я — кто?</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'designer',  emoji: '✏️', title: 'Дизайнер', description: 'Публикую портфолио' },
                { value: 'recruiter', emoji: '🔍', title: 'Рекрутер',  description: 'Ищу специалистов'  },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value as UserRole)}
                  className={cn(
                    'flex flex-col items-center gap-2 border rounded-xl p-4 cursor-pointer transition-colors hover:bg-muted/50',
                    role === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border',
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium text-sm">{opt.title}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

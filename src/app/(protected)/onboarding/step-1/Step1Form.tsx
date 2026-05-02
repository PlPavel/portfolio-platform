'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/

interface Props {
  userId: string
}

export default function Step1Form({ userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fields, setFields] = useState({
    name: '',
    username: '',
    headline: '',
    location: '',
  })

  function set(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!USERNAME_RE.test(fields.username)) {
      setError(
        'Username: только строчные буквы a–z, цифры, «_» и «-», от 3 до 30 символов'
      )
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('designers').insert({
        user_id: userId,
        name: fields.name.trim(),
        username: fields.username.trim(),
        headline: fields.headline.trim() || null,
        location: fields.location.trim() || null,
      })

      if (dbError) {
        if (dbError.code === '23505') {
          setError('Этот username уже занят. Попробуйте другой.')
        } else {
          setError(dbError.message)
        }
        return
      }

      router.push('/onboarding/step-2')
      router.refresh()
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Имя и фамилия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Иван Иванов"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm shrink-0">
                portfolio.app/
              </span>
              <Input
                id="username"
                value={fields.username}
                onChange={(e) => set('username', e.target.value.toLowerCase())}
                placeholder="ivan_ivanov"
                required
                pattern="[a-z0-9_-]{3,30}"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Строчные буквы a–z, цифры, «_» и «-». От 3 до 30 символов.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Должность</Label>
            <Input
              id="headline"
              value={fields.headline}
              onChange={(e) => set('headline', e.target.value)}
              placeholder="Product Designer в Яндексе"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Город</Label>
            <Input
              id="location"
              value={fields.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Москва"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Сохранение...' : 'Далее →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

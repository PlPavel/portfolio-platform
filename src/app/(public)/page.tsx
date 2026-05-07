import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/app/(protected)/dashboard/DashboardNav'
import SearchNav from '@/app/(protected)/search/SearchNav'

export const metadata: Metadata = {
  title: 'Portfolio Platform — портфолио продуктовых дизайнеров',
}

const FEATURES = [
  {
    emoji: '🗂️',
    title: 'Структурированные кейсы',
    description:
      'Конструктор из 5 блоков: обзор, контекст, исследование, дизайн, результаты. HR-специалисты видят именно то, что нужно.',
  },
  {
    emoji: '🔍',
    title: 'Умный поиск',
    description:
      'HR-специалисты фильтруют по навыкам, городу и доступности. Full-text search по имени и описанию.',
  },
  {
    emoji: '📊',
    title: 'Метрики и результаты',
    description:
      'Покажите измеримый impact: конверсия, retention, NPS.',
  },
  {
    emoji: '🚀',
    title: 'Публичная ссылка',
    description:
      'Уникальный URL вашего портфолио. Отправьте HR-специалисту — никакой регистрации с их стороны.',
  },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        {user ? (
          role === 'recruiter' ? (
            <SearchNav />
          ) : (
            <DashboardNav />
          )
        ) : (
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-semibold">Portfolio Platform</span>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ size: 'sm' })}
              >
                Начать бесплатно
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Структурированные кейсы для{' '}
          <span>
            продуктовых дизайнеров
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Покажите исследования, гипотезы, решения и влияние на продукт в новом формате
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            Создать портфолио
          </Link>
          <Link
            href="/register?role=recruiter"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Найти дизайнера
          </Link>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <h2 className="text-2xl font-bold text-center">Возможности платформы</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border rounded-xl p-6 space-y-2">
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Готовы начать?</h2>
          <p className="text-muted-foreground">
            Создайте первый кейс за 15 минут
          </p>
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            Зарегистрироваться бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Portfolio Platform
          </p>
        </div>
      </footer>
    </div>
  )
}

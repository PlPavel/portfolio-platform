import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Portfolio Platform — портфолио продуктовых дизайнеров',
}

const FEATURES = [
  {
    emoji: '🗂️',
    title: 'Структурированные кейсы',
    description:
      'Конструктор из 5 блоков: обзор, контекст, исследование, дизайн, результаты. Рекрутеры видят именно то, что нужно.',
  },
  {
    emoji: '🔍',
    title: 'Умный поиск',
    description:
      'Рекрутеры фильтруют по навыкам, городу и доступности. Full-text search по имени и описанию.',
  },
  {
    emoji: '📊',
    title: 'Метрики и результаты',
    description:
      'Покажите измеримый impact: конверсия, retention, NPS. Цифры убеждают лучше слов.',
  },
  {
    emoji: '🚀',
    title: 'Публичная ссылка',
    description:
      'Уникальный URL вашего портфолио. Отправьте рекрутеру — никакой регистрации с их стороны.',
  },
]

const MOCK_DESIGNERS = [
  {
    name: 'Анна Соколова',
    headline: 'Product Designer · ex-Яндекс',
    location: 'Москва',
    available: true,
    skills: ['UI-дизайн', 'Figma', 'User Research'],
    cases: 4,
  },
  {
    name: 'Иван Петров',
    headline: 'Senior UX Designer',
    location: 'Санкт-Петербург',
    available: false,
    skills: ['Design Thinking', 'Прототипирование', 'CJM'],
    cases: 7,
  },
  {
    name: 'Мария Лебедева',
    headline: 'Product Designer · Fintech',
    location: 'Москва',
    available: true,
    skills: ['Дизайн-системы', 'Figma', 'Jobs To Be Done'],
    cases: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
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
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
        <Badge variant="secondary" className="text-sm">
          Специально для продуктовых дизайнеров
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Портфолио, которое{' '}
          <span className="underline underline-offset-4 decoration-primary/60">
            убеждает рекрутеров
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Структурируйте кейсы по единому формату. Покажите процесс и результаты.
          Помогите рекрутеру принять решение за 5 минут.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            Создать портфолио — бесплатно
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
        <h2 className="text-2xl font-bold text-center">Почему платформа</h2>
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

      <Separator />

      {/* Mock designers */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Примеры дизайнеров</h2>
          <Link
            href="/register?role=recruiter"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Открыть поиск →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {MOCK_DESIGNERS.map((d) => (
            <div key={d.name} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{d.name}</p>
                  {d.available && (
                    <span className="text-xs text-green-600">● Открыт</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{d.headline}</p>
                <p className="text-xs text-muted-foreground">📍 {d.location}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {d.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {d.cases} кейса
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

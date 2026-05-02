'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { path: '/onboarding/step-1', label: 'Профиль' },
  { path: '/onboarding/step-2', label: 'Навыки' },
  { path: '/onboarding/step-3', label: 'Опыт' },
]

export default function OnboardingProgress() {
  const pathname = usePathname()
  const currentStep = STEPS.findIndex((s) => pathname.startsWith(s.path)) + 1

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted-foreground">
        Шаг {currentStep} из {STEPS.length} — настройка профиля
      </p>
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const num = i + 1
          const done = num < currentStep
          const active = num === currentStep

          return (
            <div key={step.path} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    done || active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  ].join(' ')}
                >
                  {done ? '✓' : num}
                </div>
                <span
                  className={[
                    'text-xs font-medium',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-px mx-3 mb-5 transition-colors',
                    done ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

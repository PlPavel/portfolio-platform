'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LogoutButton from '@/components/shared/LogoutButton'

export default function SearchNav() {
  const pathname = usePathname()

  const links = [
    { href: '/search', label: 'Поиск дизайнеров' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <nav className="flex items-center gap-1">
        <Link href="/" className="font-semibold text-sm mr-4">
          Portfolio Platform
        </Link>
        {links.map(({ href, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-sm px-3 py-1.5 rounded-md transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <LogoutButton />
    </div>
  )
}

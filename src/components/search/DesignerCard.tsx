import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface DesignerRow {
  id: string
  username: string
  name: string
  headline: string | null
  location: string | null
  avatar_url: string | null
  is_available: boolean
  designer_skills: Array<{ skills: { id: string; name: string } | null }>
  cases: Array<{ id: string }>
}

interface Props {
  designer: DesignerRow
}

export default function DesignerCard({ designer }: Props) {
  const skills = designer.designer_skills
    .map(ds => ds.skills)
    .filter(Boolean)
    .slice(0, 3) as Array<{ id: string; name: string }>

  const caseCount = designer.cases?.length ?? 0

  return (
    <Link
      href={`/portfolio/${designer.username}`}
      className="group block border rounded-xl p-4 hover:shadow-md transition-shadow bg-card"
    >
      <div className="flex items-start gap-3">
        {designer.avatar_url ? (
          <Image
            src={designer.avatar_url}
            alt={designer.name}
            width={48}
            height={48}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium shrink-0">
            {designer.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold group-hover:underline truncate">{designer.name}</p>
            {designer.is_available && (
              <span className="text-xs text-green-600 font-medium shrink-0">● Открыт</span>
            )}
          </div>

          {designer.headline && (
            <p className="text-sm text-muted-foreground truncate">{designer.headline}</p>
          )}

          {designer.location && (
            <p className="text-xs text-muted-foreground">📍 {designer.location}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {skills.map(s => (
              <Badge key={s.id} variant="secondary" className="text-xs py-0">
                {s.name}
              </Badge>
            ))}
            {caseCount > 0 && (
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                {caseCount} {caseCount === 1 ? 'кейс' : caseCount < 5 ? 'кейса' : 'кейсов'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

import { Link } from 'react-router-dom'
import type { Item } from '../types/item'
import { daysUntilExpiry, urgencyTier, urgencyColor, expiryText } from '../lib/urgency'
import { CategoryIcon, categoryColor } from './CategoryIcon'
import { cn } from '@/lib/utils'

interface Props {
  item: Item
}

export function ItemCard({ item }: Props) {
  const days = daysUntilExpiry(item)
  const tier = urgencyTier(days)
  const c = urgencyColor(tier)
  const catColor = categoryColor(item.category)

  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-stretch gap-3 p-3 bg-card rounded-xl border hover:border-ring/40 hover:shadow-sm active:scale-[0.99] transition-all"
    >
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt=""
          className="shrink-0 size-14 rounded-lg object-cover bg-muted"
        />
      ) : (
        <div
          className={cn(
            'shrink-0 size-14 rounded-lg flex items-center justify-center',
            catColor.bg,
            catColor.text
          )}
        >
          <CategoryIcon category={item.category} size={26} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold truncate">{item.name}</h3>
          {item.countOwned > 1 && (
            <span className="text-xs text-muted-foreground shrink-0">×{item.countOwned}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {[item.brand, item.packageSize].filter(Boolean).join(' · ') || '—'}
        </p>
        <p className={cn('text-sm font-medium mt-0.5', c.text)}>{expiryText(days)}</p>
      </div>
      <div className={cn('w-1 self-stretch rounded-full', c.dot)} />
    </Link>
  )
}

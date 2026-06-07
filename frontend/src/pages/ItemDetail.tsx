import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Check, Trash2 } from 'lucide-react'
import { useItems } from '../lib/itemsStore'
import { useToast } from '../components/Toast'
import { daysUntilExpiry, urgencyTier, urgencyColor, expiryText } from '../lib/urgency'
import { CategoryIcon, categoryLabel } from '../components/CategoryIcon'
import { UrgencyBadge } from '../components/UrgencyBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  )
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items, setStatus } = useItems()
  const toast = useToast()
  const item = items.find((i) => i.id === id)

  if (!item) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground mb-2">Item not found</p>
        <Button asChild variant="link">
          <Link to="/">Back to items</Link>
        </Button>
      </div>
    )
  }

  const days = daysUntilExpiry(item)
  const tier = urgencyTier(days)
  const c = urgencyColor(tier)

  function markUsed() {
    setStatus(item!.id, 'used')
    toast.show(`${item!.name} marked as used`)
    navigate('/')
  }

  function discard() {
    setStatus(item!.id, 'discarded')
    toast.show(`${item!.name} discarded`)
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="size-6" />
          </Button>
          <h1 className="font-semibold text-lg truncate">{item.name}</h1>
        </div>
      </header>

      <div className="pb-32">
        {item.photoUrl && (
          <img src={item.photoUrl} alt={item.name} className="w-full h-48 object-cover" />
        )}

        <div className="px-4 pt-4">
          <div className={cn('p-4 rounded-xl border', c.bg, c.border)}>
            <div className="flex items-center justify-between mb-3">
              <UrgencyBadge tier={tier} />
              <CategoryIcon category={item.category} size={20} className="text-muted-foreground" />
            </div>
            <p className={cn('text-2xl font-bold', c.text)}>{expiryText(days)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {item.dateType === 'pao' ? 'PAO' : item.dateType.replace('-', ' ')}: {item.expiryDate}
            </p>
          </div>
        </div>

        <Card className="mx-4 mt-6 gap-0 py-2">
          <dl className="px-4">
            <Row label="Brand" value={item.brand || '—'} />
            <Row label="Category" value={categoryLabel(item.category)} />
            <Row label="Package size" value={item.packageSize || '—'} />
            <Row label="Count owned" value={String(item.countOwned)} />
            <Row label="Reminder" value={`${item.reminderLeadDays} days before`} />
            {item.dateType === 'pao' && item.openedOn && (
              <Row label="Opened on" value={item.openedOn} />
            )}
          </dl>
        </Card>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border-t px-4 py-3 z-20">
        <div className="grid grid-cols-2 gap-2">
          <Button size="lg" onClick={markUsed}>
            <Check className="size-5" /> Mark used
          </Button>
          <Button size="lg" variant="secondary" onClick={discard}>
            <Trash2 className="size-5" /> Discard
          </Button>
        </div>
      </div>
    </>
  )
}

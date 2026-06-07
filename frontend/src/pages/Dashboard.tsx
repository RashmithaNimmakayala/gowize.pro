import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useItems } from '../lib/itemsStore'
import { daysUntilExpiry, urgencyTier, urgencyLabel } from '../lib/urgency'
import type { UrgencyTier } from '../lib/urgency'
import type { Item } from '../types/item'
import { ItemCard } from '../components/ItemCard'
import { EmptyState } from '../components/EmptyState'

const TIER_ORDER: UrgencyTier[] = ['expired', 'critical', 'soon', 'later', 'safe']

export function DashboardPage() {
  const { items, loading, error } = useItems()

  const grouped = useMemo(() => {
    const active = items.filter((i) => i.status === 'active')
    const map = new Map<UrgencyTier, Item[]>()
    for (const tier of TIER_ORDER) map.set(tier, [])
    for (const item of active) {
      const tier = urgencyTier(daysUntilExpiry(item))
      map.get(tier)!.push(item)
    }
    for (const tier of TIER_ORDER) {
      map.get(tier)!.sort((a, b) => daysUntilExpiry(a) - daysUntilExpiry(b))
    }
    return map
  }, [items])

  const totalActive = Array.from(grouped.values()).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">My items</h1>
          {totalActive > 0 && (
            <span className="text-xs text-muted-foreground">{totalActive} tracked</span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin mb-2" />
          <span className="text-sm">Loading your items…</span>
        </div>
      ) : error ? (
        <div className="mx-4 mt-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-destructive">
          Couldn't reach the server. Make sure the backend is running, then pull to refresh from Settings.
        </div>
      ) : totalActive === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-4 pt-4 pb-24">
          {TIER_ORDER.map((tier) => {
            const items = grouped.get(tier)!
            if (items.length === 0) return null
            return (
              <section key={tier} className="mb-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {urgencyLabel(tier)}
                  <span className="text-muted-foreground/60 ml-1.5">· {items.length}</span>
                </h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}

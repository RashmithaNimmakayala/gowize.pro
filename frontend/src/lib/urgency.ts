import type { Item } from '../types/item'

export type UrgencyTier = 'expired' | 'critical' | 'soon' | 'later' | 'safe'

export function effectiveExpiryDate(item: Item): string {
  if (item.dateType === 'pao' && item.openedOn && item.paoMonths) {
    const d = new Date(item.openedOn)
    d.setMonth(d.getMonth() + item.paoMonths)
    return d.toISOString().slice(0, 10)
  }
  return item.expiryDate
}

export function daysUntilExpiry(item: Item, today: Date = new Date()): number {
  const expiry = effectiveExpiryDate(item)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiryDate = new Date(expiry + 'T00:00:00')
  const diffMs = expiryDate.getTime() - todayMidnight.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function urgencyTier(days: number): UrgencyTier {
  if (days < 0) return 'expired'
  if (days <= 1) return 'critical'
  if (days <= 7) return 'soon'
  if (days <= 30) return 'later'
  return 'safe'
}

export function urgencyLabel(tier: UrgencyTier): string {
  switch (tier) {
    case 'expired': return 'Expired'
    case 'critical': return 'Today / Tomorrow'
    case 'soon': return 'This week'
    case 'later': return 'This month'
    case 'safe': return 'Later'
  }
}

export interface UrgencyColors {
  bg: string
  text: string
  border: string
  dot: string
}

export function urgencyColor(tier: UrgencyTier): UrgencyColors {
  switch (tier) {
    case 'expired':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-600' }
    case 'critical':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' }
    case 'soon':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' }
    case 'later':
      return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' }
    case 'safe':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' }
  }
}

export function expiryText(days: number): string {
  if (days < -1) return `Expired ${-days} days ago`
  if (days === -1) return 'Expired yesterday'
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `Expires in ${days} days`
}

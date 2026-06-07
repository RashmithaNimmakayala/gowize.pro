import type { UrgencyTier } from '../lib/urgency'
import { urgencyColor, urgencyLabel } from '../lib/urgency'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  tier: UrgencyTier
}

export function UrgencyBadge({ tier }: Props) {
  const c = urgencyColor(tier)
  return (
    <Badge variant="outline" className={cn('rounded-full gap-1.5', c.bg, c.text, c.border)}>
      <span className={cn('size-1.5 rounded-full', c.dot)} />
      {urgencyLabel(tier)}
    </Badge>
  )
}

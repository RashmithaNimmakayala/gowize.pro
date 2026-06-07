import { Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Camera className="size-9 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-1">No items yet</h2>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Snap a photo of any product to start tracking when it expires.
      </p>
      <Button asChild size="lg">
        <Link to="/capture">
          <Camera className="size-5" />
          Add your first item
        </Link>
      </Button>
    </div>
  )
}

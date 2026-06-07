import { NavLink } from 'react-router-dom'
import { Home, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/80 backdrop-blur border-t z-20">
      <div className="grid grid-cols-3 h-16 items-center">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Home className="size-[22px]" />
          <span>Items</span>
        </NavLink>
        <NavLink to="/capture" className="flex justify-center">
          <div className="flex items-center justify-center size-14 -mt-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors">
            <Plus className="size-7" />
          </div>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Settings className="size-[22px]" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  )
}

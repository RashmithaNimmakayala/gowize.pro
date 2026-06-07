import { NavLink } from 'react-router-dom'
import { Home, Plus, Settings, Leaf } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Desktop-only left navigation. Hidden on mobile, where BottomNav takes over. */
export function Sidebar() {
  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col border-r bg-background">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" />
        </div>
        <span className="font-bold text-lg">GoWize</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <SideLink to="/" icon={<Home className="size-5" />}>Items</SideLink>
        <SideLink to="/settings" icon={<Settings className="size-5" />}>Settings</SideLink>
      </nav>

      <div className="p-3 border-t">
        <NavLink
          to="/capture"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-5" /> Add item
        </NavLink>
      </div>
    </aside>
  )
}

function SideLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}

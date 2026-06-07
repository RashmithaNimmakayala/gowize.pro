import { Bell, Clock, Info, RotateCcw } from 'lucide-react'
import { useItems } from '../lib/itemsStore'
import { useToast } from '../components/Toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function SettingsPage() {
  const { items, refresh } = useItems()
  const toast = useToast()

  const active = items.filter((i) => i.status === 'active').length
  const used = items.filter((i) => i.status === 'used').length
  const discarded = items.filter((i) => i.status === 'discarded').length

  async function handleRefresh() {
    await refresh()
    toast.show('Synced with server')
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Active" value={active} />
          <Stat label="Used" value={used} />
          <Stat label="Discarded" value={discarded} />
        </div>

        <Card className="py-0 gap-0">
          <CardContent className="px-0 divide-y">
            <SettingsRow icon={<Bell className="size-5" />} label="Notifications" hint="Coming soon">
              <Switch disabled />
            </SettingsRow>
            <SettingsRow
              icon={<Clock className="size-5" />}
              label="Default reminder times"
              hint="Per category"
            />
            <SettingsRow icon={<Info className="size-5" />} label="About" hint="v0.1" />
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={handleRefresh}>
          <RotateCcw className="size-4" />
          Sync with server
        </Button>

        <p className="text-xs text-muted-foreground text-center pt-2">GoWize · v0.1 (Draft)</p>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-3 gap-0">
      <CardContent className="px-3 text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  )
}

function SettingsRow({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  children?: React.ReactNode
}) {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {children ?? <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

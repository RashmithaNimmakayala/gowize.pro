import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft, X, Minus, Plus } from 'lucide-react'
import type { Category, DateType, FieldSource } from '../types/item'
import { categoryLabel } from '../components/CategoryIcon'
import { useItems } from '../lib/itemsStore'
import { useToast } from '../components/Toast'
import type { ScanResult } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_LEAD: Record<Category, number> = {
  grocery: 2,
  medicine: 14,
  cosmetic: 7,
}

const CATEGORIES: Category[] = ['grocery', 'medicine', 'cosmetic']

const PACKAGE_UNITS = ['ml', 'l', 'g', 'kg', 'oz', 'lb', 'pcs'] as const
type PackageUnit = (typeof PACKAGE_UNITS)[number]

function parsePackageSize(raw: string): { value: string; unit: PackageUnit } {
  const match = raw.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/)
  if (match) {
    const unit = match[2].toLowerCase()
    if ((PACKAGE_UNITS as readonly string[]).includes(unit)) {
      return { value: match[1], unit: unit as PackageUnit }
    }
  }
  return { value: '', unit: 'ml' }
}

function AutoBadge({ source }: { source?: FieldSource }) {
  if (!source || source === 'manual') return null
  const label = source === 'barcode' ? 'Barcode' : source === 'ocr' ? 'OCR' : 'Auto'
  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
      <Sparkles className="size-2.5" />
      {label}
    </Badge>
  )
}

export function ConfirmCardPage() {
  const navigate = useNavigate()
  const { addItem } = useItems()
  const toast = useToast()

  // Extraction handed over from the Capture screen via /api/scan.
  const scan = useMemo<ScanResult | null>(() => {
    const raw = sessionStorage.getItem('scanResult')
    return raw ? (JSON.parse(raw) as ScanResult) : null
  }, [])
  const sources = (scan?.sources ?? {}) as Record<string, FieldSource>

  const initialCategory = CATEGORIES.includes(scan?.category as Category)
    ? (scan!.category as Category)
    : 'grocery'

  const [photoUrl, setPhotoUrl] = useState<string | null>(scan?.photoUrl ?? null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(scan?.name ?? '')
  const [brand, setBrand] = useState(scan?.brand ?? '')
  const [category, setCategory] = useState<Category>(initialCategory)
  const [dateType, setDateType] = useState<DateType>((scan?.dateType as DateType) ?? 'expiry')
  const [expiryDate, setExpiryDate] = useState(scan?.expiryDate ?? '')
  const [openedOn, setOpenedOn] = useState('')
  const [paoMonths, setPaoMonths] = useState(12)
  const initialPackageSize = useMemo(() => parsePackageSize(scan?.packageSize ?? ''), [scan])
  const [packageSizeValue, setPackageSizeValue] = useState(initialPackageSize.value)
  const [packageSizeUnit, setPackageSizeUnit] = useState<PackageUnit>(initialPackageSize.unit)
  const [countOwned, setCountOwned] = useState(1)
  const [reminderLeadDays, setReminderLeadDays] = useState(DEFAULT_LEAD[initialCategory])

  useEffect(() => {
    setReminderLeadDays(DEFAULT_LEAD[category])
  }, [category])

  async function save() {
    if (saving) return
    if (!name.trim()) {
      toast.show('Please enter a product name')
      return
    }
    setSaving(true)
    try {
      await addItem({
        photoUrl: photoUrl ?? undefined,
        name: name.trim(),
        brand: brand.trim() || undefined,
        category,
        dateType,
        expiryDate,
        openedOn: dateType === 'pao' ? openedOn : undefined,
        paoMonths: dateType === 'pao' ? paoMonths : undefined,
        packageSize: packageSizeValue.trim() ? `${packageSizeValue.trim()}${packageSizeUnit}` : undefined,
        countOwned,
        reminderLeadDays,
        sources,
      })
      sessionStorage.removeItem('scanResult')
      toast.show(`${name} saved`)
      navigate('/')
    } catch (e) {
      console.error(e)
      toast.show("Couldn't save — is the backend running?")
      setSaving(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-2xl flex items-center gap-2 px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="size-6" />
          </Button>
          <h1 className="font-semibold text-lg">Confirm details</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl pb-6">
        {photoUrl && (
          <div className="px-4 pt-4 relative">
            <img src={photoUrl} alt="Captured" className="w-full h-48 object-cover rounded-xl" />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setPhotoUrl(null)}
              className="absolute top-6 right-6 size-8 rounded-full bg-black/60 text-white hover:bg-black/70"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <div className="mx-4 mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-2">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary/90">
            We pre-filled what we could read. Tap any field to change it.
          </p>
        </div>

        <form
          className="px-4 mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Product name</Label>
              <AutoBadge source={sources.name} />
            </div>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="brand">
                Brand <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <AutoBadge source={sources.brand} />
            </div>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Category</Label>
              <AutoBadge source={sources.category} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={category === c ? 'default' : 'outline'}
                  onClick={() => setCategory(c)}
                >
                  {categoryLabel(c)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Date type</Label>
              <AutoBadge source={sources.dateType} />
            </div>
            <Select value={dateType} onValueChange={(v) => setDateType(v as DateType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-before">Best before</SelectItem>
                <SelectItem value="use-by">Use by</SelectItem>
                <SelectItem value="expiry">Expiry</SelectItem>
                <SelectItem value="manufacture">Manufacture date</SelectItem>
                <SelectItem value="pao">PAO (period after opening)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateType !== 'pao' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiry">
                  Expiry date <span className="text-destructive">*</span>
                </Label>
                <AutoBadge source={sources.expiryDate} />
              </div>
              <Input
                id="expiry"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="openedOn">
                  Opened on <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="openedOn"
                  type="date"
                  required
                  value={openedOn}
                  onChange={(e) => setOpenedOn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pao">PAO months (e.g. 12M)</Label>
                <Input
                  id="pao"
                  type="number"
                  min={1}
                  value={paoMonths}
                  onChange={(e) => setPaoMonths(parseInt(e.target.value) || 0)}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="size">
                Package size <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <AutoBadge source={sources.packageSize} />
            </div>
            <div className="flex gap-2">
              <Input
                id="size"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="e.g. 500"
                value={packageSizeValue}
                onChange={(e) => setPackageSizeValue(e.target.value)}
                className="flex-1"
              />
              <Select value={packageSizeUnit} onValueChange={(v) => setPackageSizeUnit(v as PackageUnit)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>How many do you have?</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCountOwned((c) => Math.max(1, c - 1))}
                aria-label="Decrease count"
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-xl font-semibold w-10 text-center">{countOwned}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCountOwned((c) => c + 1)}
                aria-label="Increase count"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Remind me <span className="text-primary font-semibold">{reminderLeadDays} days</span>{' '}
              before
            </Label>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[reminderLeadDays]}
              onValueChange={([v]) => setReminderLeadDays(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>
        </form>
      </div>

      <div className="sticky bottom-16 md:bottom-0 z-20 border-t bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <Button type="button" size="lg" onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save item'}
          </Button>
        </div>
      </div>
    </>
  )
}

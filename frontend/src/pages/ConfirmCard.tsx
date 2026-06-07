import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft, X, Minus, Plus } from 'lucide-react'
import type { Category, DateType, FieldSource } from '../types/item'
import { categoryLabel } from '../components/CategoryIcon'
import { useItems } from '../lib/itemsStore'
import { useToast } from '../components/Toast'
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

const MOCK_EXTRACTION = {
  name: 'Greek Yogurt',
  brand: 'Chobani',
  category: 'grocery' as Category,
  dateType: 'best-before' as DateType,
  expiryDate: (() => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    return d.toISOString().slice(0, 10)
  })(),
  packageSize: '200g',
  sources: {
    name: 'barcode' as FieldSource,
    brand: 'barcode' as FieldSource,
    category: 'auto' as FieldSource,
    dateType: 'ocr' as FieldSource,
    expiryDate: 'ocr' as FieldSource,
    packageSize: 'ocr' as FieldSource,
  },
}

const DEFAULT_LEAD: Record<Category, number> = {
  grocery: 2,
  medicine: 14,
  cosmetic: 7,
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

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(MOCK_EXTRACTION.name)
  const [brand, setBrand] = useState(MOCK_EXTRACTION.brand)
  const [category, setCategory] = useState<Category>(MOCK_EXTRACTION.category)
  const [dateType, setDateType] = useState<DateType>(MOCK_EXTRACTION.dateType)
  const [expiryDate, setExpiryDate] = useState(MOCK_EXTRACTION.expiryDate)
  const [openedOn, setOpenedOn] = useState('')
  const [paoMonths, setPaoMonths] = useState(12)
  const [packageSize, setPackageSize] = useState(MOCK_EXTRACTION.packageSize)
  const [countOwned, setCountOwned] = useState(1)
  const [reminderLeadDays, setReminderLeadDays] = useState(DEFAULT_LEAD[MOCK_EXTRACTION.category])

  useEffect(() => {
    const url = sessionStorage.getItem('capturePhoto')
    setPhotoUrl(url)
  }, [])

  useEffect(() => {
    setReminderLeadDays(DEFAULT_LEAD[category])
  }, [category])

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      addItem({
        photoUrl: photoUrl ?? undefined,
        name: name.trim(),
        brand: brand.trim() || undefined,
        category,
        dateType,
        expiryDate,
        openedOn: dateType === 'pao' ? openedOn : undefined,
        paoMonths: dateType === 'pao' ? paoMonths : undefined,
        packageSize: packageSize.trim() || undefined,
        countOwned,
        reminderLeadDays,
        sources: MOCK_EXTRACTION.sources,
      })
      sessionStorage.removeItem('capturePhoto')
      toast.show(`${name} saved`)
      navigate('/')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="size-6" />
          </Button>
          <h1 className="font-semibold text-lg">Confirm details</h1>
        </div>
      </header>

      <div className="pb-32">
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
            We pre-filled what we could. Tap any field to change it.
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
              <AutoBadge source={MOCK_EXTRACTION.sources.name} />
            </div>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="brand">
                Brand <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <AutoBadge source={MOCK_EXTRACTION.sources.brand} />
            </div>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Category</Label>
              <AutoBadge source={MOCK_EXTRACTION.sources.category} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['grocery', 'medicine', 'cosmetic'] as Category[]).map((c) => (
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
              <AutoBadge source={MOCK_EXTRACTION.sources.dateType} />
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
                <AutoBadge source={MOCK_EXTRACTION.sources.expiryDate} />
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
              <AutoBadge source={MOCK_EXTRACTION.sources.packageSize} />
            </div>
            <Input
              id="size"
              placeholder="e.g. 500ml, 200g"
              value={packageSize}
              onChange={(e) => setPackageSize(e.target.value)}
            />
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

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border-t px-4 py-3 z-20">
        <Button type="button" size="lg" onClick={save} disabled={saving} className="w-full">
          {saving ? 'Saving…' : 'Save item'}
        </Button>
      </div>
    </>
  )
}

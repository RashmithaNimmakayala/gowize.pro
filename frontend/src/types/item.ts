export type Category = 'grocery' | 'medicine' | 'cosmetic'

export type DateType =
  | 'best-before'
  | 'use-by'
  | 'expiry'
  | 'manufacture'
  | 'pao'

export type FieldSource = 'barcode' | 'ocr' | 'llm' | 'auto' | 'manual'

export type ItemStatus = 'active' | 'used' | 'discarded'

export interface FieldSources {
  name?: FieldSource
  brand?: FieldSource
  category?: FieldSource
  dateType?: FieldSource
  expiryDate?: FieldSource
  packageSize?: FieldSource
}

export interface Item {
  id: string
  photoUrl?: string
  name: string
  brand?: string
  category: Category
  dateType: DateType
  expiryDate: string
  openedOn?: string
  paoMonths?: number
  packageSize?: string
  countOwned: number
  reminderLeadDays: number
  status: ItemStatus
  createdAt: string
  sources: FieldSources
}

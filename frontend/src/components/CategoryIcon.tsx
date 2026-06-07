import { Apple, Pill, Sparkles } from 'lucide-react'
import type { Category } from '../types/item'

interface Props {
  category: Category
  size?: number
  className?: string
}

export function CategoryIcon({ category, size = 20, className = '' }: Props) {
  if (category === 'grocery') return <Apple size={size} className={className} />
  if (category === 'medicine') return <Pill size={size} className={className} />
  return <Sparkles size={size} className={className} />
}

export function categoryLabel(category: Category): string {
  if (category === 'grocery') return 'Grocery'
  if (category === 'medicine') return 'Medicine'
  return 'Cosmetic'
}

export function categoryColor(category: Category): { bg: string; text: string } {
  if (category === 'grocery') return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
  if (category === 'medicine') return { bg: 'bg-blue-100', text: 'text-blue-700' }
  return { bg: 'bg-pink-100', text: 'text-pink-700' }
}

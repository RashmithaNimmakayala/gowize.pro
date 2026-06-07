import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Item, ItemStatus } from '../types/item'
import { mockItems } from './mockData'

const STORAGE_KEY = 'gowize:items'
const SEEDED_KEY = 'gowize:seeded'

interface ItemsContextValue {
  items: Item[]
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'status'>) => Item
  updateItem: (id: string, patch: Partial<Item>) => void
  setStatus: (id: string, status: ItemStatus) => void
  deleteItem: (id: string) => void
  resetSeed: () => void
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

function load(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Item[]
  } catch {
    // fall through
  }
  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(SEEDED_KEY, '1')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems))
    return mockItems
  }
  return []
}

function save(items: Item[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(() => load())

  useEffect(() => {
    save(items)
  }, [items])

  const addItem = useCallback<ItemsContextValue['addItem']>((draft) => {
    const item: Item = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    setItems((prev) => [item, ...prev])
    return item
  }, [])

  const updateItem = useCallback<ItemsContextValue['updateItem']>((id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const setStatus = useCallback<ItemsContextValue['setStatus']>((id, status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }, [])

  const deleteItem = useCallback<ItemsContextValue['deleteItem']>((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const resetSeed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SEEDED_KEY)
    setItems(load())
  }, [])

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, setStatus, deleteItem, resetSeed }}>
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used inside <ItemsProvider>')
  return ctx
}

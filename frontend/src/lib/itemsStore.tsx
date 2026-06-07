import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Item, ItemStatus } from '../types/item'
import { api, type ItemDraft } from './api'

interface ItemsContextValue {
  items: Item[]
  loading: boolean
  error: string | null
  addItem: (draft: ItemDraft) => Promise<Item>
  setStatus: (id: string, status: ItemStatus) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await api.listItems())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback<ItemsContextValue['addItem']>(async (draft) => {
    const created = await api.createItem(draft)
    setItems((prev) => [created, ...prev])
    return created
  }, [])

  const setStatus = useCallback<ItemsContextValue['setStatus']>(async (id, status) => {
    const updated = await api.setItemStatus(id, status)
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
  }, [])

  const deleteItem = useCallback<ItemsContextValue['deleteItem']>(async (id) => {
    await api.deleteItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return (
    <ItemsContext.Provider
      value={{ items, loading, error, addItem, setStatus, deleteItem, refresh }}
    >
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used inside <ItemsProvider>')
  return ctx
}

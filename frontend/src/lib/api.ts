import type { Item, ItemStatus } from '../types/item'

// Backend base URL. Override at build time with VITE_API_URL (e.g. the deployed
// App Runner / api.gowize.pro URL); defaults to the local Spring Boot server.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

/** Best-effort fields extracted from a scanned photo (mirrors backend ScanResponse). */
export interface ScanResult {
  name: string | null
  brand: string | null
  category: string | null
  dateType: string | null
  expiryDate: string | null
  packageSize: string | null
  photoUrl: string | null
  sources: Record<string, string>
  rawLines: string[]
}

export type ItemDraft = Omit<Item, 'id' | 'createdAt' | 'status'>

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`API ${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`)
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

export const api = {
  async scan(image: Blob): Promise<ScanResult> {
    const form = new FormData()
    form.append('file', image, 'scan.jpg')
    return unwrap<ScanResult>(await fetch(`${BASE}/api/scan`, { method: 'POST', body: form }))
  },

  async listItems(): Promise<Item[]> {
    return unwrap<Item[]>(await fetch(`${BASE}/api/items`))
  },

  async createItem(draft: ItemDraft): Promise<Item> {
    return unwrap<Item>(
      await fetch(`${BASE}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    )
  },

  async setItemStatus(id: string, status: ItemStatus): Promise<Item> {
    return unwrap<Item>(
      await fetch(`${BASE}/api/items/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH',
      }),
    )
  },

  async deleteItem(id: string): Promise<void> {
    return unwrap<void>(await fetch(`${BASE}/api/items/${id}`, { method: 'DELETE' }))
  },
}

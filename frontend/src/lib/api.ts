import type { Item, ItemStatus } from '../types/item'

// Backend base URL. Override at build time with VITE_API_URL (e.g. the deployed
// App Runner / api.gowize.pro URL); defaults to the local Spring Boot server.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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

export interface AuthPayload {
  token: string
  id: string
  name: string
  email: string
}

export const api = {
  async login(email: string, password: string): Promise<AuthPayload> {
    return unwrap<AuthPayload>(
      await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
    )
  },

  async register(data: {
    name: string
    email: string
    password: string
    phone?: string
    addressLine1?: string
    addressLine2?: string
    state?: string
    country?: string
    zipcode?: string
  }): Promise<AuthPayload> {
    return unwrap<AuthPayload>(
      await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    )
  },

  async scan(image: Blob): Promise<ScanResult> {
    const form = new FormData()
    form.append('file', image, 'scan.jpg')
    return unwrap<ScanResult>(
      await fetch(`${BASE}/api/scan`, { method: 'POST', headers: authHeaders(), body: form }),
    )
  },

  async listItems(): Promise<Item[]> {
    return unwrap<Item[]>(await fetch(`${BASE}/api/items`, { headers: authHeaders() }))
  },

  async createItem(draft: ItemDraft): Promise<Item> {
    return unwrap<Item>(
      await fetch(`${BASE}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(draft),
      }),
    )
  },

  async setItemStatus(id: string, status: ItemStatus): Promise<Item> {
    return unwrap<Item>(
      await fetch(`${BASE}/api/items/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH',
        headers: authHeaders(),
      }),
    )
  },

  async deleteItem(id: string): Promise<void> {
    return unwrap<void>(
      await fetch(`${BASE}/api/items/${id}`, { method: 'DELETE', headers: authHeaders() }),
    )
  },
}

const BASE = 'https://countriesnow.space/api/v0.1'

const countryCache: string[] = []
const stateCache: Record<string, string[]> = {}

export async function fetchCountries(): Promise<string[]> {
  if (countryCache.length > 0) return countryCache

  const res = await fetch(`${BASE}/countries/positions`)
  if (!res.ok) throw new Error('Failed to fetch countries')
  const json = await res.json()
  const names: string[] = (json.data as { name: string }[])
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b))
  countryCache.push(...names)
  return countryCache
}

export async function fetchStates(country: string): Promise<string[]> {
  if (stateCache[country]) return stateCache[country]

  const res = await fetch(`${BASE}/countries/states`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country }),
  })
  if (!res.ok) return []
  const json = await res.json()
  const states: string[] = ((json.data?.states ?? []) as { name: string }[])
    .map((s) => s.name)
    .sort((a, b) => a.localeCompare(b))
  stateCache[country] = states
  return states
}

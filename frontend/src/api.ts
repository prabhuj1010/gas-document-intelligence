// API base URL comes from the environment (frontend/.env.local), defaulting to the local backend.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export type ServiceStatus = { status: string; [key: string]: unknown }

export type HealthResponse = {
  status: 'ok' | 'degraded'
  services: Record<string, ServiceStatus>
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { signal, cache: 'no-store' })
  // 503 still carries a useful body describing which dependency is down
  if (!res.ok && res.status !== 503) throw new Error(`Health check failed: HTTP ${res.status}`)
  return res.json()
}

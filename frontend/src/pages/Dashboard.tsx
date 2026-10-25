import { useEffect, useState } from 'react'
import { API_BASE_URL, getHealth, type HealthResponse } from '../api.ts'

const LABELS: Record<string, string> = { api: 'API', database: 'PostgreSQL + pgvector', ollama: 'Ollama (local AI)' }

function pillClass(status: string) {
  if (status === 'ok') return 'pill ok'
  if (status === 'not_configured' || status === 'configured' || status === 'degraded') return 'pill warn'
  return 'pill bad'
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    getHealth(ctrl.signal)
      .then(setHealth)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    return () => ctrl.abort()
  }, [])

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">Document counts and ingestion statuses appear here once uploads are enabled (Day 2).</p>

      <section className="card">
        <h2>System status</h2>
        {error && (
          <p>
            <span className="pill bad">API unreachable</span> Could not reach <code>{API_BASE_URL}</code>. Is the
            backend running?
          </p>
        )}
        {!health && !error && <p className="muted">Checking…</p>}
        {health && (
          <ul className="status-list">
            {Object.entries(health.services).map(([name, svc]) => (
              <li key={name}>
                <span>
                  {LABELS[name] ?? name}
                  {typeof svc.pgvector === 'string' && <span className="muted"> · pgvector {svc.pgvector}</span>}
                </span>
                <span className={pillClass(svc.status)}>{svc.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

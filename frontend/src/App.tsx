import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Chat from './pages/Chat.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Documents from './pages/Documents.tsx'
import Upload from './pages/Upload.tsx'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/upload', label: 'Upload' },
  { to: '/documents', label: 'Documents' },
  { to: '/chat', label: 'Chat' },
]

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src="/favicon.svg" alt="" />
          <span>GAS Docs</span>
        </div>
        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

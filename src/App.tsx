import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './views/Dashboard'
import Timeline from './views/Timeline'
import PhaseDetail from './views/PhaseDetail'
import Papers from './views/Papers'
import Experiments from './views/Experiments'
import Writing from './views/Writing'
import Meetings from './views/Meetings'
import Risks from './views/Risks'
import Settings from './views/Settings'

const NAV = [
  ['/', 'Αρχική'],
  ['/timeline', 'Χρονοδιάγραμμα'],
  ['/papers', 'Papers'],
  ['/experiments', 'Πειράματα'],
  ['/writing', 'Γραφή'],
  ['/meetings', 'Συναντήσεις'],
  ['/risks', 'Ρίσκα'],
  ['/settings', 'Ρυθμίσεις'],
] as const

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Μετάβαση στο περιεχόμενο
      </a>
      <header className="topbar">
        <strong className="brand">Πρόοδος Διπλωματικής</strong>
        <nav aria-label="Κύρια πλοήγηση">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/phase/:id" element={<PhaseDetail />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

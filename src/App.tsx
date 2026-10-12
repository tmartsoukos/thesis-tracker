import { useEffect, useRef, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { daysLeft } from './lib/progress'
import { todayAthens } from './lib/dates'
import { Icon } from './components/icons'
import type { IconName } from './components/icons'
import Dashboard from './views/Dashboard'
import Timeline from './views/Timeline'
import PhaseDetail from './views/PhaseDetail'
import Papers from './views/Papers'
import Experiments from './views/Experiments'
import Writing from './views/Writing'
import Meetings from './views/Meetings'
import Risks from './views/Risks'
import Settings from './views/Settings'

interface NavItem {
  to: string
  label: string
  short?: string // shorter label for the mobile tab bar
  icon: IconName
}

const NAV: NavItem[] = [
  { to: '/', label: 'Αρχική', icon: 'home' },
  { to: '/timeline', label: 'Χρονοδιάγραμμα', short: 'Πλάνο', icon: 'timeline' },
  { to: '/papers', label: 'Papers', icon: 'book' },
  { to: '/experiments', label: 'Πειράματα', icon: 'flask' },
  { to: '/writing', label: 'Γραφή', icon: 'pen' },
  { to: '/meetings', label: 'Συναντήσεις', icon: 'calendar' },
  { to: '/risks', label: 'Ρίσκα', icon: 'shield' },
  { to: '/settings', label: 'Ρυθμίσεις', icon: 'settings' },
]

const TABS = NAV.filter((n) => ['/', '/timeline', '/writing', '/meetings'].includes(n.to))
const MORE = NAV.filter((n) => !TABS.includes(n))

export default function App() {
  const { data } = useStore()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const left = Math.max(0, daysLeft(data.deadline, todayAthens()))

  // Close the "more" menu on navigation, Escape or an outside click.
  useEffect(() => setMoreOpen(false), [location.pathname])
  useEffect(() => {
    if (!moreOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false)
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [moreOpen])

  const moreActive = MORE.some((n) => location.pathname.startsWith(n.to))

  return (
    <div className="shell">
      <a className="skip" href="#main">
        Μετάβαση στο περιεχόμενο
      </a>

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            Δ
          </span>
          <span>Πρόοδος Διπλωματικής</span>
        </div>
        <nav aria-label="Κύρια πλοήγηση" className="side-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="side-foot">
          <strong>{left}</strong> ημέρες έως την παράδοση
        </p>
      </aside>

      <header className="topbar">
        <span className="brand-mark" aria-hidden="true">
          Δ
        </span>
        <strong>Πρόοδος Διπλωματικής</strong>
      </header>

      <main id="main">
        <div className="page" key={location.pathname}>
          <Routes location={location}>
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
        </div>
      </main>

      <div className="tabbar-wrap" ref={moreRef}>
        {moreOpen && (
          <div className="more-menu" id="more-menu">
            {MORE.map((n) => (
              <NavLink key={n.to} to={n.to}>
                <Icon name={n.icon} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </div>
        )}
        <nav className="tabbar" aria-label="Πλοήγηση κινητού">
          {TABS.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>
              <Icon name={n.icon} />
              <span>{n.short ?? n.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={moreActive ? 'tab-more active' : 'tab-more'}
            aria-expanded={moreOpen}
            aria-controls="more-menu"
            onClick={() => setMoreOpen((o) => !o)}
          >
            <Icon name="more" />
            <span>Περισσότερα</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

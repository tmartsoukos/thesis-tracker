import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { addDays, diffDays, formatDate, todayAthens } from '../lib/dates'
import { phaseProgress } from '../lib/progress'
import { PHASE_STATUS } from '../labels'
import { Badge } from '../components/ui'

export default function Timeline() {
  const { data } = useStore()
  const navigate = useNavigate()
  const today = todayAthens()

  const phases = data.phases
  if (phases.length === 0) return <p>Δεν υπάρχουν φάσεις.</p>

  const min = phases.reduce((m, p) => (p.startDate < m ? p.startDate : m), phases[0].startDate)
  const maxPhase = phases.reduce((m, p) => (p.endDate > m ? p.endDate : m), phases[0].endDate)
  const max = data.deadline > maxPhase ? data.deadline : maxPhase
  const span = diffDays(min, max) + 1
  const pct = (ymd: string) => (diffDays(min, ymd) / span) * 100

  // First-of-month tick marks inside the range.
  const months: { date: string; label: string }[] = []
  const names = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ']
  for (let d = addDays(min, 0); d <= max; d = addDays(d, 1)) {
    if (d.endsWith('-01')) {
      months.push({ date: d, label: `${names[Number(d.slice(5, 7)) - 1]} ${d.slice(2, 4)}` })
    }
  }

  const todayInRange = today >= min && today <= max

  return (
    <>
      <div className="page-head">
        <h1>Χρονοδιάγραμμα</h1>
        <p className="muted">Επιλέξτε μια φάση για λεπτομέρειες.</p>
      </div>
      <div className="gantt-scroll">
        <div className="gantt">
          <div className="gantt-axis" aria-hidden="true">
            {months.map((m) => (
              <span key={m.date} className="gantt-tick" style={{ left: `${pct(m.date)}%` }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="gantt-body">
            {months.map((m) => (
              <span
                key={m.date}
                className="gantt-grid"
                style={{ left: `${pct(m.date)}%` }}
                aria-hidden="true"
              />
            ))}
            {todayInRange && (
              <span
                className="gantt-today"
                style={{ left: `${pct(today)}%` }}
                title={`Σήμερα ${formatDate(today)}`}
              >
                <span className="gantt-today-label">Σήμερα</span>
              </span>
            )}
            {phases.map((p) => {
              const left = pct(p.startDate)
              const width = ((diffDays(p.startDate, p.endDate) + 1) / span) * 100
              return (
                <div className="gantt-row" key={p.id}>
                  <button
                    type="button"
                    className={`gantt-bar status-${p.status}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => navigate(`/phase/${p.id}`)}
                    aria-label={`${p.title}, ${formatDate(p.startDate)} έως ${formatDate(p.endDate)}, ${PHASE_STATUS[p.status]}, ${Math.round(phaseProgress(p))}%`}
                  >
                    <span className="gantt-bar-fill" style={{ width: `${phaseProgress(p)}%` }} />
                  </button>
                  <span className="gantt-tip" role="presentation" style={{ left: `${Math.min(left, 70)}%` }}>
                    <strong>{p.title}</strong>
                    <br />
                    {formatDate(p.startDate)} – {formatDate(p.endDate)}
                    <br />
                    {PHASE_STATUS[p.status]} · {Math.round(phaseProgress(p))}%
                  </span>
                  <span
                    className="gantt-label"
                    style={left > 60 ? { right: `${100 - left}%` } : { left: `${left + width}%` }}
                  >
                    {p.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <h2>Φάσεις</h2>
      <ul className="list">
        {phases.map((p) => (
          <li key={p.id}>
            <Badge kind={p.status}>{PHASE_STATUS[p.status]}</Badge>{' '}
            <Link to={`/phase/${p.id}`}>{p.title}</Link>{' '}
            <span className="muted small">
              {formatDate(p.startDate)} – {formatDate(p.endDate)} · {Math.round(phaseProgress(p))}%
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

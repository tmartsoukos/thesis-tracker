import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { newId, useStore } from '../store'
import { formatDate } from '../lib/dates'
import { phaseProgress } from '../lib/progress'
import { PHASE_STATUS } from '../labels'
import { ProgressBar, Select } from '../components/ui'
import type { Phase, Task } from '../types'

export default function PhaseDetail() {
  const { id } = useParams()
  const { data, update } = useStore()
  const [newTitle, setNewTitle] = useState('')
  const [editing, setEditing] = useState<string | null>(null)

  const phase = data.phases.find((p) => p.id === id)
  if (!phase) {
    return (
      <>
        <h1>Η φάση δεν βρέθηκε</h1>
        <Link to="/timeline">Πίσω στο χρονοδιάγραμμα</Link>
      </>
    )
  }

  // Mutate the phase inside the store's cloned draft.
  const edit = (fn: (p: Phase) => void) =>
    update((d) => {
      const p = d.phases.find((x) => x.id === phase.id)
      if (p) fn(p)
    })
  const editTask = (taskId: string, fn: (t: Task) => void) =>
    edit((p) => {
      const t = p.tasks.find((x) => x.id === taskId)
      if (t) fn(t)
    })
  const move = (index: number, dir: -1 | 1) =>
    edit((p) => {
      const j = index + dir
      if (j < 0 || j >= p.tasks.length) return
      ;[p.tasks[index], p.tasks[j]] = [p.tasks[j], p.tasks[index]]
    })

  const add = (e: FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    edit((p) => p.tasks.push({ id: newId(), title, done: false }))
    setNewTitle('')
  }

  const progress = phaseProgress(phase)

  return (
    <>
      <p>
        <Link to="/timeline">← Χρονοδιάγραμμα</Link>
      </p>
      <h1>{phase.title}</h1>
      <p className="muted">
        {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
      </p>

      <div className="row">
        <label>
          Κατάσταση{' '}
          <Select
            label="Κατάσταση φάσης"
            value={phase.status}
            options={PHASE_STATUS}
            onChange={(v) => edit((p) => (p.status = v))}
          />
        </label>
      </div>
      <ProgressBar value={progress} label="Πρόοδος φάσης" />
      <p className="muted">
        {phase.tasks.filter((t) => t.done).length} από {phase.tasks.length} tasks (
        {Math.round(progress)}%)
      </p>

      <h2>Tasks</h2>
      {phase.tasks.length === 0 && <p className="muted">Δεν υπάρχουν tasks.</p>}
      <ul className="tasks">
        {phase.tasks.map((t, i) => (
          <li key={t.id} className="task">
            <div className="task-main">
              <input
                type="checkbox"
                aria-label={`Ολοκληρώθηκε: ${t.title}`}
                checked={t.done}
                onChange={() => editTask(t.id, (x) => (x.done = !x.done))}
              />
              {editing === t.id ? (
                <input
                  className="grow"
                  aria-label="Τίτλος task"
                  autoFocus
                  value={t.title}
                  onChange={(e) => editTask(t.id, (x) => (x.title = e.target.value))}
                  onBlur={() => setEditing(null)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && setEditing(null)}
                />
              ) : (
                <span className={t.done ? 'grow done' : 'grow'}>{t.title}</span>
              )}
              <span className="btn-group">
                <button type="button" aria-label={`Επάνω: ${t.title}`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Κάτω: ${t.title}`}
                  disabled={i === phase.tasks.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
                <button type="button" aria-label={`Επεξεργασία: ${t.title}`} onClick={() => setEditing(t.id)}>
                  ✎
                </button>
                <button
                  type="button"
                  className="danger"
                  aria-label={`Διαγραφή: ${t.title}`}
                  onClick={() => edit((p) => (p.tasks = p.tasks.filter((x) => x.id !== t.id)))}
                >
                  ✕
                </button>
              </span>
            </div>
            <div className="task-extra">
              <label>
                Προθεσμία{' '}
                <input
                  type="date"
                  value={t.dueDate ?? ''}
                  onChange={(e) => editTask(t.id, (x) => (x.dueDate = e.target.value || undefined))}
                />
              </label>
              <label className="grow">
                Σημείωση{' '}
                <input
                  type="text"
                  value={t.note ?? ''}
                  onChange={(e) => editTask(t.id, (x) => (x.note = e.target.value || undefined))}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <form className="row" onSubmit={add}>
        <label className="grow">
          Νέο task{' '}
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Τίτλος" />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>

      <h2>Σημειώσεις</h2>
      <label>
        <span className="sr-only">Σημειώσεις φάσης</span>
        <textarea
          rows={6}
          value={phase.notes}
          onChange={(e) => edit((p) => (p.notes = e.target.value))}
        />
      </label>
    </>
  )
}

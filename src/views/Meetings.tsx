import { useState } from 'react'
import type { FormEvent } from 'react'
import { newId, useStore } from '../store'
import { formatDate, todayAthens } from '../lib/dates'
import type { Meeting } from '../types'
import { Icon } from '../components/icons'
import { EmptyState } from '../components/ui'

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const { update } = useStore()
  const [text, setText] = useState('')

  const edit = (fn: (m: Meeting) => void) =>
    update((d) => {
      const m = d.meetings.find((x) => x.id === meeting.id)
      if (m) fn(m)
    })

  const addItem = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    edit((m) => m.actionItems.push({ id: newId(), text: text.trim(), done: false }))
    setText('')
  }

  return (
    <li className="card">
      <div className="row">
        <h3 className="grow">
          {meeting.title} <span className="muted small">{formatDate(meeting.date)}</span>
        </h3>
        <button
          type="button"
          className="danger"
          aria-label={`Διαγραφή συνάντησης: ${meeting.title}`}
          onClick={() => update((d) => (d.meetings = d.meetings.filter((x) => x.id !== meeting.id)))}
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
      <label>
        Σημειώσεις
        <textarea rows={3} value={meeting.notes} onChange={(e) => edit((m) => (m.notes = e.target.value))} />
      </label>
      <h4>Action items</h4>
      <ul className="list">
        {meeting.actionItems.map((a) => (
          <li key={a.id} className="row tight">
            <label className="check grow">
              <input
                type="checkbox"
                checked={a.done}
                onChange={() =>
                  edit((m) => {
                    const x = m.actionItems.find((i) => i.id === a.id)
                    if (x) x.done = !x.done
                  })
                }
              />
              <span className={a.done ? 'done' : ''}>{a.text}</span>
            </label>
            <button
              type="button"
              className="danger"
              aria-label={`Διαγραφή action item: ${a.text}`}
              onClick={() => edit((m) => (m.actionItems = m.actionItems.filter((i) => i.id !== a.id)))}
            >
              <Icon name="trash" size={18} />
            </button>
          </li>
        ))}
      </ul>
      <form className="row" onSubmit={addItem}>
        <label className="grow">
          Νέο action item <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="submit">Προσθήκη</button>
      </form>
    </li>
  )
}

export default function Meetings() {
  const { data, update } = useStore()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayAthens())

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    update((d) => d.meetings.push({ id: newId(), title: title.trim(), date, notes: '', actionItems: [] }))
    setTitle('')
  }

  const sorted = [...data.meetings].sort((a, b) => a.date.localeCompare(b.date))
  const today = todayAthens()
  const upcoming = sorted.filter((m) => m.date >= today)
  const past = sorted.filter((m) => m.date < today).reverse()

  return (
    <>
      <div className="page-head">
        <h1>Συναντήσεις και ημερολόγιο</h1>
      </div>
      <form className="row" onSubmit={add}>
        <label className="grow">
          Τίτλος <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Ημερομηνία{' '}
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>

      <h2>Επερχόμενες</h2>
      {upcoming.length === 0 && <EmptyState icon="calendar" title="Καμία επερχόμενη συνάντηση" />}
      <ul className="stack">
        {upcoming.map((m) => (
          <MeetingCard key={m.id} meeting={m} />
        ))}
      </ul>

      <h2>Προηγούμενες</h2>
      {past.length === 0 && <EmptyState icon="calendar" title="Καμία προηγούμενη συνάντηση" />}
      <ul className="stack">
        {past.map((m) => (
          <MeetingCard key={m.id} meeting={m} />
        ))}
      </ul>
    </>
  )
}

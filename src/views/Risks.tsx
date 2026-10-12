import { useState } from 'react'
import type { FormEvent } from 'react'
import { newId, useStore } from '../store'
import { RISK_STATUS } from '../labels'
import { Select } from '../components/ui'
import type { Risk } from '../types'

export default function Risks() {
  const { data, update } = useStore()
  const [text, setText] = useState('')
  const [mitigation, setMitigation] = useState('')

  const edit = (id: string, fn: (r: Risk) => void) =>
    update((d) => {
      const r = d.risks.find((x) => x.id === id)
      if (r) fn(r)
    })

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    update((d) =>
      d.risks.push({ id: newId(), text: text.trim(), mitigation: mitigation.trim(), status: 'open' }),
    )
    setText('')
    setMitigation('')
  }

  return (
    <>
      <h1>Ρίσκα</h1>
      <form className="row" onSubmit={add}>
        <label className="grow">
          Ρίσκο <input required value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label className="grow">
          Αντιμετώπιση <input value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>

      {data.risks.length === 0 ? (
        <p className="muted">Δεν έχουν καταγραφεί ρίσκα.</p>
      ) : (
        <ul className="stack">
          {data.risks.map((r) => (
            <li key={r.id} className="card">
              <div className="row">
                <label className="grow">
                  Ρίσκο
                  <input value={r.text} onChange={(e) => edit(r.id, (x) => (x.text = e.target.value))} />
                </label>
                <Select
                  label={`Κατάσταση: ${r.text}`}
                  value={r.status}
                  options={RISK_STATUS}
                  onChange={(v) => edit(r.id, (x) => (x.status = v))}
                />
                <button
                  type="button"
                  className="danger"
                  aria-label={`Διαγραφή: ${r.text}`}
                  onClick={() => update((d) => (d.risks = d.risks.filter((x) => x.id !== r.id)))}
                >
                  ✕
                </button>
              </div>
              <label>
                Αντιμετώπιση
                <input
                  value={r.mitigation}
                  onChange={(e) => edit(r.id, (x) => (x.mitigation = e.target.value))}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

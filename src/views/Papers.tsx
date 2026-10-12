import { useState } from 'react'
import type { FormEvent } from 'react'
import { newId, useStore } from '../store'
import { PAPER_STATUS } from '../labels'
import { EmptyState, Select } from '../components/ui'
import type { PaperStatus } from '../types'
import { Icon } from '../components/icons'

export default function Papers() {
  const { data, update } = useStore()
  const [filter, setFilter] = useState<PaperStatus | 'all'>('all')
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [year, setYear] = useState('')

  const rows = data.papers.filter((p) => filter === 'all' || p.status === filter)

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    update((d) =>
      d.papers.push({
        id: newId(),
        title: title.trim(),
        authors: authors.trim(),
        year: Number(year) || new Date().getFullYear(),
        status: 'to_read',
        notes: '',
      }),
    )
    setTitle('')
    setAuthors('')
    setYear('')
  }

  return (
    <>
      <div className="page-head">
        <h1>Papers</h1>
      </div>
      <form className="row" onSubmit={add}>
        <label className="grow">
          Τίτλος <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="grow">
          Συγγραφείς <input value={authors} onChange={(e) => setAuthors(e.target.value)} />
        </label>
        <label>
          Έτος{' '}
          <input
            type="number"
            min={1900}
            max={2100}
            className="narrow"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>

      <div className="row">
        <label>
          Φίλτρο κατάστασης{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value as PaperStatus | 'all')}>
            <option value="all">Όλα ({data.papers.length})</option>
            {(Object.keys(PAPER_STATUS) as PaperStatus[]).map((s) => (
              <option key={s} value={s}>
                {PAPER_STATUS[s]} ({data.papers.filter((p) => p.status === s).length})
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="book" title="Δεν υπάρχουν papers">Προσθέστε το πρώτο από τη φόρμα πάνω.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Τίτλος</th>
                <th scope="col">Συγγραφείς</th>
                <th scope="col">Έτος</th>
                <th scope="col">Κατάσταση</th>
                <th scope="col">Σημειώσεις</th>
                <th scope="col">
                  <span className="sr-only">Ενέργειες</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.authors}</td>
                  <td>{p.year}</td>
                  <td>
                    <Select
                      label={`Κατάσταση: ${p.title}`}
                      value={p.status}
                      options={PAPER_STATUS}
                      onChange={(v) =>
                        update((d) => {
                          const x = d.papers.find((q) => q.id === p.id)
                          if (x) x.status = v
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Σημειώσεις: ${p.title}`}
                      value={p.notes}
                      onChange={(e) =>
                        update((d) => {
                          const x = d.papers.find((q) => q.id === p.id)
                          if (x) x.notes = e.target.value
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="danger"
                      aria-label={`Διαγραφή: ${p.title}`}
                      onClick={() => update((d) => (d.papers = d.papers.filter((q) => q.id !== p.id)))}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

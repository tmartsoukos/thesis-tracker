import { useState } from 'react'
import type { FormEvent } from 'react'
import { newId, useStore } from '../store'
import { CHAPTER_STATUS } from '../labels'
import { NumberInput, ProgressBar, Select } from '../components/ui'
import type { Chapter } from '../types'

export default function Writing() {
  const { data, update } = useStore()
  const [title, setTitle] = useState('')

  const edit = (id: string, fn: (c: Chapter) => void) =>
    update((d) => {
      const c = d.chapters.find((x) => x.id === id)
      if (c) fn(c)
    })

  const totalCurrent = data.chapters.reduce((s, c) => s + c.currentWords, 0)
  const totalTarget = data.chapters.reduce((s, c) => s + c.targetWords, 0)
  const totalPct = totalTarget === 0 ? 0 : (totalCurrent / totalTarget) * 100
  const nf = new Intl.NumberFormat('el-GR')

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    update((d) =>
      d.chapters.push({ id: newId(), title: title.trim(), targetWords: 1000, currentWords: 0, status: 'todo' }),
    )
    setTitle('')
  }

  return (
    <>
      <h1>Γραφή</h1>
      <section className="card" aria-labelledby="h-total">
        <h2 id="h-total">Σύνολο</h2>
        <p className="big">
          {nf.format(totalCurrent)} <span className="unit">/ {nf.format(totalTarget)} λέξεις</span>
        </p>
        <ProgressBar value={totalPct} label="Συνολική πρόοδος γραφής" />
      </section>

      <ul className="chapters">
        {data.chapters.map((c) => {
          const pct = c.targetWords === 0 ? 0 : (c.currentWords / c.targetWords) * 100
          return (
            <li key={c.id} className="card">
              <div className="row">
                <strong className="grow">{c.title}</strong>
                <Select
                  label={`Κατάσταση: ${c.title}`}
                  value={c.status}
                  options={CHAPTER_STATUS}
                  onChange={(v) => edit(c.id, (x) => (x.status = v))}
                />
                <button
                  type="button"
                  className="danger"
                  aria-label={`Διαγραφή: ${c.title}`}
                  onClick={() => update((d) => (d.chapters = d.chapters.filter((x) => x.id !== c.id)))}
                >
                  ✕
                </button>
              </div>
              <ProgressBar value={pct} label={`Πρόοδος: ${c.title}`} />
              <div className="row">
                <label>
                  Τρέχουσες λέξεις{' '}
                  <NumberInput
                    label={`Τρέχουσες λέξεις: ${c.title}`}
                    value={c.currentWords}
                    onChange={(n) => edit(c.id, (x) => (x.currentWords = n))}
                  />
                </label>
                <label>
                  Στόχος{' '}
                  <NumberInput
                    label={`Στόχος λέξεων: ${c.title}`}
                    value={c.targetWords}
                    onChange={(n) => edit(c.id, (x) => (x.targetWords = n))}
                  />
                </label>
                <span className="muted">{Math.round(pct)}%</span>
              </div>
            </li>
          )
        })}
      </ul>

      <form className="row" onSubmit={add}>
        <label className="grow">
          Νέο κεφάλαιο <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>
    </>
  )
}

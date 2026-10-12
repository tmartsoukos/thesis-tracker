import { useState } from 'react'
import type { FormEvent } from 'react'
import { newId, useStore } from '../store'
import { formatDate, todayAthens } from '../lib/dates'

const isMacroF1 = (metric: string) => metric.trim().toLowerCase().replace(/[\s_]/g, '-') === 'macro-f1'

export default function Experiments() {
  const { data, update } = useStore()
  const [f, setF] = useState({
    name: '',
    model: '',
    dataset: '',
    metric: 'Macro-F1',
    value: '',
    date: todayAthens(),
  })
  const set = (k: keyof typeof f, v: string) => setF((prev) => ({ ...prev, [k]: v }))

  // Best Macro-F1 per model.
  const best = new Map<string, number>()
  for (const x of data.experiments) {
    if (isMacroF1(x.metric)) best.set(x.model, Math.max(best.get(x.model) ?? -Infinity, x.value))
  }
  const bars = [...best.entries()].sort((a, b) => b[1] - a[1])
  const top = Math.max(1, ...bars.map(([, v]) => v))

  const add = (e: FormEvent) => {
    e.preventDefault()
    const value = Number(f.value.replace(',', '.'))
    if (!f.name.trim() || !f.model.trim() || f.value.trim() === '' || Number.isNaN(value)) return
    update((d) =>
      d.experiments.push({
        id: newId(),
        name: f.name.trim(),
        model: f.model.trim(),
        dataset: f.dataset.trim(),
        metric: f.metric.trim(),
        value,
        date: f.date,
      }),
    )
    setF((prev) => ({ ...prev, name: '', value: '' }))
  }

  return (
    <>
      <h1>Πειράματα</h1>

      <section aria-labelledby="h-chart">
        <h2 id="h-chart">Macro-F1 ανά μοντέλο</h2>
        {bars.length === 0 ? (
          <p className="muted">Προσθέστε αποτελέσματα με μετρική «Macro-F1» για να εμφανιστεί γράφημα.</p>
        ) : (
          <ul className="chart" aria-label="Γράφημα Macro-F1 ανά μοντέλο">
            {bars.map(([model, v]) => (
              <li key={model}>
                <span className="chart-label">{model}</span>
                <span className="chart-track">
                  <span className="chart-bar" style={{ width: `${(v / top) * 100}%` }} />
                </span>
                <span className="chart-value">{v.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2>Νέο αποτέλεσμα</h2>
      <form className="row" onSubmit={add}>
        <label>
          Όνομα <input required value={f.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <label>
          Μοντέλο <input required value={f.model} onChange={(e) => set('model', e.target.value)} />
        </label>
        <label>
          Dataset <input value={f.dataset} onChange={(e) => set('dataset', e.target.value)} />
        </label>
        <label>
          Μετρική <input required value={f.metric} onChange={(e) => set('metric', e.target.value)} />
        </label>
        <label>
          Τιμή{' '}
          <input
            required
            inputMode="decimal"
            className="narrow"
            value={f.value}
            onChange={(e) => set('value', e.target.value)}
          />
        </label>
        <label>
          Ημερομηνία{' '}
          <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />
        </label>
        <button type="submit" className="primary">
          Προσθήκη
        </button>
      </form>

      {data.experiments.length === 0 ? (
        <p className="muted">Δεν υπάρχουν αποτελέσματα.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Όνομα</th>
                <th scope="col">Μοντέλο</th>
                <th scope="col">Dataset</th>
                <th scope="col">Μετρική</th>
                <th scope="col">Τιμή</th>
                <th scope="col">Ημερομηνία</th>
                <th scope="col">
                  <span className="sr-only">Ενέργειες</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.experiments.map((x) => (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td>{x.model}</td>
                  <td>{x.dataset}</td>
                  <td>{x.metric}</td>
                  <td>{x.value}</td>
                  <td>{formatDate(x.date)}</td>
                  <td>
                    <button
                      type="button"
                      className="danger"
                      aria-label={`Διαγραφή: ${x.name}`}
                      onClick={() => update((d) => (d.experiments = d.experiments.filter((q) => q.id !== x.id)))}
                    >
                      ✕
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

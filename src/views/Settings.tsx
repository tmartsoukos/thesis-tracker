import { useRef, useState } from 'react'
import { parseAppData, useStore } from '../store'
import type { Theme } from '../store'
import { Icon } from '../components/icons'
import { formatDate, isValidYmd, todayAthens } from '../lib/dates'

export default function Settings() {
  const { data, update, replaceAll, reset, theme, setTheme } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thesis-tracker-${todayAthens()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Το αρχείο εξήχθη.')
  }

  const importJson = async (file: File) => {
    try {
      const parsed = parseAppData(JSON.parse(await file.text()))
      if (!parsed) {
        setMessage('Μη έγκυρο αρχείο: η δομή δεν αναγνωρίζεται.')
        return
      }
      if (window.confirm('Η εισαγωγή αντικαθιστά όλα τα τρέχοντα δεδομένα. Συνέχεια;')) {
        replaceAll(parsed)
        setMessage('Η εισαγωγή ολοκληρώθηκε.')
      }
    } catch {
      setMessage('Μη έγκυρο αρχείο JSON.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Ignore partial/empty values while the date input is being edited.
  const setDate = (apply: (ymd: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidYmd(e.target.value)) apply(e.target.value)
  }

  return (
    <>
      <div className="page-head">
        <h1>Ρυθμίσεις</h1>
      </div>

      <section className="card" aria-labelledby="h-deadline">
        <h2 id="h-deadline">Τελική προθεσμία</h2>
        <label>
          Ημερομηνία παράδοσης{' '}
          <input
            type="date"
            value={data.deadline}
            onChange={setDate((v) => update((d) => (d.deadline = v)))}
          />
        </label>
        <p className="muted small">Εμφάνιση: {formatDate(data.deadline)}</p>
      </section>

      <section className="card" aria-labelledby="h-phases">
        <h2 id="h-phases">Ημερομηνίες φάσεων</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Φάση</th>
                <th scope="col">Έναρξη</th>
                <th scope="col">Λήξη</th>
              </tr>
            </thead>
            <tbody>
              {data.phases.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.title}</th>
                  <td>
                    <input
                      type="date"
                      aria-label={`Έναρξη: ${p.title}`}
                      value={p.startDate}
                      onChange={setDate((v) =>
                        update((d) => {
                          const x = d.phases.find((q) => q.id === p.id)
                          if (x) x.startDate = v
                        }),
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      aria-label={`Λήξη: ${p.title}`}
                      value={p.endDate}
                      onChange={setDate((v) =>
                        update((d) => {
                          const x = d.phases.find((q) => q.id === p.id)
                          if (x) x.endDate = v
                        }),
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.phases.some((p) => p.endDate < p.startDate) && (
          <p role="alert" className="overdue">
            Προσοχή: υπάρχει φάση με λήξη πριν την έναρξη.
          </p>
        )}
      </section>

      <section className="card" aria-labelledby="h-theme">
        <h2 id="h-theme">Εμφάνιση</h2>
        <label>
          Θέμα{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="auto">Αυτόματο (σύστημα)</option>
            <option value="light">Φωτεινό</option>
            <option value="dark">Σκοτεινό</option>
          </select>
        </label>
      </section>

      <section className="card" aria-labelledby="h-backup">
        <h2 id="h-backup">Αντίγραφο ασφαλείας</h2>
        <p className="muted">Τα δεδομένα αποθηκεύονται μόνο σε αυτόν τον browser. Κάντε τακτικά export.</p>
        <div className="row">
          <button type="button" className="primary" onClick={exportJson}>
            <Icon name="download" size={18} />
            Export JSON
          </button>
          <label className="file">
            <Icon name="upload" size={18} />
            Import JSON
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (window.confirm('Επαναφορά στα αρχικά δεδομένα; Όλες οι αλλαγές θα χαθούν.')) {
                reset()
                setMessage('Έγινε επαναφορά στα αρχικά δεδομένα.')
              }
            }}
          >
            Επαναφορά αρχικών δεδομένων
          </button>
        </div>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </section>
    </>
  )
}

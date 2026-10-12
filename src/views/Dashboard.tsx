import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { addDays, diffDays, formatDate, todayAthens, weekRange } from '../lib/dates'
import {
  countTasks,
  daysLeft,
  expectedProgress,
  overallProgress,
  trackStatus,
} from '../lib/progress'
import { TRACK_LABEL } from '../labels'
import { Badge, EmptyState, ProgressRing } from '../components/ui'

export default function Dashboard() {
  const { data, update } = useStore()
  const today = todayAthens()
  const left = daysLeft(data.deadline, today)
  const actual = overallProgress(data.phases)
  const expected = expectedProgress(data.phases, today)
  const diff = actual - expected
  const track = trackStatus(diff)
  const { done, total } = countTasks(data.phases)
  const week = weekRange(today)

  // This week: due tasks, active phases, open action items up to the end of the week.
  const weekTasks = data.phases.flatMap((p) =>
    p.tasks
      .filter((t) => !t.done && t.dueDate && t.dueDate <= week.end)
      .map((t) => ({ phase: p, task: t })),
  )
  const activePhases = data.phases.filter(
    (p) => p.status !== 'done' && p.startDate <= week.end && p.endDate >= week.start,
  )
  const weekActions = data.meetings
    .filter((m) => m.date <= week.end)
    .flatMap((m) => m.actionItems.filter((a) => !a.done).map((a) => ({ meeting: m, item: a })))

  const nextMeeting = [...data.meetings]
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  // Upcoming deadlines: phase end dates and task due dates in the future, nearest first.
  const deadlines = [
    ...data.phases
      .filter((p) => p.status !== 'done' && p.endDate >= today)
      .map((p) => ({ key: `p-${p.id}`, date: p.endDate, text: p.title, to: `/phase/${p.id}` })),
    ...data.phases.flatMap((p) =>
      p.tasks
        .filter((t) => !t.done && t.dueDate && t.dueDate >= today)
        .map((t) => ({ key: `t-${t.id}`, date: t.dueDate!, text: t.title, to: `/phase/${p.id}` })),
    ),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  const sign = diff > 0 ? '+' : ''
  const weekEmpty = activePhases.length === 0 && weekTasks.length === 0 && weekActions.length === 0

  return (
    <>
      <div className="page-head">
        <h1>Αρχική</h1>
        <p className="muted">Σήμερα {formatDate(today)}</p>
      </div>

      <div className="hero-grid">
        <section className="card hero-count" aria-labelledby="h-countdown">
          <h2 id="h-countdown">Αντίστροφη μέτρηση</h2>
          <p className="big">
            {left >= 0 ? left : 0}
            <span className="unit"> {left === 1 ? 'ημέρα' : 'ημέρες'}</span>
          </p>
          <p>
            {left >= 0
              ? `έως την παράδοση (${formatDate(data.deadline)})`
              : `Η προθεσμία (${formatDate(data.deadline)}) έχει περάσει.`}
          </p>
        </section>

        <section className="card hero-progress" aria-labelledby="h-progress">
          <ProgressRing value={actual} label="Συνολική πρόοδος">
            <span className="ring-num">{Math.round(actual)}%</span>
          </ProgressRing>
          <div>
            <h2 id="h-progress">Συνολική πρόοδος</h2>
            <p>
              <Badge kind={track}>{TRACK_LABEL[track]}</Badge>
            </p>
            <p className="muted">
              {done} από {total} tasks
            </p>
            <p className="muted small">
              {sign}
              {diff.toFixed(1)}% σε σχέση με το αναμενόμενο ({expected.toFixed(1)}%)
            </p>
          </div>
        </section>
      </div>

      <div className="dash-grid">
        <section className="card dash-week" aria-labelledby="h-week">
          <h2 id="h-week">
            Αυτή την εβδομάδα{' '}
            <span className="muted small">
              {formatDate(week.start)} – {formatDate(week.end)}
            </span>
          </h2>
          {weekEmpty && <EmptyState icon="calendar" title="Τίποτα προγραμματισμένο" />}
          {activePhases.length > 0 && (
            <>
              <h3>Ενεργές φάσεις</h3>
              <ul className="list">
                {activePhases.map((p) => (
                  <li key={p.id}>
                    <Link to={`/phase/${p.id}`}>{p.title}</Link>{' '}
                    <span className="muted small">έως {formatDate(p.endDate)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {weekTasks.length > 0 && (
            <>
              <h3>Tasks με προθεσμία</h3>
              <ul className="list">
                {weekTasks.map(({ phase, task }) => (
                  <li key={task.id}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          update((d) => {
                            const t = d.phases
                              .find((p) => p.id === phase.id)
                              ?.tasks.find((x) => x.id === task.id)
                            if (t) t.done = !t.done
                          })
                        }
                      />
                      <span>{task.title}</span>
                    </label>{' '}
                    <span className={task.dueDate! < today ? 'overdue small' : 'muted small'}>
                      {formatDate(task.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {weekActions.length > 0 && (
            <>
              <h3>Action items από συναντήσεις</h3>
              <ul className="list">
                {weekActions.map(({ meeting, item }) => (
                  <li key={item.id}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          update((d) => {
                            const a = d.meetings
                              .find((m) => m.id === meeting.id)
                              ?.actionItems.find((x) => x.id === item.id)
                            if (a) a.done = !a.done
                          })
                        }
                      />
                      <span>{item.text}</span>
                    </label>{' '}
                    <span className="muted small">{formatDate(meeting.date)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="h-meeting">
          <h2 id="h-meeting">Επόμενη συνάντηση</h2>
          {nextMeeting ? (
            <>
              <p className="strong">{nextMeeting.title}</p>
              <p className="muted">
                {formatDate(nextMeeting.date)} · σε {diffDays(today, nextMeeting.date)} ημέρες
              </p>
              <Link to="/meetings">Όλες οι συναντήσεις</Link>
            </>
          ) : (
            <EmptyState icon="calendar" title="Καμία προγραμματισμένη συνάντηση" />
          )}
        </section>

        <section className="card" aria-labelledby="h-deadlines">
          <h2 id="h-deadlines">Επερχόμενες προθεσμίες</h2>
          {deadlines.length === 0 ? (
            <EmptyState icon="calendar" title="Καμία προθεσμία" />
          ) : (
            <ul className="list deadlines">
              {deadlines.map((d) => (
                <li key={d.key}>
                  <span className={d.date <= addDays(today, 7) ? 'date-chip soon' : 'date-chip'}>
                    {formatDate(d.date)}
                  </span>
                  <Link to={d.to}>{d.text}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

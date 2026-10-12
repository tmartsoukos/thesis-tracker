import type { ReactNode } from 'react'

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className="bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Badge({ kind, children }: { kind: string; children: ReactNode }) {
  return <span className={`badge badge-${kind}`}>{children}</span>
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Record<T, string>
  onChange: (v: T) => void
  label: string
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {(Object.keys(options) as T[]).map((k) => (
        <option key={k} value={k}>
          {options[k]}
        </option>
      ))}
    </select>
  )
}

/** Controlled number input; an empty field counts as 0. */
export function NumberInput({
  value,
  onChange,
  label,
  min = 0,
  step = 1,
}: {
  value: number
  onChange: (n: number) => void
  label: string
  min?: number
  step?: number | 'any'
}) {
  return (
    <input
      type="number"
      aria-label={label}
      min={min}
      step={step}
      value={value}
      onChange={(e) => {
        const n = e.target.valueAsNumber
        onChange(Number.isNaN(n) ? 0 : n)
      }}
    />
  )
}

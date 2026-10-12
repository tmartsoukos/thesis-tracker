import type { ReactNode } from 'react'
import { Icon } from './icons'
import type { IconName } from './icons'

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

/** Circular progress indicator with content (e.g. the percentage) in the middle. */
export function ProgressRing({
  value,
  label,
  children,
  size = 132,
  stroke = 12,
}: {
  value: number
  label: string
  children?: ReactNode
  size?: number
  stroke?: number
}) {
  const pct = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div
      className="ring"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ ['--c' as string]: c }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  children,
}: {
  icon?: IconName
  title: string
  children?: ReactNode
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <p className="empty-title">{title}</p>
      {children && <p className="muted small">{children}</p>}
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

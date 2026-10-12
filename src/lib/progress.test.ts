import { describe, expect, it } from 'vitest'
import type { Phase, Task } from '../types'
import { addDays, diffDays, formatDate, todayAthens, weekRange } from './dates'
import {
  daysLeft,
  elapsedFraction,
  expectedProgress,
  overallProgress,
  trackStatus,
} from './progress'

function tasks(done: number, total: number): Task[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `t${i}`,
    title: `t${i}`,
    done: i < done,
  }))
}

function phase(start: string, end: string, done: number, total: number): Phase {
  return {
    id: `${start}-${end}`,
    title: 'p',
    startDate: start,
    endDate: end,
    status: 'todo',
    tasks: tasks(done, total),
    notes: '',
  }
}

describe('overallProgress', () => {
  it('is 0 with no tasks (no division by zero)', () => {
    expect(overallProgress([])).toBe(0)
    expect(overallProgress([phase('2026-10-01', '2026-10-10', 0, 0)])).toBe(0)
  })
  it('weights by number of tasks', () => {
    // 1/2 + 3/6 -> 4/8 = 50%
    expect(overallProgress([phase('2026-10-01', '2026-10-10', 1, 2), phase('2026-10-01', '2026-10-10', 3, 6)])).toBe(50)
    // 2/2 + 0/6 -> 2/8 = 25% (an unweighted phase average would give 50%)
    expect(overallProgress([phase('2026-10-01', '2026-10-10', 2, 2), phase('2026-10-01', '2026-10-10', 0, 6)])).toBe(25)
  })
  it('is 100 when everything is done', () => {
    expect(overallProgress([phase('2026-10-01', '2026-10-10', 4, 4)])).toBe(100)
  })
})

describe('expectedProgress', () => {
  const p = phase('2026-10-11', '2026-10-20', 0, 10)
  it('is 0 before the phase starts', () => {
    expect(expectedProgress([p], '2026-10-10')).toBe(0)
  })
  it('is 100 after the phase ends', () => {
    expect(expectedProgress([p], '2026-10-21')).toBe(100)
  })
  it('is linear while in progress (inclusive days)', () => {
    expect(elapsedFraction(p, '2026-10-15')).toBeCloseTo(0.5)
    expect(expectedProgress([p], '2026-10-15')).toBeCloseTo(50)
  })
  it('mixes finished, running and future phases by task count', () => {
    const done = phase('2026-10-01', '2026-10-05', 0, 2) // finished: 2 tasks fully expected
    const running = phase('2026-10-11', '2026-10-20', 0, 4) // half elapsed: 2 tasks
    const future = phase('2026-11-01', '2026-11-10', 0, 4) // 0
    expect(expectedProgress([done, running, future], '2026-10-15')).toBeCloseTo(40) // 4/10
  })
  it('is 0 with no tasks', () => {
    expect(expectedProgress([], '2026-10-15')).toBe(0)
  })
})

describe('trackStatus', () => {
  it('classifies at the thresholds', () => {
    expect(trackStatus(3)).toBe('on_track')
    expect(trackStatus(-5)).toBe('on_track')
    expect(trackStatus(-5.01)).toBe('slightly_behind')
    expect(trackStatus(-15)).toBe('slightly_behind')
    expect(trackStatus(-15.01)).toBe('behind')
  })
})

describe('dates', () => {
  it('counts days left', () => {
    expect(daysLeft('2027-01-20', '2026-10-12')).toBe(100)
    expect(daysLeft('2027-01-20', '2027-01-20')).toBe(0)
    expect(daysLeft('2027-01-20', '2027-01-21')).toBe(-1)
  })
  it('uses the Athens calendar day around midnight', () => {
    // 22:00 UTC in winter (UTC+2) is already the next day in Athens
    expect(todayAthens(new Date('2026-12-10T22:00:00Z'))).toBe('2026-12-11')
    expect(todayAthens(new Date('2026-12-10T21:59:00Z'))).toBe('2026-12-10')
    // summer time is UTC+3
    expect(todayAthens(new Date('2026-07-10T21:00:00Z'))).toBe('2026-07-11')
    expect(todayAthens(new Date('2026-07-10T20:59:00Z'))).toBe('2026-07-10')
  })
  it('formats dd/mm/yyyy', () => {
    expect(formatDate('2027-01-20')).toBe('20/01/2027')
    expect(formatDate(undefined)).toBe('')
  })
  it('computes Monday-Sunday week ranges', () => {
    expect(weekRange('2026-10-12')).toEqual({ start: '2026-10-12', end: '2026-10-18' }) // Monday
    expect(weekRange('2026-10-18')).toEqual({ start: '2026-10-12', end: '2026-10-18' }) // Sunday
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(diffDays('2026-10-12', '2026-10-13')).toBe(1)
  })
})

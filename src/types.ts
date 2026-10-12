// All dates are stored as "YYYY-MM-DD" strings (Europe/Athens calendar days).

export type PhaseStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type PaperStatus = 'to_read' | 'reading' | 'read'
export type ChapterStatus = 'todo' | 'drafting' | 'done'
export type RiskStatus = 'open' | 'mitigated' | 'closed'

export interface Task {
  id: string
  title: string
  done: boolean
  dueDate?: string
  note?: string
}

export interface Phase {
  id: string
  title: string
  startDate: string
  endDate: string
  status: PhaseStatus
  tasks: Task[]
  notes: string
}

export interface ActionItem {
  id: string
  text: string
  done: boolean
}

export interface Meeting {
  id: string
  title: string
  date: string
  notes: string
  actionItems: ActionItem[]
}

export interface Paper {
  id: string
  title: string
  authors: string
  year: number
  status: PaperStatus
  notes: string
}

export interface Experiment {
  id: string
  name: string
  model: string
  dataset: string
  metric: string
  value: number
  date: string
}

export interface Chapter {
  id: string
  title: string
  targetWords: number
  currentWords: number
  status: ChapterStatus
}

export interface Risk {
  id: string
  text: string
  mitigation: string
  status: RiskStatus
}

export interface AppData {
  version: 1
  deadline: string
  phases: Phase[]
  meetings: Meeting[]
  papers: Paper[]
  experiments: Experiment[]
  chapters: Chapter[]
  risks: Risk[]
}

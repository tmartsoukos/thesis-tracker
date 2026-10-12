// Greek UI labels for enum values.
import type { ChapterStatus, PaperStatus, PhaseStatus, RiskStatus } from './types'
import type { TrackStatus } from './lib/progress'

export const PHASE_STATUS: Record<PhaseStatus, string> = {
  todo: 'Να γίνει',
  in_progress: 'Σε εξέλιξη',
  done: 'Ολοκληρώθηκε',
  blocked: 'Μπλοκαρισμένη',
}

export const PAPER_STATUS: Record<PaperStatus, string> = {
  to_read: 'Προς ανάγνωση',
  reading: 'Διαβάζεται',
  read: 'Διαβάστηκε',
}

export const CHAPTER_STATUS: Record<ChapterStatus, string> = {
  todo: 'Να γραφτεί',
  drafting: 'Σε γραφή',
  done: 'Ολοκληρώθηκε',
}

export const RISK_STATUS: Record<RiskStatus, string> = {
  open: 'Ανοιχτός',
  mitigated: 'Μετριάστηκε',
  closed: 'Έκλεισε',
}

export const TRACK_LABEL: Record<TrackStatus, string> = {
  on_track: 'Εντός στόχων',
  slightly_behind: 'Ελαφρώς πίσω',
  behind: 'Πίσω',
}

import type { AppData, Chapter, Meeting, Phase, PhaseStatus } from './types'

export const DEFAULT_DEADLINE = '2027-01-20'

function phase(
  n: number,
  title: string,
  startDate: string,
  endDate: string,
  tasks: { title: string; dueDate?: string }[],
  status: PhaseStatus = 'todo',
): Phase {
  return {
    id: `p${n}`,
    title,
    startDate,
    endDate,
    status,
    notes: '',
    tasks: tasks.map((t, i) => ({
      id: `p${n}-t${i + 1}`,
      title: t.title,
      done: false,
      dueDate: t.dueDate,
    })),
  }
}

const phases: Phase[] = [
  phase(1, 'Βιβλιογραφία και ερευνητικά ερωτήματα', '2026-10-12', '2026-10-25', [
    { title: 'Πίνακας σύγκρισης 15–20 papers' },
    { title: 'Ορισμός 3 ερευνητικών ερωτημάτων' },
    { title: 'Πρώτο προσχέδιο Related Work' },
  ], 'in_progress'),
  phase(2, 'Ανάλυση ec-darkpattern και baselines', '2026-10-19', '2026-11-08', [
    { title: 'Καθαρισμός και αφαίρεση διπλότυπων' },
    { title: 'GroupKFold ανά page_id' },
    { title: 'Baselines TF-IDF με LR/SVM/RF' },
    { title: 'Ablations (αριθμοί, μήκος)' },
    { title: 'Πίνακας αποτελεσμάτων' },
  ]),
  phase(3, 'Ελληνικό dataset', '2026-10-26', '2026-11-29', [
    { title: 'Οδηγός επισημείωσης' },
    { title: 'Επιλογή e-shops και έλεγχος όρων χρήσης' },
    { title: 'Εξαγωγή κειμένων (Playwright)' },
    { title: 'Πιλοτική επισημείωση 100 κειμένων' },
    { title: 'Πλήρης επισημείωση (~800–1.000)' },
    { title: "Δεύτερος annotator και Cohen's κ" },
  ]),
  phase(4, 'Μοντέλα NLP', '2026-11-23', '2026-12-20', [
    { title: 'GreekBERT' },
    { title: 'XLM-RoBERTa' },
    { title: 'Zero-shot EN→GR' },
    { title: 'Εκπαίδευση σε ελληνικά' },
    { title: 'Ανάλυση λαθών και LIME/SHAP' },
  ]),
  phase(5, 'Ασαφής συμπερασμός', '2026-12-14', '2027-01-03', [
    { title: 'Ορισμός μεταβλητών και συναρτήσεων συμμετοχής' },
    { title: '15–25 κανόνες' },
    { title: 'Υλοποίηση (scikit-fuzzy)' },
    { title: 'Δοκιμή σε παραδείγματα' },
  ]),
  phase(6, 'Μελέτη χρηστών', '2026-12-21', '2027-01-10', [
    { title: 'Έλεγχος έγκρισης δεοντολογίας' },
    { title: 'Ερωτηματολόγιο (40–60 κείμενα, κλίμακα 1–5)' },
    { title: 'Πιλοτικό (3–5 άτομα)' },
    { title: 'Συλλογή απαντήσεων (30–60 άτομα)' },
    { title: 'Ανάλυση (Spearman, MAE, διαστήματα εμπιστοσύνης)' },
  ]),
  phase(7, 'Demo', '2027-01-04', '2027-01-15', [
    { title: 'FastAPI endpoint που δέχεται κείμενο και επιστρέφει κατηγορία και severity' },
    { title: 'Απλή web σελίδα για δοκιμή' },
    { title: 'Προαιρετικά Chrome extension' },
    { title: 'Μικρό script/βίντεο παρουσίασης' },
  ]),
  phase(8, 'Γραφή', '2026-11-02', '2027-01-18', [
    { title: 'Εισαγωγή' },
    { title: 'Βιβλιογραφία' },
    { title: 'Δεδομένα και μεθοδολογία' },
    { title: 'Πειράματα' },
    { title: 'Fuzzy' },
    { title: 'Μελέτη χρηστών' },
    { title: 'Συζήτηση και περιορισμοί' },
    { title: 'Συμπεράσματα' },
    { title: 'Πρώτο πλήρες κείμενο', dueDate: '2027-01-11' },
    { title: 'Τελικός έλεγχος', dueDate: '2027-01-18' },
  ]),
  phase(9, 'Τελική παράδοση', '2027-01-20', '2027-01-20', [
    { title: 'Υποβολή διπλωματικής', dueDate: '2027-01-20' },
  ]),
]

// Word targets are placeholders (~15.000 total); edit them in the Writing view.
const chapterSeed: [string, number][] = [
  ['Εισαγωγή', 1500],
  ['Βιβλιογραφία', 3000],
  ['Δεδομένα και μεθοδολογία', 2500],
  ['Πειράματα', 2500],
  ['Fuzzy', 1500],
  ['Μελέτη χρηστών', 2000],
  ['Συζήτηση και περιορισμοί', 1500],
  ['Συμπεράσματα', 800],
]

const chapters: Chapter[] = chapterSeed.map(([title, targetWords], i) => ({
  id: `c${i + 1}`,
  title,
  targetWords,
  currentWords: 0,
  status: 'todo',
}))

const meetingSeed: [string, string][] = [
  ['Checkpoint τέλους Νοεμβρίου', '2026-11-30'],
  ['Checkpoint μέσα Δεκεμβρίου', '2026-12-15'],
  ['Checkpoint αρχές Ιανουαρίου (προσχέδιο)', '2027-01-05'],
  ['Checkpoint 11/01 (πρώτο πλήρες κείμενο)', '2027-01-11'],
  ['Checkpoint 18/01 (τελικός έλεγχος)', '2027-01-18'],
]

const meetings: Meeting[] = meetingSeed.map(([title, date], i) => ({
  id: `m${i + 1}`,
  title,
  date,
  notes: '',
  actionItems: [],
}))

export function createSeedData(): AppData {
  // structuredClone keeps the module-level seed immutable across resets
  return structuredClone({
    version: 1 as const,
    deadline: DEFAULT_DEADLINE,
    phases,
    meetings,
    papers: [],
    experiments: [],
    chapters,
    risks: [],
  })
}

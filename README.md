# Thesis Tracker

Small progress-tracking web app for the thesis "Automated Detection and Severity Assessment of
E-Commerce Dark Patterns Utilizing Natural Language Processing and Fuzzy Inference Systems".

- Vite + React + TypeScript, plain CSS, no backend.
- All data lives in the browser's `localStorage` (key `thesis-tracker:v1`).
  Use **Settings → Export JSON** regularly as a backup; **Import JSON** restores it.
- UI is in Greek. Dates are shown as `dd/mm/yyyy` and "today" is computed in `Europe/Athens`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest unit tests (progress and date calculations)
```

## Build

```bash
npm run build      # type-check + static site in dist/
npm run preview    # serve dist/ locally
```

The Vite `base` comes from the `VITE_BASE` environment variable and defaults to `./`
(works from any folder). For a project page, build with the repo name:

```bash
VITE_BASE=/<repo-name>/ npm run build
```

Routing uses `HashRouter`, so no 404 redirect tricks are needed on GitHub Pages.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository whose default branch is `main`.
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`: install, test, build with
   `VITE_BASE=/<repo-name>/`, then publish `dist/`.
4. The site is available at `https://<user>.github.io/<repo-name>/`.

For a user/organisation page (`<user>.github.io` repo), change `VITE_BASE` in the workflow to `/`.

## Change the dates

- **In the app:** Settings → *Τελική προθεσμία* for the final deadline and
  *Ημερομηνίες φάσεων* for each phase's start and end. Changes apply immediately to the dashboard and timeline.
- **Seed data:** edit `src/seed.ts` (`DEFAULT_DEADLINE` and the `phase(...)` calls), then use
  Settings → *Επαναφορά αρχικών δεδομένων*. Note that reset discards your current progress, so export first.

## How progress is calculated

- **Overall progress** = done tasks / all tasks (every task has the same weight).
- **Expected progress** by today: tasks of phases whose end date has passed count fully;
  tasks of running phases count by the linear share of elapsed days; future phases count 0.
- **Difference** = overall − expected, in percentage points:
  `≥ −5` on track, `−5 … −15` slightly behind, `< −15` behind
  (thresholds in `src/lib/progress.ts`).
- **This week** card (Monday–Sunday): open tasks with a due date up to the end of the week
  (overdue ones included), phases active this week, and open meeting action items from meetings
  dated up to the end of the week.

## Project layout

```
src/lib/dates.ts       date helpers (Athens timezone, dd/mm/yyyy, week range)
src/lib/progress.ts    pure progress / on-track calculations (unit tested)
src/seed.ts            initial phases, tasks, chapters, meeting checkpoints
src/store.tsx          React context + localStorage persistence, import validation
src/views/             one file per page
```

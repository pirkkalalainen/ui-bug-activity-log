const TOTAL_LINES = 5000;
const DAY_COUNT = 14;
const ENTRIES_PER_DAY = Math.ceil(TOTAL_LINES / DAY_COUNT);
const BASE_DATE = new Date(2026, 8, 5); // Sat, Sep 5 2026 — deploy history start

const STEPS = [
  ['Pulling image layer', 'info'], ['Resolving dependencies', 'info'],
  ['Running migration', 'info'], ['Compiling assets', 'info'],
  ['Uploading build artifact', 'info'], ['Cache stale, rebuilding', 'warn'],
  ['Restarting worker', 'info'], ['Health check passed', 'warn'],
  ['Retrying flaky connection', 'warn'], ['Syncing config', 'info'],
];

function dateLabel(dayIndex) {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function buildLogEntries(n) {
  const start = Date.now() - n * 250;
  const entries = [];
  for (let i = 0; i < n; i++) {
    const [step, cycleLevel] = STEPS[i % STEPS.length];
    const isLast = i === n - 1;
    const level = (!isLast && i > 0 && i % 41 === 0) ? 'error' : cycleLevel;
    const text = isLast
      ? `${step} — deploy complete`
      : `${level === 'error' ? 'Transient network error, retrying' : step} (${i + 1}/${n})`;
    const dayIndex = Math.floor(i / ENTRIES_PER_DAY);
    entries.push({
      ts: new Date(start + i * 250).toLocaleTimeString(),
      level: isLast ? 'info' : level,
      text,
      dayIndex,
      dateLabel: dateLabel(dayIndex),
    });
  }
  return entries;
}

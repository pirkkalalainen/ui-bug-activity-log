const ROW_HEIGHT = 56;

const rawEntries = buildLogEntries(5000);

// Interleave one divider item per day boundary into the same fixed-height index
// space the virtualizer already uses, so no variable-row-height logic is needed.
const items = [];
let lastDay = -1;
for (const entry of rawEntries) {
  if (entry.dayIndex !== lastDay) {
    items.push({ type: 'divider', dateLabel: entry.dateLabel, dayIndex: entry.dayIndex });
    lastDay = entry.dayIndex;
  }
  items.push({ type: 'row', ...entry });
}

document.getElementById('entry-count').textContent = `${items.length.toLocaleString()} entries`;

function renderRow(i, existingNode) {
  const entry = items[i];
  const node = existingNode || document.createElement('div');
  if (entry.type === 'divider') {
    node.className = 'day-divider';
    node.textContent = entry.dateLabel;
  } else {
    // Cache which row is "latest" per pooled node — avoids recomputing the check
    // on every single scroll event for nodes that were already resolved.
    if (node._isLatest === undefined) {
      node._isLatest = i === items.length - 1;
    }
    const badge = node._isLatest ? ' <span class="latest-badge">LATEST</span>' : '';
    node.className = `log-row level-${entry.level}${node._isLatest ? ' is-latest' : ''}`;
    node.innerHTML = `<span class="ts">${entry.ts}</span><span>${entry.text}${badge}</span>`;
  }
  return node;
}

const list = createVirtualList({
  viewport: document.getElementById('log-viewport'),
  spacer: document.getElementById('log-spacer'),
  window: document.getElementById('log-window'),
  rowHeight: ROW_HEIGHT,
  itemCount: items.length,
  renderRow,
});

document.getElementById('jump-latest').addEventListener('click', () => {
  list.scrollToBottom();
});

// Pinned header lives outside #log-window on purpose — #log-window is repositioned
// via CSS transform as the list scrolls, so anything inside it (including a
// position:sticky child) gets dragged along by that transform and stops being
// visually pinned. Kept as a sibling of #log-window inside #log-viewport instead,
// and its text is resynced on every scroll event, not just once at mount.
const viewport = document.getElementById('log-viewport');
const pinnedHeader = document.getElementById('pinned-header');

function updatePinnedHeader() {
  const startIndex = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT));
  const entry = items[Math.min(startIndex, items.length - 1)];
  pinnedHeader.textContent = entry.dateLabel;
}

viewport.addEventListener('scroll', updatePinnedHeader);
updatePinnedHeader();

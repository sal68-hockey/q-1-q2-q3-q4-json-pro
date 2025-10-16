const scheduleFiles = [
  "MySchedule.json",
  "FriendA.json",
  "FriendB.json",
  "FriendC.json"
];

// DOM references
const status = document.getElementById('status');
const container = document.getElementById('scheduleContainer');
const header = document.getElementById('pageHeader');
const friendSelect = document.getElementById('friendSelect');

// filter/sort controls
const quarterSelect = document.getElementById('quarterSelect');
const sortSelect = document.getElementById('sortSelect');
const animateSwitch = document.getElementById('animateSwitch');
const applyFilterBtn = document.getElementById('applyFilter');

let currentIndex = 0; // index into scheduleFiles
let currentData = []; // currently loaded JSON array

// Utility: show status message (info / error)
function showStatus(html, isError=false) {
  status.innerHTML = html;
  if(isError) status.querySelectorAll('.alert').forEach(a => a.classList.add('alert-danger'));
}

// Async function to fetch a file by name (uses template literal in path)
// Comments: fileName param is used in the template literal for fetch.
async function loadSchedule(fileName) {
  // Show loading message
  status.innerHTML = `<div class="alert alert-info">Loading schedule from <code>${fileName}</code>...</div>`;
  container.innerHTML = "";

  try {
    // fetch path uses template literal as required: fetch(`./json/${fileName}`)
    const response = await fetch(`./json/${fileName}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    // Ensure data is an array
    if (!Array.isArray(data)) {
      throw new Error('JSON format invalid: expected an array of class objects.');
    }

    // Save and render (default sorted by period)
    currentData = data;
    renderSchedule(currentData);
    status.innerHTML = `<div class="alert alert-success">Loaded <strong>${fileName}</strong>.</div>`;
  } catch (err) {
    // Friendly error message shown to user
    showStatus(`<div class="alert alert-warning">Could not load <code>${fileName}</code>. Error: ${err.message}</div>`, true);
  }
}

// Rendering: accepts an array of class objects, applies filter/sort, and builds cards
function renderSchedule(data) {
  container.innerHTML = "";

  // Apply quarter filter
  const quarter = quarterSelect ? quarterSelect.value : 'all';
  let filtered = data.filter(item => {
    if (!item.quarters || quarter === 'all') return true;
    // Some JSON uses string or array; unify:
    if (Array.isArray(item.quarters)) {
      return item.quarters.includes(quarter);
    } else if (typeof item.quarters === 'string') {
      return item.quarters === quarter;
    }
    return true;
  });

  // Sorting
  const sortMode = sortSelect ? sortSelect.value : 'period-asc';
  if (sortMode === 'period-asc') {
    filtered.sort((a,b) => Number(a.period) - Number(b.period));
  } else if (sortMode === 'period-desc') {
    filtered.sort((a,b) => Number(b.period) - Number(a.period));
  } else if (sortMode === 'alpha-asc') {
    filtered.sort((a,b) => a.className.localeCompare(b.className));
  } else if (sortMode === 'alpha-desc') {
    filtered.sort((a,b) => b.className.localeCompare(a.className));
  }

  // Build cards one at a time using insertAdjacentHTML('beforeend', html)
  filtered.forEach((cls, idx) => {
    const html = `
      <article class="col">
        <div class="card card-schedule h-100">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(cls.className)}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Period: ${escapeHtml(cls.period)}</h6>
            <p class="card-text mb-1"><strong>Teacher:</strong> ${escapeHtml(cls.teacher)}</p>
            <p class="card-text mb-1"><strong>Room:</strong> ${escapeHtml(cls.roomNumber)}</p>
            <p class="card-text"><strong>Subject:</strong> ${escapeHtml(cls.subjectArea)}</p>
            <p class="card-text small text-muted">Quarters: ${Array.isArray(cls.quarters) ? cls.quarters.join(', ') : (cls.quarters || 'N/A')}</p>
          </div>
        </div>
      </article>
    `;
    container.insertAdjacentHTML('beforeend', html);

    // optional animate
    if (animateSwitch && animateSwitch.checked) {
      // add animation class to the newly inserted card
      const cards = container.querySelectorAll('.card-schedule');
      const card = cards[cards.length - 1];
      // small timeout so transition can take effect
      setTimeout(() => card.classList.add('animate-in'), 20);
      setTimeout(() => card.classList.remove('animate-in'), 900);
    }
  });

  // If nothing after filtering, show message
  if (filtered.length === 0) {
    container.insertAdjacentHTML('beforeend', `
      <div class="col-12">
        <div class="alert alert-secondary">No classes match the selected quarter/filter.</div>
      </div>
    `);
  }
}

/* --- Event-driven switching (no simple button clicks) --- */

// Keydown switching: 1 → scheduleFiles[0], 2 → [1], etc.
window.addEventListener('keydown', (e) => {
  // Accept numeric keys 1..4 (also Numpad 1..4)
  const map = { '1':0, '2':1, '3':2, '4':3 };
  if (map.hasOwnProperty(e.key)) {
    currentIndex = map[e.key];
    friendSelect.value = scheduleFiles[currentIndex]; // keep select in sync
    loadSchedule(scheduleFiles[currentIndex]);
  }
});

// Double-click header cycles schedules
header.addEventListener('dblclick', () => {
  currentIndex = (currentIndex + 1) % scheduleFiles.length;
  friendSelect.value = scheduleFiles[currentIndex];
  loadSchedule(scheduleFiles[currentIndex]);
});

// Select change (another non-button event) also loads schedule
friendSelect.addEventListener('change', (e) => {
  const fname = e.target.value;
  currentIndex = scheduleFiles.indexOf(fname);
  if (currentIndex === -1) currentIndex = 0;
  loadSchedule(fname);
});

// Apply filter button (in modal) click applies settings and re-renders
applyFilterBtn.addEventListener('click', () => {
  // Re-render using currentData and current filter choices
  if (currentData && currentData.length) {
    renderSchedule(currentData);
  }
});

/* Helper to escape HTML inserted into cards to avoid injection issues */
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* Auto-load the first schedule on page open */
document.addEventListener('DOMContentLoaded', () => {
  // set select to the first element
  friendSelect.value = scheduleFiles[currentIndex];
  loadSchedule(scheduleFiles[currentIndex]);
});
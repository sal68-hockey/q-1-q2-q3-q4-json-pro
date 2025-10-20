const scheduleFiles = [
  "MySchedule.json",
  "FriendA.json",
  "FriendB.json",
  "FriendC.json"
];

const status = document.getElementById('status');
const container = document.getElementById('scheduleContainer');
const header = document.getElementById('pageHeader');
const friendSelect = document.getElementById('friendSelect');


const quarterSelect = document.getElementById('quarterSelect');
const sortSelect = document.getElementById('sortSelect');
const animateSwitch = document.getElementById('animateSwitch');
const applyFilterBtn = document.getElementById('applyFilter');

let currentIndex = 0;
let currentData = []; 

 // Function to show status messages from deiffernt parts of the code website 
function showStatus(html, isError=false) {
  status.innerHTML = html;
  if(isError) status.querySelectorAll('.alert').forEach(a => a.classList.add('alert-danger'));
}


async function loadSchedule(fileName) {

  status.innerHTML = `<div class="alert alert-info">Loading schedule from <code>${fileName}</code>...</div>`;
  container.innerHTML = "";

  try {
  
    const response = await fetch(`./json/${fileName}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

   
    if (!Array.isArray(data)) {
      throw new Error('JSON format invalid: expected an array of class objects.');
    }

  
    currentData = data;
    renderSchedule(currentData);
    status.innerHTML = `<div class="alert alert-success">Loaded <strong>${fileName}</strong>.</div>`;
  } catch (err) {

    showStatus(`<div class="alert alert-warning">Could not load <code>${fileName}</code>. Error: ${err.message}</div>`, true);
  }
}


function renderSchedule(data) {
  container.innerHTML = "";


  const quarter = quarterSelect ? quarterSelect.value : 'all';
  let filtered = data.filter(item => {
    if (!item.quarters || quarter === 'all') return true;
  
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

  // Render each class and sorts by period ,teacher name, class room number, subject area
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

  // Animation switch on and off 
    if (animateSwitch && animateSwitch.checked) {
   
      const cards = container.querySelectorAll('.card-schedule');
      const card = cards[cards.length - 1];
  
      setTimeout(() => card.classList.add('animate-in'), 20);
      setTimeout(() => card.classList.remove('animate-in'), 900);
    }
  });


  if (filtered.length === 0) {
    container.insertAdjacentHTML('beforeend', `
      <div class="col-12">
        <div class="alert alert-secondary">No classes match the selected quarter/filter.</div>
      </div>
    `);
  }
}

// Event listeners from differnt website parts


window.addEventListener('keydown', (e) => {
 
  const map = { '1':0, '2':1, '3':2, '4':3 };
  if (map.hasOwnProperty(e.key)) {
    currentIndex = map[e.key];
    friendSelect.value = scheduleFiles[currentIndex]; 
    loadSchedule(scheduleFiles[currentIndex]);
  }
});


header.addEventListener('dblclick', () => {
  currentIndex = (currentIndex + 1) % scheduleFiles.length;
  friendSelect.value = scheduleFiles[currentIndex];
  loadSchedule(scheduleFiles[currentIndex]);
});


friendSelect.addEventListener('change', (e) => {
  const fname = e.target.value;
  currentIndex = scheduleFiles.indexOf(fname);
  if (currentIndex === -1) currentIndex = 0;
  loadSchedule(fname);
});


applyFilterBtn.addEventListener('click', () => {

  if (currentData && currentData.length) {
    renderSchedule(currentData);
  }
});


function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
 
  friendSelect.value = scheduleFiles[currentIndex];
  loadSchedule(scheduleFiles[currentIndex]);
});
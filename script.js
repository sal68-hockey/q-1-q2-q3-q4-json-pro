const status = document.getElementById("status");
const container = document.getElementById("scheduleContainer");

const scheduleFiles = [
  { file: "YourNameSchedule.json", name: "My Schedule" },
  { file: "Friend1Schedule.json", name: "Friend 1" },
  { file: "Friend2Schedule.json", name: "Friend 2" },
  { file: "Friend3Schedule.json", name: "Friend 3" },
];

let currentScheduleIndex = 0;
let currentData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSchedule(scheduleFiles[0].file);
});


document.addEventListener("keydown", (e) => {
  if (["1", "2", "3", "4"].includes(e.key)) {
    const index = parseInt(e.key) - 1;
    if (scheduleFiles[index]) {
      currentScheduleIndex = index;
      document.getElementById("mainTitle").textContent = scheduleFiles[index].name;
      loadSchedule(scheduleFiles[index].file);
    }
  }
});


async function loadSchedule(fileName) {
status.innerHTML = `<div class="alert alert-info">Loading schedule...</div>`;
container.innerHTML = "";

  try {
    const response = await fetch(`./json/${fileName}`);
    if (!response.ok) throw new Error("File not found");

    const data = await response.json();
    currentData = data;
    displaySchedule(data);
    status.innerHTML = "";
  } catch (err) {
    status.innerHTML = `<div class="alert alert-danger">Failed to load schedule. ${err.message}</div>`;
  }
}


function displaySchedule(data) {
  container.innerHTML = "";
  data.forEach((cls) => {
    const html = `
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${cls.className}</h5>
            <p><strong>Period:</strong> ${cls.period}</p>
            <p><strong>Teacher:</strong> ${cls.teacher}</p>
            <p><strong>Room:</strong> ${cls.roomNumber}</p>
            <p><strong>Subject:</strong> ${cls.subjectArea}</p>
            <p><strong>Quarters:</strong> ${cls.quarters.join(", ")}</p>
          </div>
        </div>
      </div>`;
    container.insertAdjacentHTML("beforeend", html);
  });
}

document.getElementById("filterBtn").addEventListener("click", () => {
  document.getElementById("filterModal").style.display = "block";
});

function applyFilters() {
  let filtered = [...currentData];
  const sortOption = document.getElementById("sortOption").value;
  const quarter = document.getElementById("quarterOption").value;


  if (quarter) {
    filtered = filtered.filter(cls => cls.quarters.includes(quarter));
  }


  if (sortOption === "alphabetical") {
    filtered.sort((a, b) => a.className.localeCompare(b.className));
  } else if (sortOption === "period") {
    filtered.sort((a, b) => a.period - b.period);
  } else if (sortOption === "teacher") {
    filtered.sort((a, b) => a.teacher.localeCompare(b.teacher));
  } else if (sortOption === "room") {
    filtered.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  } else if (sortOption === "subject") {
    filtered.sort((a, b) => a.subjectArea.localeCompare(b.subjectArea));
  } else if (sortOption === "random") {
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }           
      }
    
    
      displaySchedule(filtered);
    }
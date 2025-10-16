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

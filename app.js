const STORAGE_KEY = 'friend-encounters';

const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const typeInput = document.getElementById('typeInput');
const noteInput = document.getElementById('noteInput');
const addBtn = document.getElementById('addBtn');

const totalEncountersEl = document.getElementById('totalEncounters');
const totalDaysEl = document.getElementById('totalDays');
const historyList = document.getElementById('historyList');

// Fecha por defecto: hoy
dateInput.valueAsDate = new Date();

function getEncounters() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveEncounters(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addEncounter() {
  if (!dateInput.value) return;

  const encounter = {
    id: crypto.randomUUID(),
    date: dateInput.value,
    time: timeInput.value,
    type: typeInput.value,
    note: noteInput.value
  };

  const data = getEncounters();
  data.push(encounter);
  saveEncounters(data);

  noteInput.value = '';
  timeInput.value = '';

  render();
}

function deleteEncounter(id) {
  const data = getEncounters().filter(e => e.id !== id);
  saveEncounters(data);
  render();
}

function renderStats(data) {
  totalEncountersEl.textContent = data.length;

  const uniqueDays = new Set(data.map(e => e.date));
  totalDaysEl.textContent = uniqueDays.size;
}

function renderHistory(data) {
  historyList.innerHTML = '';

  const grouped = {};
  data.forEach(e => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .forEach(date => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.innerHTML = `<strong>${date}</strong>`;

      grouped[date].forEach(e => {
        const enc = document.createElement('div');
        enc.className = 'encounter';

        const text = document.createElement('span');
        text.textContent = `• ${e.type}${e.time ? ' (' + e.time + ')' : ''} ${e.note || ''}`;

        const del = document.createElement('button');
        del.textContent = '🗑️';
        del.onclick = () => {
          if (confirm('¿Borrar este encuentro?')) {
            deleteEncounter(e.id);
          }
        };

        enc.appendChild(text);
        enc.appendChild(del);
        dayDiv.appendChild(enc);
      });

      historyList.appendChild(dayDiv);
    });
}

function render() {
  const data = getEncounters();
  renderStats(data);
  renderHistory(data);
}

addBtn.addEventListener('click', addEncounter);

render();

const STORAGE_KEY = 'friend-encounters';

const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const typeInput = document.getElementById('typeInput');
const noteInput = document.getElementById('noteInput');

const totalEncountersEl = document.getElementById('totalEncounters');
const totalDaysEl = document.getElementById('totalDays');
const historyList = document.getElementById('historyList');
const chartBars = document.getElementById('chartBars');

const formSection = document.getElementById('formSection');
const showFormBtn = document.getElementById('showFormBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const form = document.getElementById('encounterForm');

// Fecha por defecto
dateInput.valueAsDate = new Date();

function getEncounters() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveEncounters(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addEncounter() {
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

  formSection.classList.add('hidden');
  showFormBtn.classList.remove('hidden');

  render();
}

function deleteEncounter(id) {
  const data = getEncounters().filter(e => e.id !== id);
  saveEncounters(data);
  render();
}

function renderStats(data) {
  totalEncountersEl.textContent = data.length;
  totalDaysEl.textContent = new Set(data.map(e => e.date)).size;
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

function renderChart(data) {
  chartBars.innerHTML = '';

  const counts = {};
  data.forEach(e => {
    counts[e.date] = (counts[e.date] || 0) + 1;
  });

  const max = Math.max(...Object.values(counts), 1);

  Object.keys(counts)
    .sort()
    .slice(-7)
    .forEach(date => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${(counts[date] / max) * 100}%`;
      bar.textContent = counts[date];
      chartBars.appendChild(bar);
    });
}

function render() {
  const data = getEncounters();
  renderStats(data);
  renderHistory(data);
  renderChart(data);
}

// EVENTOS
showFormBtn.onclick = () => {
  formSection.classList.remove('hidden');
  showFormBtn.classList.add('hidden');
};

closeFormBtn.onclick = () => {
  formSection.classList.add('hidden');
  showFormBtn.classList.remove('hidden');
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addEncounter();
});

render();

const toggleFormBtn = document.getElementById("toggleFormBtn");
const formSection = document.getElementById("formSection");
const encounterForm = document.getElementById("encounterForm");
const encountersList = document.getElementById("encountersList");
const totalEncountersEl = document.getElementById("totalEncounters");
const totalDaysEl = document.getElementById("totalDays");
const categoryChartCtx = document.getElementById("categoryChart");

let encounters = JSON.parse(localStorage.getItem("encounters")) || [];
let categoryChart;

// Toggle formulario
toggleFormBtn.addEventListener("click", () => {
  formSection.classList.toggle("hidden");

  if (!formSection.classList.contains("hidden")) {
    formSection.scrollIntoView({ behavior: "smooth" });
  }
});

// Guardar encuentro
encounterForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  encounters.push({ date, category, note });
  localStorage.setItem("encounters", JSON.stringify(encounters));

  encounterForm.reset();
  formSection.classList.add("hidden");

  render();
});

// Render general
function render() {
  renderList();
  renderStats();
  renderCategoryChart();
}

// Listado
function renderList() {
  encountersList.innerHTML = "";

  encounters.forEach(e => {
    const div = document.createElement("div");
    div.className = "encounter-item";
    div.innerHTML = `
      <strong>${e.date} — ${e.category}</strong><br/>
      <small>${e.note || ""}</small>
    `;
    encountersList.appendChild(div);
  });
}

// Stats
function renderStats() {
  totalEncountersEl.textContent = encounters.length;

  const uniqueDays = new Set(encounters.map(e => e.date));
  totalDaysEl.textContent = uniqueDays.size;
}

// Gráfico por categoría
function renderCategoryChart() {
  const counts = {};

  encounters.forEach(e => {
    counts[e.category] = (counts[e.category] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(categoryChartCtx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#6c63ff",
          "#ff9800",
          "#4caf50",
          "#03a9f4",
          "#e91e63",
          "#9c27b0"
        ]
      }]
    }
  });
}

render();

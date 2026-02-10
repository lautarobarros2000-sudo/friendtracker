let encuentros = JSON.parse(localStorage.getItem("encuentros")) || [];
let chart;
let categoryChart;

const totalEncuentrosEl = document.getElementById("totalEncuentros");
const diasVistosEl = document.getElementById("diasVistos");
const lista = document.getElementById("listaEncuentros");
const form = document.getElementById("encuentroForm");
const formSection = document.getElementById("formSection");
const toggleFormBtn = document.getElementById("toggleFormBtn");

toggleFormBtn.addEventListener("click", () => {
  formSection.classList.toggle("hidden");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const descripcion = document.getElementById("descripcion").value;
  const categoria = document.getElementById("categoria").value;

  encuentros.push({ fecha, descripcion, categoria });
  localStorage.setItem("encuentros", JSON.stringify(encuentros));

  form.reset();
  formSection.classList.add("hidden");

  render();
});

function borrarEncuentro(index) {
  encuentros.splice(index, 1);
  localStorage.setItem("encuentros", JSON.stringify(encuentros));
  render();
}

function render() {
  totalEncuentrosEl.textContent = encuentros.length;

  const diasUnicos = new Set(encuentros.map(e => e.fecha));
  diasVistosEl.textContent = diasUnicos.size;

  lista.innerHTML = "";
  encuentros.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${e.fecha} – ${e.categoria} – ${e.descripcion}</span>
      <button class="delete" onclick="borrarEncuentro(${i})">✕</button>
    `;
    lista.appendChild(li);
  });

  renderDayChart();
  renderCategoryChart();
}

function renderDayChart() {
  const counts = {};
  encuentros.forEach(e => {
    counts[e.fecha] = (counts[e.fecha] || 0) + 1;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts)
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });
}

function renderCategoryChart() {
  const counts = {};
  encuentros.forEach(e => {
    counts[e.categoria] = (counts[e.categoria] || 0) + 1;
  });

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts)
      }]
    }
  });
}

render();

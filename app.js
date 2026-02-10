let encuentros = JSON.parse(localStorage.getItem("encuentros")) || [];
let chart;

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

  encuentros.push({ fecha, descripcion });

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
  // métricas
  totalEncuentrosEl.textContent = encuentros.length;

  const diasUnicos = new Set(encuentros.map(e => e.fecha));
  diasVistosEl.textContent = diasUnicos.size;

  // lista
  lista.innerHTML = "";
  encuentros.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${e.fecha} – ${e.descripcion}</span>
      <button class="delete" onclick="borrarEncuentro(${i})">✕</button>
    `;
    lista.appendChild(li);
  });

  renderChart();
}

function renderChart() {
  const counts = {};
  encuentros.forEach(e => {
    counts[e.fecha] = (counts[e.fecha] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Encuentros",
        data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

render();

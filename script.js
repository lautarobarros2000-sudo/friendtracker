const toggleFormBtn = document.getElementById("toggleFormBtn");
const formSection = document.getElementById("formSection");
const encounterForm = document.getElementById("encounterForm");
const encountersList = document.getElementById("encountersList");
const totalEncountersEl = document.getElementById("totalEncounters");
const totalDaysEl = document.getElementById("totalDays");

let encounters = JSON.parse(localStorage.getItem("encounters")) || [];

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

  encounters.push({ date, category });
  localStorage.setItem("encounters", JSON.stringify(encounters));

  encounterForm.reset();
  formSection.classList.add("hidden");

  render();
});

// Render
function render() {
  encountersList.innerHTML = "";

  encounters.forEach((e) => {
    const div = document.createElement("div");
    div.className = "encounter-item";
    div.textContent = `${e.date} — ${e.category}`;
    encountersList.appendChild(div);
  });

  totalEncountersEl.textContent = encounters.length;

  const uniqueDays = new Set(encounters.map(e => e.date));
  totalDaysEl.textContent = uniqueDays.size;
}

render();

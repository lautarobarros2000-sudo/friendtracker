// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://jvefzcnujhpqgyedmmxp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWZ6Y251amhwcWd5ZWRtbXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDAwODYsImV4cCI6MjA4NjMxNjA4Nn0.uA4GjxOThyoEbps9W2zcZfhHY6DNCS-QE_SgtpeDB5s";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// DOM ELEMENTS
// ===============================
const toggleFormBtn = document.getElementById("toggleFormBtn");
const formSection = document.getElementById("formSection");
const encounterForm = document.getElementById("encounterForm");

const encountersList = document.getElementById("encountersList");
const totalEncountersEl = document.getElementById("totalEncounters");
const totalDaysEl = document.getElementById("totalDays");

const categoryChartCtx = document.getElementById("categoryChart");

let categoryChart = null;

// ===============================
// TOGGLE FORM VISIBILITY
// ===============================
toggleFormBtn.addEventListener("click", () => {
  formSection.classList.toggle("hidden");

  if (!formSection.classList.contains("hidden")) {
    formSection.scrollIntoView({ behavior: "smooth" });
  }
});

// ===============================
// FORM SUBMIT
// ===============================
encounterForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  if (!date || !category) return;

  const { error } = await supabase.from("encounters").insert([
    {
      date,
      category,
      note
    }
  ]);

  if (error) {
    console.error("Error inserting encounter:", error);
    return;
  }

  encounterForm.reset();
  formSection.classList.add("hidden");

  loadEncounters();
});

// ===============================
// LOAD ENCOUNTERS
// ===============================
async function loadEncounters() {
  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading encounters:", error);
    return;
  }

  renderAll(data);
}

// ===============================
// RENDER ALL
// ===============================
function renderAll(encounters) {
  renderList(encounters);
  renderStats(encounters);
  renderCategoryChart(encounters);
}

// ===============================
// RENDER LIST
// ===============================
function renderList(encounters) {
  encountersList.innerHTML = "";

  encounters.forEach((e) => {
    const div = document.createElement("div");
    div.className = "encounter-item";

    div.innerHTML = `
      <strong>${formatDate(e.date)} — ${e.category}</strong>
      ${e.note ? `<div class="note">${e.note}</div>` : ""}
    `;

    encountersList.appendChild(div);
  });
}

// ===============================
// RENDER STATS
// ===============================
function renderStats(encounters) {
  totalEncountersEl.textContent = encounters.length;

  const uniqueDays = new Set(encounters.map((e) => e.date));
  totalDaysEl.textContent = uniqueDays.size;
}

// ===============================
// CATEGORY CHART
// ===============================
function renderCategoryChart(encounters) {
  const counts = {};

  encounters.forEach((e) => {
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
      datasets: [
        {
          data,
          backgroundColor: [
            "#6c63ff",
            "#ff9800",
            "#4caf50",
            "#03a9f4",
            "#e91e63",
            "#9c27b0"
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ===============================
// HELPERS
// ===============================
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR");
}

// ===============================
// INIT
// ===============================
loadEncounters();

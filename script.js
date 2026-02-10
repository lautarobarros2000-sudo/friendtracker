document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // SUPABASE
  // ===============================
  const supabase = window.supabase.createClient(
    "https://jvefzcnujhpqgyedmmxp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWZ6Y251amhwcWd5ZWRtbXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDAwODYsImV4cCI6MjA4NjMxNjA4Nn0.uA4GjxOThyoEbps9W2zcZfhHY6DNCS-QE_SgtpeDB5s"
  );

  // ===============================
  // DOM
  // ===============================
  const toggleFormBtn = document.getElementById("toggleFormBtn");
  const formSection = document.getElementById("formSection");
  const form = document.getElementById("encounterForm");

  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const noteInput = document.getElementById("note");
  const importantInput = document.getElementById("important");

  const listEl = document.getElementById("encountersList");
  const filterCategory = document.getElementById("filterCategory");

  const totalEncountersEl = document.getElementById("totalEncounters");
  const totalDaysEl = document.getElementById("totalDays");

  const categoryChartCtx = document.getElementById("categoryChart");
  let categoryChart = null;

  // ===============================
  // TOGGLE FORM
  // ===============================
  toggleFormBtn.onclick = () => {
    formSection.classList.toggle("hidden");
    if (!formSection.classList.contains("hidden")) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ===============================
  // SUBMIT
  // ===============================
  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date: dateInput.value,
      category: categoryInput.value,
      note: noteInput.value,
      important: importantInput.checked
    };

    if (!payload.date || !payload.category) return;

    const { error } = await supabase
      .from("encounters")
      .insert([payload]);

    if (error) {
      console.error("INSERT ERROR:", error);
      return;
    }

    form.reset();
    formSection.classList.add("hidden");
    load();
  };

  filterCategory.onchange = load;

  // ===============================
  // LOAD
  // ===============================
  async function load() {
    const { data, error } = await supabase
      .from("encounters")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("LOAD ERROR:", error);
      return;
    }

    const filtered = filterCategory.value
      ? data.filter(e => e.category === filterCategory.value)
      : data;

    renderStats(data);
    renderList(filtered);
    renderChart(data);
  }

  // ===============================
  // STATS
  // ===============================
  function renderStats(data) {
    totalEncountersEl.textContent = data.length;
    totalDaysEl.textContent = new Set(data.map(e => e.date)).size;
  }

  // ===============================
  // LIST
  // ===============================
  function renderList(data) {
    listEl.innerHTML = "";

    if (data.length === 0) {
      listEl.innerHTML = "<p>No hay encuentros todavía</p>";
      return;
    }

    const grouped = {};
    data.forEach(e => {
      const key = e.date.slice(0, 7); // YYYY-MM
      grouped[key] ||= [];
      grouped[key].push(e);
    });

    Object.keys(grouped).forEach(month => {
      const div = document.createElement("div");
      div.className = "month-group";

      div.innerHTML = `
        <div class="month-title">${month}</div>
        <table>
          <tbody>
            ${grouped[month].map(e => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString("es-AR")}</td>
                <td>${e.category}</td>
                <td>${e.note || ""}</td>
                <td>${e.important ? "⭐" : ""}</td>
                <td>
                  <button class="delete-btn" data-id="${e.id}">🗑️</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      listEl.appendChild(div);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("¿Borrar encuentro?")) return;
        await supabase.from("encounters").delete().eq("id", btn.dataset.id);
        load();
      };
    });
  }

  // ===============================
  // CHART
  // ===============================
  function renderChart(data) {
    const counts = {};
    data.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(categoryChartCtx, {
      type: "pie",
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
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

  // ===============================
  // INIT
  // ===============================
  load();
});

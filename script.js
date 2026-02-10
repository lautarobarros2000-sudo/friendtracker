document.addEventListener("DOMContentLoaded", () => {

  const supabase = window.supabase.createClient(
    "https://jvefzcnujhpqgyedmmxp.supabase.co",
    "TU_ANON_KEY"
  );

  const toggleFormBtn = document.getElementById("toggleFormBtn");
  const formSection = document.getElementById("formSection");
  const form = document.getElementById("encounterForm");
  const listEl = document.getElementById("encountersList");
  const filterCategory = document.getElementById("filterCategory");

  const totalEncountersEl = document.getElementById("totalEncounters");
  const totalDaysEl = document.getElementById("totalDays");

  let categoryChart;

  toggleFormBtn.onclick = () =>
    formSection.classList.toggle("hidden");

  form.onsubmit = async e => {
    e.preventDefault();

    const data = {
      date: date.value,
      category: category.value,
      note: note.value,
      important: important.checked
    };

    await supabase.from("encounters").insert([data]);
    form.reset();
    formSection.classList.add("hidden");
    load();
  };

  filterCategory.onchange = load;

  async function load() {
    const { data } = await supabase
      .from("encounters")
      .select("*")
      .order("date", { ascending: false });

    const filtered = filterCategory.value
      ? data.filter(e => e.category === filterCategory.value)
      : data;

    renderStats(data);
    renderList(filtered);
    renderChart(data);
  }

  function renderStats(data) {
    totalEncountersEl.textContent = data.length;
    totalDaysEl.textContent = new Set(data.map(e => e.date)).size;
  }

  function renderList(data) {
    listEl.innerHTML = "";

    const grouped = {};
    data.forEach(e => {
      const key = e.date.slice(0, 7);
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
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td>${e.category}</td>
                <td>${e.note || ""}</td>
                <td>${e.important ? "⭐" : ""}</td>
                <td>
                  <button class="delete-btn" onclick="deleteEncounter('${e.id}')">🗑️</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      listEl.appendChild(div);
    });
  }

  window.deleteEncounter = async id => {
    if (!confirm("¿Borrar encuentro?")) return;
    await supabase.from("encounters").delete().eq("id", id);
    load();
  };

  function renderChart(data) {
    const counts = {};
    data.forEach(e => counts[e.category] = (counts[e.category] || 0) + 1);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(categoryChartCtx, {
      type: "pie",
      data: {
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts) }]
      }
    });
  }

  load();
});

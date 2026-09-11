/**
 * VerdaMetric AI - Dataset Information & Explorer Controller
 * Handles dataset statistics, paginated sample table, search filtering, and distribution charts.
 */

let datasetDistChart1 = null;
let datasetDistChart2 = null;
let currentPage = 1;
const perPage = 10;
let searchDebounceTimer = null;

window.initDatasetExplorer = async function() {
  loadOverview();
  loadTableData(1);
};

async function loadOverview() {
  try {
    const res = await fetch("/api/dataset-overview");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to load overview");

    const o = data.overview;
    const dist = data.distributions;

    document.getElementById("metaTotalRecords").textContent = (o.total_records || 0).toLocaleString();
    document.getElementById("metaTotalFeatures").textContent = o.total_features || 0;
    document.getElementById("metaMissingValues").textContent = `${o.missing_values_total || 0} (Clean)`;
    
    const facilityKeys = Object.keys(o.facility_distribution || {}).length;
    document.getElementById("metaSegments").textContent = `${facilityKeys} Sectors`;

    renderDistributionCharts(dist);
  } catch (err) {
    console.error("Error loading dataset overview:", err);
  }
}

async function loadTableData(page = 1, searchQuery = "") {
  const tableBody = document.getElementById("datasetTableBody");
  const pageIndicator = document.getElementById("pageIndicator");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading records...</td></tr>`;
  }

  try {
    const res = await fetch(`/api/dataset-sample?page=${page}&per_page=${perPage}&search=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to load table");

    currentPage = data.page;
    if (pageIndicator) pageIndicator.textContent = `Page ${data.page} of ${data.pages} (${data.total} records)`;
    if (prevBtn) prevBtn.disabled = data.page <= 1;
    if (nextBtn) nextBtn.disabled = data.page >= data.pages;

    if (tableBody) {
      tableBody.innerHTML = "";
      if (data.records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--text-muted)">No matching records found.</td></tr>`;
        return;
      }

      data.records.forEach(row => {
        const tr = document.createElement("tr");
        
        let tierColor = "emerald";
        if (row.sustainability_tier.includes("Tier B")) tierColor = "blue";
        else if (row.sustainability_tier.includes("Tier C")) tierColor = "amber";
        else if (row.sustainability_tier.includes("Tier D")) tierColor = "rose";

        tr.innerHTML = `
          <td style="font-weight:600; color:var(--text-primary)">${row.facility_type}</td>
          <td class="font-mono">${Number(row.monthly_energy_kwh).toLocaleString()}</td>
          <td class="font-mono" style="color: var(--brand-emerald)">${row.renewable_energy_pct}%</td>
          <td class="font-mono">${row.facility_area_sqm.toLocaleString()} m²</td>
          <td class="font-mono">${row.equipment_efficiency_rating} SEER</td>
          <td class="font-mono">${row.waste_recycled_pct}%</td>
          <td class="font-mono" style="font-weight:700">${row.annual_carbon_footprint_mt} MT</td>
          <td><span class="badge badge-${tierColor}">${row.sustainability_tier}</span></td>
        `;
        tableBody.appendChild(tr);
      });
    }
  } catch (err) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--accent-rose)">Failed to load data.</td></tr>`;
    }
  }
}

function renderDistributionCharts(dist) {
  const isDark = (document.documentElement.getAttribute("data-theme") || "dark") === "dark";
  const textColor = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)";

  // 1. Renewable Energy Distribution
  const ctx1 = document.getElementById("distRenewableChart");
  if (ctx1 && dist.renewable_pct) {
    if (datasetDistChart1) datasetDistChart1.destroy();
    datasetDistChart1 = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: dist.renewable_pct.labels.map(l => `${l}%`),
        datasets: [{
          label: "Frequency (Facilities)",
          data: dist.renewable_pct.counts,
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // 2. Sustainability Tier Donut
  const ctx2 = document.getElementById("distTierChart");
  if (ctx2 && dist.tier_distribution) {
    if (datasetDistChart2) datasetDistChart2.destroy();
    datasetDistChart2 = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: dist.tier_distribution.labels.map(l => l.replace(" (Tier ", " (").replace(")", "")),
        datasets: [{
          data: dist.tier_distribution.counts,
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e"],
          borderWidth: 2,
          borderColor: isDark ? "#111928" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 12, padding: 15 }
          }
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("datasetSearchInput");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      const val = e.target.value;
      searchDebounceTimer = setTimeout(() => {
        loadTableData(1, val);
      }, 300);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        const query = searchInput ? searchInput.value : "";
        loadTableData(currentPage - 1, query);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const query = searchInput ? searchInput.value : "";
      loadTableData(currentPage + 1, query);
    });
  }
});
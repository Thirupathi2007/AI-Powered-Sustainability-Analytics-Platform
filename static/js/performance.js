/**
 * VerdaMetric AI - Model Performance & Evaluation Controller
 * Handles Chart.js visualizations for ROC Curve, Confusion Matrix, Feature Importance, and Benchmark comparison.
 */

let rocChartInstance = null;
let featureChartInstance = null;
let benchmarkChartInstance = null;
let cachedMetrics = null;

function getChartThemeColors() {
  const isDark = (document.documentElement.getAttribute("data-theme") || "dark") === "dark";
  return {
    textColor: isDark ? "#94a3b8" : "#475569",
    gridColor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipText: isDark ? "#f8fafc" : "#0f172a"
  };
}

window.initPerformanceDashboard = async function() {
  if (cachedMetrics) {
    renderMetrics(cachedMetrics);
    return;
  }

  try {
    const res = await fetch("/api/model-metrics");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to load model metrics");
    }

    cachedMetrics = data.metrics;
    renderMetrics(cachedMetrics);
  } catch (err) {
    console.error("Error loading metrics:", err);
    window.showToast("Could not load model performance metrics", "error");
  }
};

function renderMetrics(metrics) {
  const s = metrics.summary;

  // 1. KPI Cards with Count-up Effect
  animateNumber("kpiAccuracy", s.accuracy, "%");
  animateNumber("kpiPrecision", s.precision, "%");
  animateNumber("kpiRecall", s.recall, "%");
  animateNumber("kpiF1", s.f1_score, "%");
  animateNumber("kpiRocAuc", s.roc_auc, "");

  const themeColors = getChartThemeColors();

  // 2. ROC-AUC Curve Chart
  const rocCtx = document.getElementById("rocCurveChart");
  if (rocCtx) {
    if (rocChartInstance) rocChartInstance.destroy();

    const pts = metrics.roc_curve.points;
    const labels = pts.map(p => p.fpr);
    const dataPoints = pts.map(p => ({ x: p.fpr, y: p.tpr }));

    // Add diagonal baseline
    const baselinePoints = [{ x: 0, y: 0 }, { x: 1, y: 1 }];

    rocChartInstance = new Chart(rocCtx, {
      type: "line",
      data: {
        datasets: [
          {
            label: `Random Forest Ensemble (AUC = ${metrics.roc_curve.auc})`,
            data: dataPoints,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "#10b981"
          },
          {
            label: "Random Chance (AUC = 0.50)",
            data: baselinePoints,
            borderColor: "#64748b",
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 1,
            title: { display: true, text: "False Positive Rate (1 - Specificity)", color: themeColors.textColor },
            ticks: { color: themeColors.textColor },
            grid: { color: themeColors.gridColor }
          },
          y: {
            type: "linear",
            min: 0,
            max: 1,
            title: { display: true, text: "True Positive Rate (Sensitivity)", color: themeColors.textColor },
            ticks: { color: themeColors.textColor },
            grid: { color: themeColors.gridColor }
          }
        },
        plugins: {
          legend: { labels: { color: themeColors.textColor } },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText,
            borderColor: themeColors.gridColor,
            borderWidth: 1
          }
        }
      }
    });
  }

  // 3. Feature Importance Horizontal Bar Chart
  const featCtx = document.getElementById("featureImportanceChart");
  if (featCtx) {
    if (featureChartInstance) featureChartInstance.destroy();

    const feats = metrics.feature_importance.slice(0, 8);
    const readableMap = {
      renewable_energy_pct: "Renewable Energy Share (%)",
      equipment_efficiency_rating: "Equipment SEER Efficiency",
      waste_recycled_pct: "Waste Recycling Rate (%)",
      monthly_energy_kwh: "Monthly Grid Energy (kWh)",
      fuel_consumed_liters: "Direct Fuel Combustion (L)",
      facility_area_sqm: "Facility Footprint (m²)",
      peak_load_factor: "Peak Demand Factor",
      water_usage_m3: "Water Consumption (m³)"
    };

    const featLabels = feats.map(f => readableMap[f.feature] || f.feature);
    const featValues = feats.map(f => f.importance);

    featureChartInstance = new Chart(featCtx, {
      type: "bar",
      data: {
        labels: featLabels,
        datasets: [
          {
            label: "Importance Weight (%)",
            data: featValues,
            backgroundColor: [
              "#10b981", "#059669", "#34d399", "#3b82f6",
              "#06b6d4", "#8b5cf6", "#f59e0b", "#64748b"
            ],
            borderRadius: 6,
            borderWidth: 0
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: "Predictive Weight (%)", color: themeColors.textColor },
            ticks: { color: themeColors.textColor },
            grid: { color: themeColors.gridColor }
          },
          y: {
            ticks: { color: themeColors.textColor, font: { size: 12 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText
          }
        }
      }
    });
  }

  // 4. Confusion Matrix Visual Heatmap
  const cmContainer = document.getElementById("confusionMatrixContainer");
  if (cmContainer && metrics.confusion_matrix) {
    cmContainer.innerHTML = "";
    const labels = metrics.confusion_matrix.labels;
    const matrix = metrics.confusion_matrix.matrix;

    const table = document.createElement("table");
    table.className = "custom-table font-mono";
    table.style.textAlign = "center";

    // Header Row
    let thead = "<thead><tr><th style='text-align:left'>Actual \\ Predicted</th>";
    labels.forEach(l => {
      thead += `<th>${l.replace(" (Tier ", " (").replace(")", "")}</th>`;
    });
    thead += "</tr></thead>";

    // Body
    let tbody = "<tbody>";
    let maxVal = 1;
    matrix.forEach(row => row.forEach(v => { if (v > maxVal) maxVal = v; }));

    matrix.forEach((row, rIdx) => {
      tbody += `<tr><td style='text-align:left; font-weight:700; color:var(--text-primary)'>${labels[rIdx].replace(" (Tier ", " (").replace(")", "")}</td>`;
      row.forEach((cell, cIdx) => {
        const isDiagonal = rIdx === cIdx;
        const opacity = Math.max(0.15, cell / maxVal);
        const bg = isDiagonal ? `rgba(16, 185, 129, ${opacity})` : (cell > 0 ? `rgba(244, 63, 94, ${opacity * 0.5})` : "transparent");
        tbody += `<td style='background:${bg}; font-weight:${isDiagonal ? "800" : "500"}; color:var(--text-primary)'>${cell}</td>`;
      });
      tbody += "</tr>";
    });
    tbody += "</tbody>";

    table.innerHTML = thead + tbody;
    cmContainer.appendChild(table);
  }

  // 5. Algorithm Comparison Benchmark
  const bmTableBody = document.getElementById("benchmarkTableBody");
  if (bmTableBody && metrics.benchmarks) {
    bmTableBody.innerHTML = "";
    metrics.benchmarks.forEach(bm => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 700; display: flex; align-items: center; gap: 0.5rem">
          ${bm.model} ${bm.is_active ? '<span class="badge badge-emerald">Production</span>' : ''}
        </td>
        <td class="font-mono">${bm.accuracy}%</td>
        <td class="font-mono">${bm.precision}%</td>
        <td class="font-mono">${bm.recall}%</td>
        <td class="font-mono">${bm.f1_score}%</td>
        <td class="font-mono">${bm.inference_ms} ms</td>
      `;
      bmTableBody.appendChild(tr);
    });
  }
}

function animateNumber(elementId, target, suffix = "") {
  const el = document.getElementById(elementId);
  if (!el) return;

  const start = 0;
  const duration = 1000;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = (start + (target - start) * easeProgress);

    el.textContent = `${current.toFixed(1)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

window.updateChartsTheme = function(theme) {
  if (rocChartInstance || featureChartInstance) {
    const colors = getChartThemeColors();
    [rocChartInstance, featureChartInstance].forEach(chart => {
      if (!chart) return;
      if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = colors.textColor;
        if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = colors.gridColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = colors.textColor;
        if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = colors.gridColor;
      }
      chart.update();
    });
  }
};
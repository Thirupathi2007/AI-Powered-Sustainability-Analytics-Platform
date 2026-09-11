/**
 * VerdaMetric AI - Machine Learning Prediction Controller
 * Handles presets, form validation, REST API inference, animated gauge, and actionable recommendations.
 */

class PredictionEngine {
  constructor() {
    this.form = document.getElementById("predictionForm");
    this.resultsCard = document.getElementById("predictionResultsCard");
    this.emptyState = document.getElementById("predictionEmptyState");
    this.skeletonState = document.getElementById("predictionSkeleton");
    this.predictBtn = document.getElementById("predictBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.copyBtn = document.getElementById("copySummaryBtn");
    this.exportBtn = document.getElementById("exportSummaryBtn");

    this.currentResult = null;

    this.presets = {
      tech_campus: {
        monthly_energy_kwh: 48000,
        renewable_energy_pct: 85,
        peak_load_factor: 0.52,
        facility_area_sqm: 24000,
        operational_days_year: 360,
        equipment_efficiency_rating: 4.8,
        logistics_distance_km: 1800,
        fuel_consumed_liters: 450,
        waste_recycled_pct: 88,
        water_usage_m3: 320
      },
      factory: {
        monthly_energy_kwh: 165000,
        renewable_energy_pct: 12,
        peak_load_factor: 0.84,
        facility_area_sqm: 55000,
        operational_days_year: 320,
        equipment_efficiency_rating: 2.1,
        logistics_distance_km: 35000,
        fuel_consumed_liters: 9800,
        waste_recycled_pct: 28,
        water_usage_m3: 2400
      },
      office_hq: {
        monthly_energy_kwh: 32000,
        renewable_energy_pct: 45,
        peak_load_factor: 0.60,
        facility_area_sqm: 14000,
        operational_days_year: 260,
        equipment_efficiency_rating: 3.6,
        logistics_distance_km: 4200,
        fuel_consumed_liters: 850,
        waste_recycled_pct: 62,
        water_usage_m3: 450
      },
      logistics: {
        monthly_energy_kwh: 88000,
        renewable_energy_pct: 25,
        peak_load_factor: 0.72,
        facility_area_sqm: 38000,
        operational_days_year: 365,
        equipment_efficiency_rating: 3.2,
        logistics_distance_km: 48000,
        fuel_consumed_liters: 14500,
        waste_recycled_pct: 45,
        water_usage_m3: 650
      }
    };

    this.init();
  }

  init() {
    // Preset Pill Click Handlers
    document.querySelectorAll(".preset-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const key = pill.getAttribute("data-preset");
        this.loadPreset(key);
        document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        window.showToast(`Applied preset: ${pill.textContent.trim()}`, "info");
      });
    });

    // Tab Switching in Form
    document.querySelectorAll(".form-tab-btn").forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        document.querySelectorAll(".form-tab-btn").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".form-tab-pane").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const pane = document.getElementById(`pane-${target}`);
        if (pane) pane.classList.add("active");
      });
    });

    // Form Submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.runPrediction();
      });
    }

    // Reset Button
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.resetForm());
    }

    // Copy Summary Button
    if (this.copyBtn) {
      this.copyBtn.addEventListener("click", () => this.copySummary());
    }

    // Export / Print Summary Button
    if (this.exportBtn) {
      this.exportBtn.addEventListener("click", () => this.exportSummary());
    }

    // Real-time Input Validation
    const inputs = this.form ? this.form.querySelectorAll("input") : [];
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        this.validateInput(input);
      });
    });
  }

  loadPreset(presetKey) {
    const data = this.presets[presetKey];
    if (!data) return;

    for (const [key, value] of Object.entries(data)) {
      const field = document.getElementById(key);
      if (field) {
        field.value = value;
        field.classList.remove("is-invalid");
      }
    }
  }

  validateInput(input) {
    const min = parseFloat(input.getAttribute("min"));
    const max = parseFloat(input.getAttribute("max"));
    const val = parseFloat(input.value);

    let isValid = true;
    if (isNaN(val)) {
      isValid = false;
    } else {
      if (!isNaN(min) && val < min) isValid = false;
      if (!isNaN(max) && val > max) isValid = false;
    }

    input.classList.toggle("is-invalid", !isValid);
    return isValid;
  }

  getFormData() {
    const payload = {};
    const inputs = this.form.querySelectorAll("input");
    let allValid = true;

    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        allValid = false;
      }
      payload[input.id] = parseFloat(input.value) || 0;
    });

    return allValid ? payload : null;
  }

  async runPrediction() {
    const payload = this.getFormData();
    if (!payload) {
      window.showToast("Please review input values. Some exceed allowed operational bounds.", "error");
      return;
    }

    // Show Skeleton State
    if (this.emptyState) this.emptyState.style.display = "none";
    if (this.resultsCard) this.resultsCard.style.display = "none";
    if (this.skeletonState) this.skeletonState.style.display = "block";

    this.predictBtn.disabled = true;
    this.predictBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running ML Inference...';

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Inference failed");
      }

      this.currentResult = data;
      this.renderResults(data);
      window.showToast("Model prediction completed with high confidence.", "success", "Analysis Ready");
    } catch (err) {
      window.showToast(err.message, "error", "Prediction Error");
      if (this.emptyState) this.emptyState.style.display = "block";
    } finally {
      if (this.skeletonState) this.skeletonState.style.display = "none";
      this.predictBtn.disabled = false;
      this.predictBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate Sustainability Analytics';
    }
  }

  renderResults(data) {
    const pred = data.prediction;
    const carbon = pred.carbon_metrics;
    const bench = pred.benchmark;
    const summary = data.optimization_summary;

    if (this.resultsCard) this.resultsCard.style.display = "block";

    // 1. Grade & Gauge Animation
    const gradeEl = document.getElementById("resGrade");
    const badgeEl = document.getElementById("resTierBadge");
    const confidenceEl = document.getElementById("resConfidence");
    const gaugeMeter = document.getElementById("resGaugeMeter");

    if (gradeEl) gradeEl.textContent = pred.grade;
    if (badgeEl) {
      badgeEl.textContent = pred.badge;
      badgeEl.className = `badge badge-${pred.color}`;
    }
    if (confidenceEl) confidenceEl.textContent = `${pred.confidence}% Model Confidence`;

    // Gauge stroke dashoffset calculation: 377 is full circle
    const gradeOffsets = { A: 38, B: 110, C: 200, D: 290, F: 350 };
    const targetOffset = gradeOffsets[pred.grade] || 150;
    if (gaugeMeter) {
      gaugeMeter.style.stroke = `var(--${pred.color === "emerald" ? "brand-emerald" : pred.color === "blue" ? "accent-blue" : pred.color === "amber" ? "accent-amber" : "accent-rose"})`;
      gaugeMeter.style.strokeDashoffset = targetOffset;
    }

    // 2. Metrics Strip
    const carbonEl = document.getElementById("resCarbonTotal");
    const intensityEl = document.getElementById("resEnergyIntensity");
    const benchDeltaEl = document.getElementById("resBenchmarkDelta");

    if (carbonEl) carbonEl.textContent = `${carbon.total_carbon_mt.toLocaleString()} MT CO2e`;
    if (intensityEl) intensityEl.textContent = `${carbon.energy_intensity_kwh_sqm.toLocaleString()} kWh/m²`;

    if (benchDeltaEl) {
      const isBetter = bench.is_better_than_average;
      const sign = bench.delta_pct > 0 ? "+" : "";
      benchDeltaEl.innerHTML = `<i class="fa-solid fa-arrow-${isBetter ? "down" : "up"}"></i> ${sign}${bench.delta_pct}% vs Sector Benchmark`;
      benchDeltaEl.className = `badge badge-${isBetter ? "emerald" : "rose"}`;
    }

    // 3. Emission Stack Bars
    const totalC = Math.max(1, carbon.total_carbon_mt);
    const s1Pct = Math.round((carbon.scope_1_mt / totalC) * 100);
    const s2Pct = Math.round((carbon.scope_2_mt / totalC) * 100);
    const s3Pct = Math.max(0, 100 - s1Pct - s2Pct);

    const s1Bar = document.getElementById("barScope1");
    const s2Bar = document.getElementById("barScope2");
    const s3Bar = document.getElementById("barScope3");

    if (s1Bar) s1Bar.style.width = `${s1Pct}%`;
    if (s2Bar) s2Bar.style.width = `${s2Pct}%`;
    if (s3Bar) s3Bar.style.width = `${s3Pct}%`;

    const lblS1 = document.getElementById("lblScope1");
    const lblS2 = document.getElementById("lblScope2");
    const lblS3 = document.getElementById("lblScope3");

    if (lblS1) lblS1.textContent = `Scope 1 (Direct Fuel): ${carbon.scope_1_mt} MT (${s1Pct}%)`;
    if (lblS2) lblS2.textContent = `Scope 2 (Grid Electricity): ${carbon.scope_2_mt} MT (${s2Pct}%)`;
    if (lblS3) lblS3.textContent = `Scope 3 (Supply/Waste): ${carbon.scope_3_mt} MT (${s3Pct}%)`;

    // 4. Optimization Summary Banner
    const potReductEl = document.getElementById("resPotReduction");
    const potCostEl = document.getElementById("resPotSavings");
    const projTierEl = document.getElementById("resProjTier");

    if (potReductEl) potReductEl.textContent = `-${summary.total_co2_reduction_mt} MT CO2e (${summary.carbon_reduction_pct}%)`;
    if (potCostEl) potCostEl.textContent = `$${summary.total_cost_savings_usd.toLocaleString()} / yr`;
    if (projTierEl) projTierEl.textContent = summary.projected_tier;

    // 5. Actionable Recommendations List
    const recListContainer = document.getElementById("recommendationsList");
    if (recListContainer) {
      recListContainer.innerHTML = "";
      data.recommendations.forEach(rec => {
        const item = document.createElement("div");
        item.className = "rec-card";
        item.innerHTML = `
          <div class="rec-top">
            <h4 class="rec-title">${rec.title}</h4>
            <div class="rec-meta-pills">
              <span class="badge badge-${rec.badge_color}">${rec.impact_level} Impact</span>
              <span class="badge badge-emerald">${rec.timeframe}</span>
            </div>
          </div>
          <p class="rec-desc">${rec.description}</p>
          <div class="rec-metrics-grid">
            <div>
              <div class="rec-metric-val font-mono" style="color: var(--brand-emerald)">-${rec.co2_reduction_mt} MT</div>
              <div class="rec-metric-lbl">CO2 Abatement</div>
            </div>
            <div>
              <div class="rec-metric-val font-mono" style="color: var(--accent-blue)">$${rec.cost_savings_usd.toLocaleString()}</div>
              <div class="rec-metric-lbl">Annual Cost Savings</div>
            </div>
            <div>
              <div class="rec-metric-val font-mono">${rec.payback_period_years} Yrs</div>
              <div class="rec-metric-lbl">Est. Payback Period</div>
            </div>
          </div>
        `;
        recListContainer.appendChild(item);
      });
    }
  }

  resetForm() {
    if (this.form) this.form.reset();
    document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".form-input").forEach(i => i.classList.remove("is-invalid"));

    if (this.resultsCard) this.resultsCard.style.display = "none";
    if (this.emptyState) this.emptyState.style.display = "block";
    this.currentResult = null;
    window.showToast("Parameters restored to baseline defaults.", "info");
  }

  copySummary() {
    if (!this.currentResult) return;
    const p = this.currentResult.prediction;
    const c = p.carbon_metrics;
    const s = this.currentResult.optimization_summary;

    const summaryText = `[VerdaMetric AI Sustainability Report]
--------------------------------------------------
ESG Rating: ${p.grade} (${p.badge})
Model Confidence: ${p.confidence}%
Annual Carbon Footprint: ${c.total_carbon_mt} MT CO2e
- Scope 1: ${c.scope_1_mt} MT
- Scope 2: ${c.scope_2_mt} MT
- Scope 3: ${c.scope_3_mt} MT
Energy Intensity: ${c.energy_intensity_kwh_sqm} kWh/m²

Decarbonization Potential:
- Projected Abatement: -${s.total_co2_reduction_mt} MT CO2e (${s.carbon_reduction_pct}%)
- Est. Cost Savings: $${s.total_cost_savings_usd.toLocaleString()}/yr
- Projected Post-Upgrade Tier: ${s.projected_tier}
--------------------------------------------------
Generated by VerdaMetric AI Analytics Platform`;

    navigator.clipboard.writeText(summaryText).then(() => {
      window.showToast("Report summary copied to clipboard!", "success");
    }).catch(() => {
      window.showToast("Unable to copy to clipboard.", "error");
    });
  }

  exportSummary() {
    if (!this.currentResult) {
      window.showToast("No analysis available to export. Run a prediction first.", "info");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sustainability_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.showToast("Exported JSON sustainability assessment.", "success");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.predictionEngine = new PredictionEngine();
});
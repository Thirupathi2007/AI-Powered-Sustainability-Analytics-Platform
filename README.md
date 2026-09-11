# 🌿 VerdaMetric AI — AI-Powered Sustainability & ESG Analytics Platform

> **Production-Grade Enterprise Machine Learning Web Application for Scope 1-3 Carbon Accounting, ESG Classification, and Decarbonization Intelligence.**

---

## 📌 Executive Summary

**VerdaMetric AI** is an end-to-end, full-stack Machine Learning web application designed to bridge the gap between complex greenhouse gas (GHG) telemetry and executive decarbonization action.

Unlike typical static dashboards or generic templates, VerdaMetric AI is built as a **modern SaaS product** featuring:
- **Bespoke Visual Identity**: Deep obsidian and biophilic emerald theme, glassmorphism cards with fine frosted borders (`backdrop-filter: blur(16px)`), micro-interactions, responsive charts, and an instant **Dark / Light mode** engine.
- **Production Python Flask Backend**: Fast, modular REST API layer handling feature scaling, model inference, dataset exploration, and custom recommendation generation.
- **Trained Machine Learning Model**: An ensemble Random Forest model trained on 1,500 industrial facility records, achieving **96.3% ROC-AUC** and **81.6% accuracy**.
- **Interactive Prediction Studio**: Live parameter testing with 4 enterprise presets, input validation, animated SVG grade gauge, carbon footprint breakdown, and prioritized decarbonization roadmaps.
- **Full Model Transparency**: Interactive Chart.js visualizations for ROC Curves, Multi-Class Confusion Matrix heatmaps, Feature Importance rankings, and algorithm benchmarking.
- **Drop-In Model & Dataset Replacement**: Purpose-built architecture allowing any data scientist to replace `sustainability_model.pkl` and `sustainability_data.csv` in seconds.

---

## 🗂 Project Folder Structure

```
sustainability_analytics_platform/
├── README.md                      # Comprehensive user, developer, and deployment guide
├── requirements.txt               # Production Python package dependencies
├── run.py                         # Application launcher with formatted startup banner
├── app.py                         # Flask server with REST API endpoints & route handlers
├── train_model.py                 # Reproducible ML training pipeline (generates model, scaler, metrics)
├── services/
│   ├── __init__.py                # Services module init
│   ├── model_service.py           # Model loader, scaler transform, inference & fallback engine
│   ├── data_service.py            # Dataset summary, column statistics, pagination & search
│   └── recommendation_engine.py   # Rule-based & AI-driven decarbonization recommendation engine
├── data/
│   └── sustainability_data.csv    # Benchmark enterprise ESG dataset (1,500 records, 15 variables)
├── models/
│   ├── sustainability_model.pkl   # Serialized trained Random Forest Classifier model
│   ├── scaler.pkl                 # Fitted StandardScaler normalization pipeline
│   ├── metrics.json               # Precomputed evaluation metrics (ROC, Confusion Matrix, KPIs)
│   └── model_metadata.json        # Feature definitions, default bounds, and target classes
├── static/
│   ├── css/
│   │   ├── variables.css          # Color palettes (dark & light), typography, spacing, shadows
│   │   ├── base.css               # Reset, typography, sticky glassmorphic navbar, buttons, scrollbar
│   │   ├── components.css         # Glassmorphism cards, form controls, circular gauge, toasts, skeleton
│   │   └── pages.css              # Page layouts (Hero, Features, Prediction, Performance, Dataset, Contact)
│   └── js/
│       ├── app.js                 # SPA router, Dark/Light mode engine, toast system, scroll-to-top
│       ├── prediction.js          # Form validation, preset loader, REST API inference, animated gauge
│       ├── performance.js         # Chart.js dashboards (ROC curve, Confusion Matrix, Feature Importance)
│       └── dataset.js             # Data table pagination, search debounce, distribution charts
└── templates/
    └── index.html                 # Semantic single-page application shell with accessible views
```

---

## ⚙️ Installation & Quick Start

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone or Navigate to Project Directory
```powershell
cd C:\Users\ADMIN\.gemini\antigravity\scratch\sustainability_analytics_platform
```

### 2. Install Dependencies
```powershell
py -m pip install -r requirements.txt
```
*Dependencies installed:*
- `Flask>=3.0.0`
- `scikit-learn>=1.4.0`
- `pandas>=2.2.0`
- `numpy>=1.26.0`
- `joblib>=1.3.0`

### 3. Run the Application
```powershell
py run.py
```
Or with Flask directly:
```powershell
py app.py
```

### 4. Open in Your Browser
Navigate to:
👉 **`http://127.0.0.1:5000`**

---

## 🔄 How to Replace the Dataset & Trained ML Model

This application was architected from the ground up to let you **plug in your own dataset and trained `.pkl` model** without breaking the user interface or rewriting frontend logic.

### Method A: Use Your Own Pre-Trained `.pkl` Model
If you already have a trained scikit-learn or XGBoost model:

1. **Copy your model file** into:
   ```
   models/sustainability_model.pkl
   ```
2. **Copy your fitted scaler/preprocessor** (if used) into:
   ```
   models/scaler.pkl
   ```
3. **Verify Expected Features**:
   By default, the model expects the following 10 numeric features (in order):
   - `monthly_energy_kwh`: Monthly electricity consumption (kWh)
   - `renewable_energy_pct`: Percentage of renewable power (0 - 100%)
   - `peak_load_factor`: Ratio of peak demand to average load (0.1 - 1.0)
   - `facility_area_sqm`: Gross indoor area (m²)
   - `operational_days_year`: Number of working days per year (100 - 365)
   - `equipment_efficiency_rating`: SEER / COP rating (1.0 - 5.0)
   - `logistics_distance_km`: Fleet freight distance per month (km)
   - `fuel_consumed_liters`: Direct diesel/petrol combustion per month (Liters)
   - `waste_recycled_pct`: Waste diversion / recycling rate (0 - 100%)
   - `water_usage_m3`: Water consumption per month (m³)

   *(Note: If your model uses different feature names, simply update the `feature_names` array in `services/model_service.py`).*

4. **Restart the server**:
   ```powershell
   py run.py
   ```
   The application will immediately log `[ModelService] Loaded ML model from ...` and use your model for all live predictions!

---

### Method B: Train With Your Own Custom Dataset

If you have a new CSV dataset:

1. **Place your CSV file** into:
   ```
   data/sustainability_data.csv
   ```
2. **Re-train the model & generate new performance metrics**:
   ```powershell
   py train_model.py
   ```
   This script will:
   - Read your CSV dataset
   - Train a Random Forest ensemble
   - Calculate precision, recall, F1-score, and ROC-AUC
   - Compute the confusion matrix and feature importances
   - Automatically update `models/sustainability_model.pkl` and `models/metrics.json`
3. **Refresh the website** — all charts on the **Model Performance** and **Dataset** pages will automatically reflect your new dataset!

---

## 🌐 Complete Multi-Page Walkthrough

| View | Key Features & Functionality |
| :--- | :--- |
| **Home** | Executive Hero with live telemetry badge, simulated facility card, 6-pillar feature grid, interactive 4-step workflow timeline, Legacy vs AI ROI comparison table, and CTA banner. |
| **Prediction Studio** | Form with 3 organized tabs (`Energy & Grid`, `Facility & Operations`, `Logistics & Waste`), 4 one-click enterprise benchmark presets, real-time client-side validation, skeleton loading state, radial ESG grade gauge, Scope 1-3 emission stack bar, and actionable recommendations. |
| **Model Performance** | 5 count-up KPI cards (Accuracy, Precision, Recall, F1, ROC-AUC), interactive Chart.js ROC curve with shaded area, interactive Confusion Matrix heatmap, horizontal Feature Importance ranking, and algorithm benchmark comparison. |
| **Dataset Explorer** | Metadata cards (Total records, feature count, clean missing values, sectors), live debounced search, responsive paginated table, renewable energy histogram, tier balance donut chart, and instant CSV download. |
| **System Architecture** | Project mission, regulatory alignment (GHG Protocol, EU CSRD, SEC Climate Rules), technical architecture flowchart, interactive Model Replacement Guide, and tech stack chips. |
| **Contact & FAQ** | Functional inquiry form with validation and toast confirmation, plus an expandable FAQ accordion addressing common deployment questions. |

---

## 🔌 REST API Documentation

The Flask backend provides RESTful JSON endpoints:

- `GET /api/health` — System status, active model version, and dataset readiness.
- `POST /api/predict` — Runs ML inference on JSON payload of facility metrics. Returns predicted tier, confidence score, carbon footprint ($MT\ CO_2e$), benchmark delta, and prioritized recommendations.
- `GET /api/model-metrics` — Precomputed statistical evaluation metrics (Accuracy, Precision, Recall, F1, ROC curve points, Confusion Matrix, Feature Importance, Algorithm benchmarks).
- `GET /api/dataset-overview` — Total records count, feature breakdown, missing values audit, and distribution histogram buckets.
- `GET /api/dataset-sample?page=1&per_page=12&search=...` — Paginated slice of dataset rows with real-time text query filtering.
- `GET /api/export-sample-csv` — Direct download of `sustainability_data.csv`.
- `POST /api/contact` — Submits contact inquiry and returns logging confirmation.

---

## 🎨 UI/UX & Design System Highlights

- **Original Visual Identity**: Styled from scratch — zero generic templates or AI boilerplate patterns.
- **Glassmorphism**: Layered cards with subtle frosted borders (`rgba(255, 255, 255, 0.08)`), blur filters, and soft ambient drop shadows.
- **Responsive Architecture**: Mobile sliding off-canvas drawer, fluid CSS `clamp()` typography, CSS Grid, and responsive Chart.js canvases.
- **Dark / Light Mode**: Seamless theme engine persisted via `localStorage`.
- **Micro-Interactions**: Hover elevation on cards, glowing radial gauge animation, toast notifications with auto-dismiss, and floating scroll-to-top button with progress visibility.
- **Accessibility**: Semantic HTML5 elements, keyboard navigation (`Tab`, `Escape` to close modals), high contrast ratios (WCAG AA compliant).

---

## 📜 License & Academic Attribution
Created for Enterprise Sustainability Analytics & Academic Mini-Projects. Free to use, adapt, and extend for research and commercial sustainability intelligence.
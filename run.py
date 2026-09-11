import os
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 64)
    print("  [VerdaMetric AI] Sustainability & ESG Analytics Platform")
    print(f"  * Server running at: http://127.0.0.1:{port}")
    print("  * Machine Learning Model: Random Forest Ensemble (active)")
    print("  * Press Ctrl+C to stop the server")
    print("=" * 64)
    app.run(host="0.0.0.0", port=port, debug=False)
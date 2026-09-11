import os
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__, static_folder='static', template_folder='templates')

from services.model_service import model_service
from services.data_service import data_service

@app.route('/')
@app.route('/predict')
@app.route('/performance')
@app.route('/dataset')
@app.route('/about')
@app.route('/contact')
def index():
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'VerdaMetric AI - Sustainability Analytics Engine',
        'version': '2.4.0',
        'model_loaded': model_service.model is not None,
        'dataset_loaded': data_service.df is not None and not data_service.df.empty
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({'error': 'Invalid or empty JSON body'}), 400
        
        result = model_service.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    try:
        metrics = model_service.get_metrics()
        return jsonify({'success': True, 'metrics': metrics})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/model-metadata', methods=['GET'])
def get_model_metadata():
    try:
        meta = model_service.get_metadata()
        return jsonify({'success': True, 'metadata': meta})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/dataset-overview', methods=['GET'])
def get_dataset_overview():
    try:
        overview = data_service.get_overview()
        distributions = data_service.get_distributions()
        return jsonify({
            'success': True,
            'overview': overview,
            'distributions': distributions
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/dataset-sample', methods=['GET'])
def get_dataset_sample():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', None)
        sort_dir = request.args.get('sort_dir', 'asc')

        data = data_service.get_paginated_sample(
            page=page, per_page=per_page, search=search, sort_by=sort_by, sort_dir=sort_dir
        )
        return jsonify({'success': True, **data})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    try:
        payload = request.get_json(force=True, silent=True) or {}
        name = payload.get('name', 'User')
        email = payload.get('email', '')
        message = payload.get('message', '')
        
        if not email or not message:
            return jsonify({'success': False, 'error': 'Email and message are required'}), 400

        return jsonify({
            'success': True,
            'message': f'Thank you {name}. Your message has been received! Our team will contact you at {email}.'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/export-sample-csv', methods=['GET'])
def export_sample_csv():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'data', 'sustainability_data.csv')
        if os.path.exists(csv_path):
            return send_file(
                csv_path,
                mimetype='text/csv',
                as_attachment=True,
                download_name='sustainability_dataset.csv'
            )
        return jsonify({'error': 'Dataset file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'Starting VerdaMetric AI Sustainability Analytics server on http://127.0.0.1:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)

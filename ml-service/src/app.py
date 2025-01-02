from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        # TODO: Implement prediction logic
        return jsonify({
            'prediction': 0,
            'confidence': 0,
            'message': 'Prediction endpoint placeholder'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Internal server error'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

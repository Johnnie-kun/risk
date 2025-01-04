from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# Initialize Flask app
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Placeholder endpoint for ML predictions.
    Accepts JSON input and will return predictions in the future.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Placeholder logic for prediction
        # Replace this with actual model inference logic
        prediction = "Prediction logic will be added here"

        return jsonify({'prediction': prediction, 'input': data}), 200
    except Exception as e:
        return jsonify({'error': f"Internal server error: {str(e)}"}), 500

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    """Global error handler for HTTP exceptions."""
    response = e.get_response()
    response.data = jsonify({
        'code': e.code,
        'name': e.name,
        'description': e.description
    })
    response.content_type = 'application/json'
    return response, e.code

@app.errorhandler(Exception)
def handle_generic_exception(e):
    """Global error handler for non-HTTP exceptions."""
    return jsonify({'error': f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5001, debug=True)
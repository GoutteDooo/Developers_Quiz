import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route('/api/quiz')
def get_quiz():
    with open('quiz_data.json') as f:
        quiz_data = json.load(f)
    return jsonify(quiz_data)

if __name__ == '__main__':
    app.run(debug=True)

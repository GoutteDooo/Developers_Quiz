from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    quiz_data = {
        "question": "What is the capital of France ?",
        "choices": ["Paris", "Lyon", "Marseille"],
        "answer": "Paris"
    }
    return jsonify(quiz_data)

if __name__ == '__main__':
    app.run(debug=True)

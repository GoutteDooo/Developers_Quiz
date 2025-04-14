from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Définir une route qui renvoie des données JSON
@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    quiz_data = {
        "question": "Quelle est la capitale de la France ?",
        "choices": ["Paris", "Lyon", "Marseille"],
        "answer": "Paris"
    }
    return jsonify(quiz_data)

if __name__ == '__main__':
    app.run(debug=True)

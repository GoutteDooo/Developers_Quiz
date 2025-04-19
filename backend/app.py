import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

MAX_TIME = 20 # seconds per question

with open('quiz_data.json') as f:
    quiz_data = json.load(f)


@app.route('/api/quiz')
def get_quiz():
    question_data = quiz_data
    return jsonify(question_data)

# Endpoint to verify the answer submitted by the client
@app.route('/api/quiz/verify', methods=['POST'])
def verify_answer():
    # expecting a JSON request like {"id":1, "category": "HTML", "selected": "<h1>"}
    submitted = request.json or {}
    question_id = submitted.get("id")
    category = submitted.get("category")
    time_elapsed = submitted.get("timeElapsed", MAX_TIME + 1)
    selected_answer = submitted.get("selected")

    #check time out
    if time_elapsed > MAX_TIME or selected_answer is None:
        return jsonify({"correct": False, "reason": "timeout"})
    
    # Find the question by id in the stored quiz data (here, in the HTML category)
    question = next((q for q in quiz_data[category] if q["id"] == question_id), None)

    if question and selected_answer == question["answer"]:
        return jsonify({"correct": True})
    return jsonify({"correct": False})

if __name__ == '__main__':
    app.run(debug=True)
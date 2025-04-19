# app.py
import json
from flask import Flask, jsonify, request, session
from flask_cors import CORS

app = Flask(__name__)
# needed to use sessions
app.secret_key = 'your‑very‑secret‑key'
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

MAX_TIME = 20  # seconds per question

with open('quiz_data.json') as f:
    quiz_data = json.load(f)

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    # reset the score at quiz start
    session['score'] = 0
    # also reset any other per‑quiz state
    return jsonify(quiz_data)

@app.route('/api/quiz/verify', methods=['POST'])
def verify_answer():
    submitted = request.json or {}
    qid = submitted.get("id")
    category = submitted.get("category")
    time_elapsed = submitted.get("timeElapsed", MAX_TIME + 1)
    selected = submitted.get("selected")

    # initialize score in session if not there
    if 'score' not in session:
        session['score'] = 0

    # timeout or no answer
    if time_elapsed > MAX_TIME or selected is None:
        # no score change
        return jsonify({"correct": False, "reason": "timeout", "score": session['score']})

    # find question
    question = next((q for q in quiz_data.get(category, []) if q["id"] == qid), None)
    if question and selected == question["answer"]:
        session['score'] += 1

        return jsonify({"correct": True, "score": session['score']})

    # wrong answer
    return jsonify({"correct": False, "score": session['score']})

if __name__ == '__main__':
    app.run(debug=True)

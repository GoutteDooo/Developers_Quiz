import json
from flask import Flask, jsonify, request, session
from flask_cors import CORS

app = Flask(__name__)
app.config.update(
  SESSION_COOKIE_SAMESITE='None',   # allow the cookie to be sent cross-site
  SESSION_COOKIE_SECURE=True        # required when SameSite=None
)
# needed to use sessions
app.secret_key = 'your‑very‑secret‑key'
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

DEFAULT_MAX_TIME = 25  # seconds per question by default

with open('quiz_data.json') as f:
    quiz_data = json.load(f)

@app.route('/api/quiz/')
def get_settings():
    #get an object with name of categories and number of questions per category
    data_settings = {}
    for category, questions in quiz_data.items():
        data_settings[category] = len(questions)
    return jsonify(data_settings)

@app.route('/api/quiz/start', methods=['POST'])
def get_quiz():
    """
    Expected JSON: 
    { timerPerQuestion: number or null}
    """
    data = request.json or {}
    # store the time limit in session; None means no time limit
    session['max_time'] = data.get('timerPerQuestion', DEFAULT_MAX_TIME)

    # reset the score at quiz start
    session['score'] = 0

    # send data without answers
    quiz_data_copy = {}
    for category, questions in quiz_data.items():
        quiz_data_copy[category] = [
            {**q, "answer": None} for q in questions
        ]
    
    # also reset any other per‑quiz state
    return jsonify(quiz_data_copy)

@app.route('/api/quiz/verify', methods=['POST'])
def verify_answer():
    submitted = request.json or {}
    qid = submitted.get("id")
    category = submitted.get("category")
    selected = submitted.get("selected")
    time_elapsed = submitted.get("timeElapsed", DEFAULT_MAX_TIME + 1)

    # fetch the time limit from session, fall back is missing
    max_time = session.get('max_time', DEFAULT_MAX_TIME)

    # Treat None (or null) as "timer disabled"
    timer_enabled = max_time is not None

    # initialize score in session if not there
    session.setdefault('score', 0)

    # timeout: if timer enabled and time_elapsed > limit, or user didn't pick an answer
    if timer_enabled and time_elapsed > max_time or selected is None and timer_enabled:
        return jsonify({ "correct": False, "reason": "timeout", "score": session['score'] })

    # find question
    question = next((q for q in quiz_data.get(category, []) if q["id"] == qid), None)
    if question and selected == question["answer"]:
        session['score'] += 1
        return jsonify({"correct": True, "score": session['score']})

    # wrong answer
    return jsonify({"correct": False, "score": session['score']})

if __name__ == '__main__':
    app.run(debug=True)

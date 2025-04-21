import { useEffect, useRef, useState } from 'react';
//functions
import shuffleArray, { shuffleFirstThree} from '../functions/shuffleQuestions';
//types
import { QuizData, QuizQuestion } from '../types/quizData';
import { Settings } from '../types/settings';

interface QuizProps {
  quizData: QuizData;
  settings: Settings;
}

function QuizComponent({ quizData, settings }: QuizProps) {
  const { selectedCategories, questionsPerCategory, timePerQuestion } = settings;
  const MAX_TIME = timePerQuestion ?? Infinity;
  // State to store the categories of the quiz.
  const [categories, setCategories] = useState<string[]>([]);
  // State to track the current category
  const [categoryIndex, setCategoryIndex] = useState(0);
  // State to store the questions for the chosen category.
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  // The index of the currently displayed question.
  const [currentIndex, setCurrentIndex] = useState(0);
  // Feedback message to display whether the answer was correct or incorrect.
  const [feedback, setFeedback] = useState<string | null>(null);
  // State to know when the quiz is completed.
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // count number of questions left
  const [questionsLeft, setQuestionsLeft] = useState(0);
  // score from server
  const [score, setScore] = useState(0);

  //Timer state
  const [remainingTime, setRemainingTime] = useState(MAX_TIME);
  const timerRef = useRef<number>(MAX_TIME);

  //quiz payload
  const [filtered, setFiltered] = useState<QuizData>({});

  useEffect(() => {
    const newFiltered: QuizData = {};
    const newCategories: string[] = [];
  
    selectedCategories.forEach(cat => {
      const allQs = shuffleArray([...quizData[cat]]);
      const count = questionsPerCategory[cat];
      newFiltered[cat] = allQs
        .slice(0, count)
        .map(q => ({ ...q, choices: shuffleFirstThree(q.choices) }));
      newCategories.push(cat);
    });
  
    setFiltered(newFiltered);
    setCategories(newCategories);
    setCurrentQuestions(newFiltered[newCategories[0]]);
    const totalQuestions = Object.values(newFiltered).reduce((acc, cat) => acc + cat.length, 0);
    setQuestionsLeft(totalQuestions);
    
    setScore(0);
  }, [quizData, selectedCategories, questionsPerCategory]);
  

  // Start/reset timer on each new question
  useEffect(() => {
    //reset
    setRemainingTime(MAX_TIME);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setRemainingTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          //time is up
          submitAnswer(null, MAX_TIME);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    //cleanup on unmount or question change
    return () => {
      if (timerRef.current !== undefined) clearInterval(timerRef.current);
    };
  }, [currentIndex, categoryIndex, currentQuestions]);

  
  /* 2) Unified submit function */ 
  const submitAnswer = (selected: string | null, timeElapsed: number) => {
    if (currentIndex < 0 || currentIndex >= currentQuestions.length) {
      return;
    }

    const question = currentQuestions[currentIndex];
    // Post the answer to the server and verify it.
    fetch('http://127.0.0.1:5000/api/quiz/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: question.id, 
        category: categories[categoryIndex], 
        timeElapsed,
        selected 
      })
    })
    .then(r => {
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      return r.json();
    })
    .then(data => {
      //update score from server
      setScore(data.score);

      // Show feedback based on the server's response.
      setFeedback(
        data.reason === 'timeout' ?
        `Time's up!`
        : data.correct ? 
        'Correct!' 
        : 'Wrong!'
      );

      // After a short delay (0.5s), clear feedback and move to the next question.
      setTimeout(() => {
        setFeedback(null);
        advance();
      }, 500);
    })
    .catch(error => {
      console.error('Error verifying answer:', error)
      // even on error, advance quiz
      setTimeout(advance, 500);
    });
  };


  const advance = () => {
    // increment current question index
    const nextQ = currentIndex + 1;
    setQuestionsLeft(questionsLeft - 1);
    // if they are still some questions left in the current category, continue
    if (nextQ < currentQuestions.length) {
      setCurrentIndex(nextQ);
    } else {
      // if we're at the end of the current category, move to the next one
      const nextCat = categoryIndex + 1;
      if (filtered && nextCat < categories.length) {
        setCategoryIndex(nextCat);
        setCurrentQuestions(filtered[categories[nextCat]]);
        setCurrentIndex(0);
      } else {
        setQuizCompleted(true);
      }
    }
  };


  // Function to handle when user clicked on an answer.
  const handleAnswerClick = (selected: string) => {
    const elapsed = MAX_TIME - remainingTime;
    submitAnswer(selected, elapsed);
  };


  /* 3) Render conditions */
  // While the questions are still loading.
  if (!filtered || !categories.length|| !currentQuestions.length) {
    return <div>Loading…</div>;
  }

  // Check if the quiz is completed.
  if (quizCompleted) return (
    <div>
      🎉 Quiz Completed! 🎉
      <br/>
      Your final score: {score}
    </div>
  );

  // Get the current question.
  const currentQuestion = currentQuestions[currentIndex];
  const currentCategory = categories[categoryIndex];

  return (
    <div>
      <div>
        <strong>Category:</strong> {currentCategory} <br/>
        <strong>Score:</strong> {score} <br/>
        <strong>Questions left:</strong> {questionsLeft}
      </div>
      <h2>{currentQuestion.question}</h2>
      {remainingTime != Infinity && <div>Time left : {remainingTime}s</div>}
      <ul>
        {currentQuestion.choices.map((c, i) => (
          <li key={i}>
            <button onClick={() => handleAnswerClick(c)} disabled={!!feedback}>
              {c}
            </button>
          </li>
        ))}
      </ul>
      {feedback && <p>{feedback}</p>}
    </div>
  );
}

export default QuizComponent;

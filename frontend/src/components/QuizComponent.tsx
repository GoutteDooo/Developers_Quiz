import React, { useEffect, useRef, useState } from 'react';

// Define a type for a single quiz question.
interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  // The correct answer is kept only on the backend for verification.
}

// Define a type for the entire quiz data organized by categories.
interface QuizData {
  [category: string]: QuizQuestion[];
}

const MAX_TIME = 20;

function QuizComponent() {
  // State to store the complete quiz data from the server.
  const [quizData, setQuizData] = useState<QuizData | null>(null);
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

  //Timer state
  const [remainingTime, setRemainingTime] = useState(MAX_TIME);
  const timerRef = useRef<number>();

  /* 1) Fetch and Initialize */
  useEffect(() => {
    // Fetch the quiz data from your Flask API.
    fetch('http://127.0.0.1:5000/api/quiz')
    .then(r => r.json())
    .then((data: QuizData) => {
      setQuizData(data);
      const cats = Object.keys(data);
      setCategories(cats);

      //fill the currentQuestions state with the first question of the first category
      // Here, it is : "CSS"
      if (cats.length > 0) {
        setCurrentQuestions(data[cats[0]]);
      }
    })
    .catch(error => console.error('Error fetching quiz data:', error));
  }, []);


  // Start/reset timer on each new question
  useEffect(() => {
    //reset
    setRemainingTime(MAX_TIME);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
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
  }, [currentIndex, categoryIndex]);

  /* 2) Unified submit function */ 
  const submitAnswer = (selected: string | null, timeElapsed: number) => {
    // stop timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    const question = currentQuestions[currentIndex];
    // Post the answer to the server and verify it.
    fetch('http://127.0.0.1:5000/api/quiz/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: question.id, 
        category: categories[categoryIndex], 
        timeElapsed,
        selected 
      })
    })
    .then(response => response.json())
    .then(data => {
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

        const nextQuestion = currentIndex + 1;
        //If more questions in this category, just advance
        if (nextQuestion < currentQuestions.length) {
          setCurrentIndex(nextQuestion);
        } else {
          //Otherwise, move to next category
          const nextCat = categoryIndex + 1;
          if (nextCat < categories.length) {
            setCategoryIndex(nextCat);
            setCurrentQuestions(quizData[categories[nextCat]]);
            setCurrentIndex(0);
          } else {
            //If no more categories, Quiz done.
            setQuizCompleted(true);
          }
        }
      }, 500);
    })
    .catch(error => console.error('Error verifying answer:', error));
  };

  // Function to handle when user clicked on an answer.
  const handleAnswerClick = (selected: string) => {
    const elapsed = MAX_TIME - remainingTime;
    submitAnswer(selected, elapsed);
  };

  /* 3) Render conditions */
  // While the questions are still loading.
  if (!quizData || !categories.length|| !currentQuestions.length) {
    return <div>Loading…</div>;
  }

  // Check if the quiz is completed.
  if (quizCompleted) return <div>🎉 Quiz Completed! 🎉</div>;

  // Get the current question.
  const currentQuestion = currentQuestions[currentIndex];
  const currentCategory = categories[categoryIndex];

  return (
    <div>
      <h3><em>Category : {currentCategory}</em></h3>
      <h2>{currentQuestion.question}</h2>
      <div>Time left: {remainingTime}</div>
      <ul>
        {currentQuestion.choices.map((choice, index) => (
          <li key={index}>
            <button onClick={() => handleAnswerClick(choice)}>
              {choice}
            </button>
          </li>
        ))}
      </ul>
      {/* Display the feedback message if it exists */}
      {feedback && <h3>{feedback}</h3>}
    </div>
  );
}

export default QuizComponent;

import React, { useEffect, useState } from 'react';

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


  /* 2) Handle the answers */
  // Function to handle when user clicked on an answer.
  const handleAnswerClick = (selectedAnswer: string) => {
    // Ensure there is a current question.
    if (!currentQuestions[currentIndex]) return;
    const question = currentQuestions[currentIndex];

    // Post the answer to the server and verify it.
    fetch('http://127.0.0.1:5000/api/quiz/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: question.id, category: categories[categoryIndex], selected: selectedAnswer })
    })
    .then(response => response.json())
    .then(data => {
      // Show feedback based on the server's response.
      setFeedback(data.correct ? 'Correct answer!' : 'Wrong answer.');
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

  /* 3) Render conditions */
  // While the questions are still loading.
  if (!quizData || categories.length === 0 || currentQuestions.length === 0) {
    return <div>Loading…</div>;
  }

  // Check if the quiz is completed.
  if (quizCompleted) {
    return <div>🎉 Quiz Completed! 🎉</div>;
  }

  // Get the current question.
  const currentQuestion = currentQuestions[currentIndex];
  const currentCategory = categories[categoryIndex];

  return (
    <div>
      <h3><em>Category : {currentCategory}</em></h3>
      <h2>{currentQuestion.question}</h2>
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

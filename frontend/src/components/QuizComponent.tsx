import { useEffect, useState } from 'react';

// Define a type for a single quiz question.
interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  // The correct answer is kept only on the backend for verification.
}

// Define a type for the entire quiz data organized by categories.
interface QuizData {
  HTML: QuizQuestion[];
  CSS: QuizQuestion[];
  // You can add more categories if needed.
}

function QuizComponent() {
  // State to store the complete quiz data from the server.
  const [, setQuizData] = useState<QuizData | null>(null);
  // State to store the questions for the chosen category.
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  // The index of the currently displayed question.
  const [currentIndex, setCurrentIndex] = useState(0);
  // Feedback message to display whether the answer was correct or incorrect.
  const [feedback, setFeedback] = useState<string | null>(null);

  /* INITIALIZATION OF quizData STATE */
  useEffect(() => {
    // Fetch the quiz data from your Flask API.
    fetch('http://127.0.0.1:5000/api/quiz')
      .then(response => response.json())
      .then((data: QuizData) => {
        setQuizData(data);
        // Here we choose the "HTML" category. You could allow the user to choose the category later.
        if (data.HTML && data.HTML.length > 0) {
          setCurrentQuestions(data.HTML);
        } else {
          // As a fallback, combine questions from all categories.
          const allQuestions: QuizQuestion[] = [];
          Object.values(data).forEach((questions) => {
            allQuestions.push(...questions);
          });
          setCurrentQuestions(allQuestions);
        }
      })
      .catch(error => console.error('Error fetching quiz data:', error));
  }, []);


  // Function to handle when an answer is selected.
  const handleAnswerClick = (selectedAnswer: string) => {
    // Ensure there is a current question.
    if (!currentQuestions[currentIndex]) return;
    
    // Get the current question id.
    const questionId = currentQuestions[currentIndex].id;

    // Verify the answer with the backend.
    fetch('http://127.0.0.1:5000/api/quiz/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionId, selected: selectedAnswer })
    })
      .then(response => response.json())
      .then(data => {
        // Show feedback based on the server's response.
        if (data.correct) {
          setFeedback(`Correct answer!`);
        } else {
          setFeedback("Wrong answer.");
        }
        // After a short delay (0.5s), clear feedback and move to the next question.
        setTimeout(() => {
          setFeedback(null);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 500);
      })
      .catch(error => console.error('Error verifying answer:', error));
  };

  // While the questions are still loading.
  if (currentQuestions.length === 0) return <div>Loading...</div>;

  // Check if the quiz is completed.
  if (currentIndex >= currentQuestions.length) return <div>Quiz Completed!</div>;

  // Get the current question.
  const currentQuestion = currentQuestions[currentIndex];

  return (
    <div>
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

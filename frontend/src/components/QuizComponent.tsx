import React, { useEffect, useState } from 'react';

// Define a type for a single quiz question.
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

// Define a type for the entire data (categories as keys).
interface QuizData {
  HTML: QuizQuestion[];
  CSS: QuizQuestion[];
  // Add more categories if necessary.
}

function QuizComponent() {
  // Stores the entire quiz data.
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  // Stores the list of questions for the chosen category.
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  // Current question index.
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch the quiz data from the backend.
    fetch('http://127.0.0.1:5000/api/quiz')
      .then(response => response.json())
      .then((data: QuizData) => {
        setQuizData(data);
        // For this example, we select the "HTML" category.
        // You could also give your user the ability to choose a category.
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

  // This handler is called when an answer is selected.
  const handleAnswerClick = (selectedAnswer: string) => {
    // Optionally, do any scoring or validation here.
    // For example:
    // if (selectedAnswer === currentQuestions[currentIndex].answer) { score++ }

    // Move to the next question.
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // If questions are still loading.
  if (currentQuestions.length === 0) {
    return <div>Loading...</div>;
  }

  // If the quiz is completed.
  if (currentIndex >= currentQuestions.length) {
    return <div>Quiz Completed!</div>;
  }

  // Get the current question.
  const currentQuestion = currentQuestions[currentIndex];

  return (
    <div>
      <h2>{currentQuestion.question}</h2>
      <ul>
        {currentQuestion.choices.map((choice, index) => (
          <li key={index}>
            {/* Each answer is a button that, when clicked, calls the handler */}
            <button onClick={() => handleAnswerClick(choice)}>
              {choice}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuizComponent;

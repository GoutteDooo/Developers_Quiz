import { useEffect, useState } from 'react';

// Définition des types pour les données du quiz
interface QuizData {
  question: string;
  choices: string[];
  answer: string;
}

function QuizComponent() {
  // État pour stocker le quiz
  const [quiz, setQuiz] = useState<QuizData | null>(null);

  useEffect(() => {
    // Appel à l'API Flask
    fetch('http://127.0.0.1:5000/api/quiz')
      .then(response => response.json())
      .then((data: QuizData) => setQuiz(data))
      .catch(error => console.error('Erreur:', error));
  }, []);

  if (!quiz) {
    return <div>Chargement...</div>;
  }
  

  return (
    <div>
      <h1>{quiz.question}</h1>
      <ul>
        {quiz.choices.map((choice, index) => (
          <li key={index}>{choice}</li>
        ))}
      </ul>
    </div>
  );
}

export default QuizComponent;

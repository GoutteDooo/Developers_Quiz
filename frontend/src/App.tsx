import { useState } from "react";
import Home from './Home';
import QuizComponent from './components/QuizComponent';
import './App.css';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);

  function launchQuiz() {
    setQuizStarted(true);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Quiz App</h2>
      </header>
      <main>
        {quizStarted ? (
          <QuizComponent />
        ) : (
          <Home launchQuiz={launchQuiz} />
        )}
      </main>
    </div>
  );
}

export default App;

import { useState } from "react";
import { Settings } from "./types/settings";
import { QuizData } from "./types/quizData";
import './App.css';

import Home from './Home';
import QuizComponent from './components/QuizComponent';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

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

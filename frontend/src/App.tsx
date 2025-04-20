import { useEffect, useState } from "react";

import { Settings } from "./types/settings";
import { QuizData } from "./types/quizData";

import Home from './Home';
import QuizComponent from './components/QuizComponent';

import './App.css';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/quiz', {
      credentials: 'include'  // send cookie so Flask can reset session
    })
    .then(r => r.json())
    .then((data: QuizData) => {
      setQuizData(data);
    })
    .catch(error => console.error('Error fetching quiz data:', error));
  }, []);

  const handleStart = (s: Settings) => {
    setSettings(s);
    setQuizStarted(true);
  }

  return (
    <div className="App">
      {!quizStarted && quizData && (
        <Home
          categories={Object.keys(quizData)}
          onStart={handleStart}
          maxPerCategory={ quizData }  // so Home can cap the number inputs
        />
      )}
      {quizStarted && quizData && settings && (
        <QuizComponent
          quizData={quizData}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;

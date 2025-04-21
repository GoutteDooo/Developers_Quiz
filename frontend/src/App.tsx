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
  const [quizSettingsData, setQuizSettingsData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/quiz/")
      .then(r => r.json())
      .then((data: Record<string, number>) => {
        setQuizSettingsData(data);
      })
      .catch(console.error);
  }, [])

  const handleStart = (s: Settings) => {
    fetch("http://127.0.0.1:5000/api/quiz/start", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timerPerQuestion: s.timePerQuestion,
      }),
    })
    .then(r => r.json())
    .then((data: QuizData) => {
      setQuizData(data);
      setSettings(s);
      setQuizStarted(true);
    })
    .catch(console.error);
  }

  return (
    <div className="App">
      {!quizStarted && quizSettingsData && (
        <Home
          categories={Object.keys(quizSettingsData)}
          maxPerCategory={quizSettingsData}  // so Home can cap the number inputs
          onStart={handleStart}
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

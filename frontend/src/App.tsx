import { useEffect, useState } from "react";

import { Settings } from "./types/settings";
import { QuizData, QuizSettingsData } from "./types/quizData";

import QuizComponent from './components/QuizComponent';
import ModeSelection from "./components/ModeSelection";
import TrainingSettings from './components/TrainingSettings';
import ChallengeSettings from "./components/ChallengeSettings";

import './App.css';

function App() {
  const [mode, setMode] = useState<'training' | 'challenge' | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizSettingsData, setQuizSettingsData] = useState<QuizSettingsData>({});

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/quiz/")
      .then(r => r.json())
      .then((data: QuizSettingsData) => {
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

  //1. Pick mode
  if (!mode) return <ModeSelection onSelect={setMode} />;
  
  //2. show appropriate settings UI
  if (!quizStarted && quizSettingsData && mode === 'training') {
    return (
        <TrainingSettings
          categories={Object.keys(quizSettingsData)}
          maxPerCategory={quizSettingsData}  // so Home can cap the number inputs
          onStart={handleStart}
        />
    );
  }

  if (!quizStarted && quizSettingsData && mode === 'challenge') {
    return (
      <ChallengeSettings
        categories={Object.keys(quizSettingsData)}
        onStart={handleStart}
      />
    );
  }

  //3. start quiz
  if (quizStarted && quizData && settings) {
    return (
      <QuizComponent
        quizData={quizData}
        settings={settings}
      />
    );
  }
  
  //4. loading...

  return (
    <div className="App">
      <h1>Loading...</h1>
    </div>
  );
}

export default App;

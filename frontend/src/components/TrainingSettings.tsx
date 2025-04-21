import { useState } from "react";
import { Settings } from "../types/settings";
import { QuizSettingsData } from "../types/quizData";

interface TrainingSettingsProps {
  categories: string[];
  maxPerCategory: QuizSettingsData;
  onStart: (s: Settings) => void;
}

const DEFAULT_CATEGORIES = [
  "HTML",
  "CSS",
  "JS",
]

function TrainingSettings({categories, maxPerCategory, onStart }: TrainingSettingsProps) {
  const initialSelected = DEFAULT_CATEGORIES.filter(cat => categories.includes(cat));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
  const [questionsPerCategory, setQuestionsPerCategory] = useState<QuizSettingsData>({});
  const [timePerQuestion, setTimePerQuestion] = useState<number | null>(25);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(s => 
      s.includes(cat) ? s.filter(x=>x!==cat) : [...s,cat]
    );
    // Optionally clear out old counts:
    setQuestionsPerCategory(q => {
      const copy = { ...q };
      delete copy[cat];
      return copy;
    });
  };

  const updateCount = (cat: string, count: number) => {
    setQuestionsPerCategory(q => ({
      ...q,
      [cat]: count
    }));
  };

  const handleSubmit = () => {
    const s: Settings = {
      selectedCategories,
      questionsPerCategory: selectedCategories.reduce((acc, cat) => {
        //default to either user's number or available
        acc[cat] = Math.min(
          questionsPerCategory[cat] ?? maxPerCategory[cat], maxPerCategory[cat] 
        );
        return acc;
      }, {} as QuizSettingsData),
      timePerQuestion: timerEnabled ? timePerQuestion : null,
    };
    console.log("settings", s);
    
    onStart(s);
  }

  return (
    <div>
      <h2>Training Settings</h2>
      <fieldset>
        <legend>Select themes & # questions</legend>
        {categories.map((cat) => (
          <div key={cat} className="category">
            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                
              />
              {cat}
            </label>
            {selectedCategories.includes(cat) && (
              <input
                type="number"
                min={1}
                max={maxPerCategory[cat]}
                value={questionsPerCategory[cat] ?? maxPerCategory[cat]}
                onChange={e => updateCount(cat, +e.target.value)}
              />
            )}
          <div>
            max = {maxPerCategory[cat]}
          </div>
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend>Timer per question</legend>
        <label>
          <input
            type="checkbox"
            checked={!timerEnabled}
            onChange={e => setTimerEnabled(!e.target.checked)}
          />
          Disable timer
        </label>
        {timerEnabled && (
          <div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={String(timePerQuestion)}
              onChange={e => setTimePerQuestion(+e.target.value)}
            />
            <span>{timePerQuestion}s</span>
          </div>
        )}
      </fieldset>

      <button onClick={handleSubmit} disabled={!selectedCategories.length}>
        Start Training
      </button>
    </div>
  );
}

export default TrainingSettings;
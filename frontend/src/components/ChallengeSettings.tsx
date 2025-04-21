import { Settings } from '../types/settings';

interface ChallengeSettingsProps {
  categories: string[];
  onStart: (settings: Settings) => void;
}

const questionCounts = {
  easy: 3,
  medium: 5,
  hard: 8,
} as const;

export default function ChallengeSettings({
  categories,
  onStart
}: ChallengeSettingsProps) {

  function start(difficulty: keyof typeof questionCounts) {
    const perCat = questionCounts[difficulty];
    // build a per‑category mapping
    const questionsPerCategory: Record<string, number> = {};
    categories.forEach(cat => {
      questionsPerCategory[cat] = perCat;
    });

    const settings: Settings = {
      selectedCategories: categories,
      questionsPerCategory,
      timePerQuestion: 20  // or choose a fixed time, or null to disable
    };
    onStart(settings);
  }

  return (
    <div>
      <h2>Challenge Mode</h2>
      <p>All categories, fixed number of questions:</p>
      <button onClick={() => start('easy')}>
        Easy: 30 questions (3 × each)
      </button>
      <button onClick={() => start('medium')}>
        Medium: 50 questions (5 × each)
      </button>
      <button onClick={() => start('hard')}>
        Hard: 80 questions (8 × each)
      </button>
    </div>
  );
}

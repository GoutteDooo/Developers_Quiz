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
      <p>All categories, fixed number of questions and 20 seconds per question.</p>
      <p>Your score will be registered.</p>
      <button onClick={() => start('easy')}>
        Easy: {questionCounts.easy * categories.length} questions (3 x each)
      </button>
      <button onClick={() => start('medium')}>
        Medium: {questionCounts.medium * categories.length} questions (5 × each)
      </button>
      <button onClick={() => start('hard')}>
        Hard: {questionCounts.hard * categories.length} questions (8 × each)
      </button>
    </div>
  );
}

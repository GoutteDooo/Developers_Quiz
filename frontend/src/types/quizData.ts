
// Define a type for a single quiz question.
export interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  // The correct answer is kept only on the backend for verification.
}

// Define a type for the entire quiz data organized by categories.
export interface QuizData {
  [category: string]: QuizQuestion[];
}

export interface QuizSettingsData {
  [category: string]: number;
}
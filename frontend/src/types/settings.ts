export interface Settings {
  selectedCategory: string[]; // e.g. ['CSS', 'JavaScript']  
  questionsPerCategory: { [category: string]: number }; // how many from each
  timePerQuestion: number | null; // seconds, or null = no time limit
}
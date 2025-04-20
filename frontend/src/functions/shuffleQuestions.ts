// Fisher–Yates shuffle in place
export default function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffle only the first three items, leave the rest (e.g. the 4th) intact
export function shuffleFirstThree<T>(choices: T[]): T[] {
  // clone so we don’t mutate original state
  const head = choices.slice(0, 3);
  const tail = choices.slice(3);
  shuffleArray(head);
  return [...head, ...tail];
}
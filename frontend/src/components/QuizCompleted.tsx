interface QuizCompletedProps {
  score: number;
  totalQuestions: number;
}
export default function QuizCompleted(
  { score, totalQuestions }: QuizCompletedProps
) {
  return (
    <div>
      🎉 Quiz Completed! 🎉
      <br/>
      Your final score: {score} / {totalQuestions}
    </div>
  )
}

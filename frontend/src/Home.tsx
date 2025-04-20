interface HomeProps {
  launchQuiz: () => void;
}

function Home({ launchQuiz }: HomeProps) {

    return (
      <button onClick={launchQuiz}>Launch Quiz</button>
    )
}

export default Home;
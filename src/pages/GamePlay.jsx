import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import Sidebar from "../components/Sidebar";

import MultipleChoice from "../components/minigames/MultipleChoice";
import TypingGame from "../components/minigames/TypingGame";
import TrueFalse from "../components/minigames/TrueFalse";
import DragDropGame from "../components/minigames/DragDropGame";

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(40);

  const timerRef = useRef(null);

  useEffect(() => {
    loadLevel();
  }, [id]);

  const loadLevel = async () => {
    const res = await apiGet(`/game/level/${id}`);
    setLevel(res.level);
    setQuestions(res.questions || []);
    setIndex(0);
    setLives(5);
    setScore(0);
  };

  // TIMER
  useEffect(() => {
    if (!feedback) {
      setTimeLeft(40);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleWrong();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [index, feedback]);

  const handleCorrect = () => {
    clearInterval(timerRef.current);
    setFeedback("correct");
    setScore((s) => s + 100);

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) setIndex(index + 1);
      else finishGame();
    }, 1200);
  };

  const handleWrong = () => {
    clearInterval(timerRef.current);
    setFeedback("wrong");
    setLives((l) => {
      const newLives = l - 1;
      if (newLives <= 0) setTimeout(finishGame, 1200);
      else
        setTimeout(() => {
          setFeedback(null);
          setIndex((i) => i + 1);
        }, 1200);
      return newLives;
    });
  };

  const finishGame = () => {
    setResult({
      scorePercent: Math.round((score / (questions.length * 100)) * 100),
      gainedXp: Math.round(score / 20),
    });
  };

  // 🎮 GAME SWITCHER
  const renderGame = () => {
    const q = questions[index];

    const props = {
      question: q,
      onCorrect: handleCorrect,
      onWrong: handleWrong,
      disabled: feedback,
    };

    switch (level?.gameType) {
      case "mcq":
        return <MultipleChoice {...props} />;
      case "typing":
        return <TypingGame {...props} />;
      case "truefalse":
        return <TrueFalse {...props} />;
      case "dragdrop":
        return <DragDropGame {...props} />;
      default:
        return <MultipleChoice {...props} />;
    }
  };

  if (!level) return <div style={{ padding: 100 }}>Loading...</div>;

  const q = questions[index];

  return (
    <div style={{ padding: 20 }}>
      <h2>Level {level.levelNumber}</h2>
      <div>⏱ {timeLeft}s | ❤️ {lives} | Score {score}</div>

      <h3>{q?.content}</h3>

      {feedback && (
        <div>
          {feedback === "correct" ? "✅ Benar!" : "❌ Salah!"}
        </div>
      )}

      {!feedback && renderGame()}

      {result && (
        <div>
          <h2>Finish!</h2>
          <p>{result.scorePercent}%</p>
          <button onClick={() => navigate("/game")}>
            Kembali
          </button>
        </div>
      )}
    </div>
  );
}
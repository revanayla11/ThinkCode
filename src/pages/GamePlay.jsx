import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import Sidebar from "../components/Sidebar";

import MultipleChoice from "./minigames/MultipleChoice";
import TypingGame from "./minigames/TypingGame";
import TrueFalse from "./minigames/TrueFalse";
import DragDropGame from "./minigames/DragDropGame";

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

// Di GamePlay.jsx - tambah di finishGame():
const finishGame = async () => {
  try {
    // 🔥 KIRIM KE BACKEND
    const res = await apiPost(`/game/submit/${id}`, {
      answers: questions.map((q, idx) => ({
        questionId: q.id,
        answer: 'auto-calculated' // Frontend hitung sendiri
      })),
      scorePercent: Math.round((score / (questions.length * 100)) * 100)
    });
    
    setResult({
      scorePercent: res.data.scorePercent,
      gainedXp: res.data.rewardXp,
      totalXp: res.data.totalXp,
      hearts: res.data.hearts
    });
  } catch (err) {
    console.error("Submit error:", err);
    setResult({
      scorePercent: Math.round((score / (questions.length * 100)) * 100),
      gainedXp: Math.round(score / 20)
    });
  }
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

  // Tambahkan di akhir GamePlay.jsx sebelum return:
{result && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 1000,
    padding: '2rem'
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '4rem 3rem',
      borderRadius: '32px',
      textAlign: 'center',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      maxWidth: '500px',
      width: '90%'
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
        {result.scorePercent >= 60 ? '🎉' : '📚'}
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800' }}>
        {result.scorePercent}%
      </h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9, marginBottom: '2rem' }}>
        +{result.gainedXp} XP
      </p>
      <button 
        onClick={() => navigate("/game")}
        style={{
          padding: '1.5rem 4rem',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.2rem',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}
      >
        🎮 Main Lagi
      </button>
    </div>
  </div>
)}

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
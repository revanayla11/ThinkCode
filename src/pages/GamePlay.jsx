import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";

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
  const [loading, setLoading] = useState(true);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctRef = useRef(0);
  const hasAnsweredRef = useRef(false);

  const timerRef = useRef(null);

  useEffect(() => {
    loadLevel();
  }, [id]);

  const loadLevel = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/game/level/${id}`);
      if (res.status) {
        setLevel(res.level);
        setQuestions(res.questions || []);
        setIndex(0);
        setLives(5);
        setScore(0);
        correctRef.current = 0;
        setFeedback(null);
        setResult(null);
      }
    } catch (error) {
      console.error("Load level error:", error);
      navigate("/game");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }

  if (
    loading ||
    !questions.length ||
    feedback ||
    result ||
    isGameFinished
  ) return;

  setTimeLeft(40);

  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        handleWrong("timeout");
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [index, feedback, result, loading, questions.length, isGameFinished]);

useEffect(() => {
  hasAnsweredRef.current = false;
}, [index]);

const handleCorrect = () => {
  // 🛑 CEGAH DOUBLE CLICK / DOUBLE TRIGGER
  if (isGameFinished || hasAnsweredRef.current) return;

  hasAnsweredRef.current = true;

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  correctRef.current += 1;
  setScore((s) => s + 100);

  // 🔥 SOAL TERAKHIR
  if (index === questions.length - 1) {
    setFeedback("correct");

    setTimeout(() => {
      finishGame();
    }, 300); // kasih sedikit delay biar UI smooth

    return;
  }

  setFeedback("correct");

  setTimeout(() => {
    setFeedback(null);
    setIndex((prev) => prev + 1);
  }, 500);
};

const handleWrong = (reason = "wrong") => {
  if (isGameFinished) return;

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  setFeedback(reason);

  setLives((l) => {
    const newLives = l - 1;

    if (newLives <= 0) {
      setTimeout(() => finishGame(), 500);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setIndex((prev) => prev + 1);
      }, 500);
    }

    return newLives;
  });
};

const nextQuestion = () => {
  if (index + 1 < questions.length) {
    setIndex((prev) => prev + 1);
  } else {
    finishGame(); // langsung finish tanpa delay
  }
};

const finishGame = async () => {
  if (isGameFinished) return;
  setIsGameFinished(true);

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const totalQuestions = questions.length;
  const correctAnswers = correctRef.current;
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
  const heartsUsed = 5 - lives;

  console.log("🎯 FINAL:", { correctAnswers, scorePercent });

  try {
    // ✅ SESUAI ROUTE: /game/submit/:id
    const res = await apiPost(`/game/submit/${id}`, {
      scorePercent,
      totalQuestions,
      correctAnswers,
      heartsUsed
    });

    console.log("✅ BACKEND RESPONSE:", res.data);
    
    if (res.status) {
      setResult({
        scorePercent: res.data.scorePercent,
        gainedXp: res.data.rewardXp,
        hearts: res.data.hearts,
        completed: res.data.completed,
        isFirstCompletion: res.data.isFirstCompletion
      });
    }
  } catch (err) {
    console.error("💥 SUBMIT ERROR:", err.response?.data || err.message);
    
    // Fallback - show result meski API error
    setResult({
      scorePercent,
      gainedXp: 0,
      hearts: lives,
      completed: scorePercent >= 80,
      isFirstCompletion: true
    });
  }
};

  const renderGame = () => {
    if (!questions[index]) return null;
    const props = {
      question: questions[index],
      onCorrect: handleCorrect,
      onWrong: handleWrong,
      disabled: !!feedback || !!result
    };

    switch (level?.gameType) {
      case "mcq": return <MultipleChoice {...props} />;
      case "typing": return <TypingGame {...props} />;
      case "truefalse": return <TrueFalse {...props} />;
      case "dragdrop": return <DragDropGame {...props} />;
      default: return <MultipleChoice {...props} />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ textAlign: 'center', color: 'white', fontSize: '2rem' }}>
            🎮 Loading Level...
          </div>
        </div>
      </Layout>
    );
  }

  if (!level || !questions.length) {
    return (
      <Layout>
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Level tidak ditemukan 😔</h2>
          <button 
            onClick={() => navigate("/game")}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            ← Kembali ke Map
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '280px', padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h1 style={{ 
                margin: 0, fontSize: '2.5rem', 
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}>
                Level {level.levelNumber}
              </h1>
              <span style={{
                padding: '0.5rem 1rem',
                background: `var(--game-${level.gameType})`,
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {level.gameType}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '1.3rem', color: '#6b7280', fontWeight: '600' }}>
              <span>⏱️ {timeLeft}s</span>
              <span>❤️ {lives}/5</span>
              <span>📊 {score} pts</span>
              <span>❓ {index + 1}/{questions.length}</span>
            </div>
          </div>

          {feedback && (
            <div style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '2rem 4rem',
              fontSize: '2.5rem',
              fontWeight: '800',
              borderRadius: '24px',
              zIndex: 100,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              {feedback === "correct" ? (
                <span style={{ color: '#10b981' }}>✅ BENAR!</span>
              ) : feedback === "timeout" ? (
                <span style={{ color: '#f59e0b' }}>⏰ Waktu Habis!</span>
              ) : (
                <span style={{ color: '#ef4444' }}>❌ SALAH!</span>
              )}
            </div>
          )}

          <div style={{ height: '600px' }}>
            {!feedback && !result && renderGame()}
          </div>

          {result && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}>
              <div style={{
                background: result.completed 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '4rem 3rem',
                borderRadius: '32px',
                textAlign: 'center',
                color: 'white',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
              }}>
                <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
                  {result.completed ? '🎉' : '📚'}
                </div>
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: '900' }}>
                  {result.scorePercent}%
                </h1>
                <div style={{ fontSize: '1.5rem', opacity: 0.95, marginBottom: '2.5rem' }}>
                  {result.isFirstCompletion ? `+${result.gainedXp} XP` : '💎 Sudah selesai sebelumnya'}
                  <br />❤️ {result.hearts} tersisa
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => navigate("/game")}
                    style={{
                      padding: '1.2rem 2.5rem',
                      background: 'white',
                      color: result.completed ? '#10b981' : '#f59e0b',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                      minWidth: '140px'
                    }}
                  >
                    🎮 Map Game
                  </button>
                  <button 
                    onClick={loadLevel}
                    style={{
                      padding: '1.2rem 2.5rem',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      minWidth: '140px'
                    }}
                  >
                    🔄 Ulangi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
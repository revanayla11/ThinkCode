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

  // 🔥 ALL STATES
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
  const [isProcessing, setIsProcessing] = useState(false); // UI blocking only
  
  // 🔥 REFS
  const correctRef = useRef(0);
  const hasAnsweredRef = useRef(false);
  const timerRef = useRef(null);

  // 🔥 LOAD LEVEL
  useEffect(() => {
    loadLevel();
  }, [id]);

 const loadLevel = async () => {
  try {
    setLoading(true);
    const res = await apiGet(`/game/level/${id}`);
    
    if (!res.status || !res.hasQuestions || res.questions?.length === 0) {
      // 🔥 STOP GAME - SOAL HABIS!
      setResult({
        scorePercent: 0,
        gainedXp: 0,
        hearts: lives,
        completed: false,
        message: "Tidak ada soal di level ini 😔"
      });
      setIsGameFinished(true);
      setLoading(false);
      return;
    }

    // Normal flow
    setLevel(res.level);
    setQuestions(res.questions);
    setIndex(0);
    setLives(5);
    setScore(0);
    correctRef.current = 0;
    setIsGameFinished(false);
  } catch (error) {
    console.error("Load error:", error);
    navigate("/game");
  } finally {
    setLoading(false);
  }
};

  // 🔥 TIMER LOGIC
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (
      loading ||
      index >= questions.length ||
      !questions.length ||
      feedback ||
      result ||
      isGameFinished ||
      isProcessing
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
  }, [index, feedback, result, loading, questions.length, isGameFinished, isProcessing]);

  // 🔥 RESET ANSWER STATE
  useEffect(() => {
    hasAnsweredRef.current = false;
  }, [index]);

  // 🔥 SMOOTH CORRECT - NO BLOCKING API
  const handleCorrect = () => {
    if (isGameFinished || hasAnsweredRef.current || isProcessing) {
      console.log('Correct blocked:', { isGameFinished, hasAnsweredRef: hasAnsweredRef.current, isProcessing });
      return;
    }

    console.log('✅ Correct!');

    hasAnsweredRef.current = true;
    setIsProcessing(true); // UI feedback only

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    correctRef.current += 1;
    setScore((s) => s + 100);
    setCorrectCount(correctRef.current);

    // 🔥 NO API CALL - INSTANT!
    console.log(`Score: ${score + 100} | Correct: ${correctRef.current}/${questions.length}`);

    // SOAL TERAKHIR?
    if (index === questions.length - 1) {
      setFeedback("correct");
      setTimeout(() => {
        finishGame();
        setIsProcessing(false);
      }, 1000);
      return;
    }

    // NORMAL FLOW
    setFeedback("correct");
    setTimeout(() => {
      setFeedback(null);
      setIndex((prev) => prev + 1);
      setIsProcessing(false);
    }, 1200);
  };

  // 🔥 SMOOTH WRONG - NO BLOCKING API  
  const handleWrong = (reason = "wrong") => {
  if (isGameFinished || isProcessing) return;

  setIsProcessing(true);
  clearInterval(timerRef.current);

  setFeedback(reason);

  setLives((prevLives) => {
    const newLives = prevLives - 1;
    
    setTimeout(() => {
      if (newLives <= 0) {
        // 🔥 GAME OVER - STOP!
        setFeedback(null);
        setIsGameFinished(true);
        setResult({
          scorePercent: Math.round((correctRef.current / questions.length) * 100),
          gainedXp: 0,
          hearts: 0,
          completed: false,
          gameOver: true
        });
      } else {
        // Lanjut soal (cek ada soal ga!)
        if (index + 1 < questions.length) {
          setFeedback(null);
          setIndex(prev => prev + 1);
        } else {
          // 🔥 SOAL HABIS!
          finishGame();
        }
      }
      setIsProcessing(false);
    }, 1500);

    return newLives;
  });
};

  // 🔥 FINAL SUBMIT (satu-satunya API call)
  const finishGame = async () => {
    if (isGameFinished) return;
    setIsGameFinished(true);
    setIsProcessing(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const totalQuestions = questions.length;
    const correctAnswers = correctRef.current;
    const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
    const heartsUsed = 5 - lives;

    console.log("🚀 FINISH GAME:", { id, scorePercent, correctAnswers, heartsUsed });

    try {
      const res = await apiPost(`/game/level/${id}/submit`, {
        scorePercent,
        totalQuestions,
        correctAnswers,
        heartsUsed
      });
      
      console.log("✅ SUBMIT SUCCESS:", res);
      
      if (res.status) {
        setResult({
          scorePercent: res.data.scorePercent || scorePercent,
          gainedXp: res.data.rewardXp || 0,
          hearts: res.data.hearts || lives,
          completed: res.data.completed || (scorePercent >= 70),
          isFirstCompletion: res.data.isFirstCompletion || true
        });
      }
    } catch (err) {
      console.error("💥 SUBMIT ERROR:", err);
      // FALLBACK UI - game tetep jalan!
      setResult({
        scorePercent,
        gainedXp: Math.floor(scorePercent / 10),
        hearts: lives,
        completed: scorePercent >= 70,
        isFirstCompletion: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔥 RENDER GAME
  const renderGame = () => {
    if (!questions[index] || index >= questions.length) {
    console.log("📭 No question at index:", index, "Total:", questions.length);
    finishGame(); // Auto finish
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h3>📭 Soal habis!</h3>
    </div>;
  }
    
    const props = {
      question: questions[index],
      onCorrect: handleCorrect,
      onWrong: handleWrong,
      disabled: isProcessing || !!result,
      isProcessing // Pass ke semua games
    };

    switch (level?.gameType) {
      case "mcq": return <MultipleChoice {...props} />;
      case "typing": return <TypingGame {...props} />;
      case "truefalse": return <TrueFalse {...props} />;
      case "dragdrop": return <DragDropGame {...props} />;
      default: return <MultipleChoice {...props} />;
    }
  };

  // 🔥 LOADING SCREEN
  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '80vh', fontSize: '2rem', color: '#374151'
        }}>
          🎮 Loading Level...
        </div>
      </Layout>
    );
  }

  // 🔥 ERROR SCREEN
  if (!level || !questions.length) {
    return (
      <Layout>
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2 style={{ color: '#6b7280' }}>Level tidak ditemukan 😔</h2>
          <button 
            onClick={() => navigate("/game")}
            style={{
              padding: '12px 24px', background: '#10b981', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '1.1rem',
              cursor: 'pointer', marginTop: '1rem'
            }}
          >
            ← Kembali ke Map
          </button>
        </div>
      </Layout>
    );
  }

  // 🔥 MAIN UI
  return (
    <Layout>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, marginLeft: '280px', 
          padding: '2rem', maxWidth: '1000px', margin: '0 auto' 
        }}>
          
          {/* 🔥 HEADER */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              marginBottom: '1rem' 
            }}>
              <h1 style={{ 
                margin: 0, fontSize: '2.5rem', 
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}>
                Level {level.levelNumber}
              </h1>
              <span style={{
                padding: '0.5rem 1rem', background: `var(--game-${level.gameType})`,
                color: 'black', borderRadius: '20px', fontSize: '0.9rem',
                fontWeight: '700', textTransform: 'uppercase'
              }}>
                {level.gameType?.toUpperCase()}
              </span>
            </div>
            <div style={{ 
              display: 'flex', gap: '2rem', fontSize: '1.3rem', 
              color: '#6b7280', fontWeight: '600' 
            }}>
              <span>⏱️ {timeLeft}s</span>
              <span>❤️ {lives}/5</span>
              <span>📊 {score} pts</span>
              <span>❓ {index + 1}/{questions.length}</span>
              {isProcessing && <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>⏳ Processing...</span>}
            </div>
          </div>

          {/* 🔥 FEEDBACK NOTIF - SELALU VISIBLE */}
          {feedback && (
            <div style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
              padding: '1.2rem 2rem', fontSize: '1.3rem', fontWeight: '800',
              borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              animation: 'popIn 0.4s ease-out'
            }}>
              {feedback === "correct" ? (
                <span style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px',
                  display: 'inline-block'
                }}>✅ BENAR +100!</span>
              ) : feedback === "timeout" ? (
                <span style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px',
                  display: 'inline-block'
                }}>⏰ Waktu Habis!</span>
              ) : (
                <span style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px',
                  display: 'inline-block'
                }}>❌ SALAH -1❤️</span>
              )}
            </div>
          )}

          {/* 🔥 GAME CANVAS - SELALU VISIBLE */}
          <div style={{ height: '600px', position: 'relative' }}>
            {renderGame()}
          </div>

          {/* 🔥 RESULT MODAL */}
          {result && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 2000, padding: '2rem'
            }}>
              <div style={{
                background: result.completed 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '4rem 3rem', borderRadius: '32px', textAlign: 'center',
                color: 'white', maxWidth: '500px', width: '90%',
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
                      padding: '1.2rem 2.5rem', background: 'white',
                      color: result.completed ? '#10b981' : '#f59e0b', border: 'none',
                      borderRadius: '50px', fontSize: '1.1rem', fontWeight: '700',
                      cursor: 'pointer', boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                      minWidth: '140px'
                    }}
                  >
                    🎮 Map Game
                  </button>
                  <button 
                    onClick={loadLevel}
                    style={{
                      padding: '1.2rem 2.5rem', background: 'rgba(255,255,255,0.2)',
                      color: 'white', border: '2px solid white', borderRadius: '50px',
                      fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer',
                      backdropFilter: 'blur(10px)', minWidth: '140px'
                    }}
                  >
                    🔄 Main Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 ANIMATIONS */}
          <style jsx>{`
            @keyframes popIn {
              0% { transform: scale(0.7) translateX(100%); opacity: 0; }
              50% { transform: scale(1.05) translateX(-5%); }
              100% { transform: scale(1) translateX(0); opacity: 1; }
            }
          `}</style>

        </div>
      </div>
    </Layout>
  );
}
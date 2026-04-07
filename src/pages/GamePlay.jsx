import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [showParts, setShowParts] = useState({
    hat: true, badge: true, gun: true, boots: true
  });
  const [timeLeft, setTimeLeft] = useState(45); // ✅ WAKTU 45 DETIK

  const questionTimerRef = useRef(null);

  useEffect(() => {
    loadLevel();
    return () => clearInterval(questionTimerRef.current);
  }, [id]);

  const loadLevel = async () => {
    try {
      const res = await apiGet(`/game/level/${id}`);
      if (!res.status) throw new Error("Load gagal");

      setLevel(res.level);
      setQuestions(res.questions || []);
      setIndex(0);
      setLives(5);
      setScore(0);
      setResult(null);
      setShowParts({ hat: true, badge: true, gun: true, boots: true });
      setTimeLeft(45);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat level");
    }
  };

  // ✅ TIMER YANG STABIL
  useEffect(() => {
    if (index < questions.length && lives > 0 && !feedback) {
      setTimeLeft(45);
      questionTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current);
            handleWrongAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(questionTimerRef.current);
  }, [index, lives, feedback]);

  const motivationMessages = {
    correct: [
      "🤠 Sheriff selamat! Mantap banget! 🚀",
      "💥 Perfect shot! Kamu penutup bandit! 🎯",
      "⭐ Hebat! Sheriff makin gagah! 🔥",
      "⚡ Yes! Bandit kabur ketakutan! 💪"
    ],
    wrong: [
      "💔 Sheriff kehilangan aksesoris! Coba lagi! 💪",
      "😱 Bandit nyaris menang! Lawan balik! ⚔️",
      "❌ Sheriff masih kuat! Jangan menyerah! 🌟",
      "⚠️ Satu bagian hilang! Selamatkan dia! 🛡️"
    ],
    victory: [
      "🏆 SHERIFF SELAMAT 100%! KAMU LEGENDA! 🔥",
      "⭐ PERFECT RESCUE! Bandit hancur total! 🎉",
      "💎 HERO OF THE WEST! Tak ada tandingan! 🤠",
      "⚡ ULTIMATE COWBOY! Sheriff abadi! 🌟"
    ]
  };

  const handleCorrectAnswer = () => {
    clearInterval(questionTimerRef.current);
    setFeedback("correct");
    setScore(prev => prev + 100);
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex(prev => prev + 1);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const handleWrongAnswer = () => {
    clearInterval(questionTimerRef.current);
    setFeedback("wrong");
    const parts = ['hat', 'badge', 'gun', 'boots'];
    const lostPart = parts[lives - 1];
    setShowParts(prev => ({ ...prev, [lostPart]: false }));
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => finishGame(), 2000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          if (index + 1 < questions.length) {
            setIndex(prev => prev + 1);
          }
        }, 2000);
      }
      return newLives;
    });
  };

  const renderAnswerButtons = () => {
    const q = questions[index];
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px', 
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {q.meta.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (q.type === "mcq") {
                Number(i) === Number(q.meta.answerIndex) ? handleCorrectAnswer() : handleWrongAnswer();
              }
            }}
            disabled={feedback !== null || timeLeft === 0}
            style={{
              padding: '25px 30px',
              border: '4px solid #f3f4f6',
              borderRadius: '25px',
              background: feedback === 'correct' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? 'linear-gradient(135deg, #10b981, #059669)' :
                         timeLeft === 0 ? 'linear-gradient(135deg, #6b7280, #4b5563)' :
                         'white',
              color: feedback === 'correct' || (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? 'white' : '#1e293b',
              cursor: (feedback || timeLeft === 0) ? 'not-allowed' : 'pointer',
              fontSize: '1.3rem',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {feedback === 'correct' && i === Number(q.meta.answerIndex) && (
              <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.5rem' }}>✅</span>
            )}
            {feedback === 'wrong' && i !== Number(q.meta.answerIndex) && (
              <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.5rem', color: '#ef4444' }}>❌</span>
            )}
            {opt}
          </button>
        ))}
      </div>
    );
  };

  const renderGame = () => {
    const q = questions[index];
    
    switch (q.type) {
      case "mcq":
      case "truefalse":
        return renderAnswerButtons();
      
      case "essay":
      case "typing":
        return (
          <>
            <input
              type="text"
              placeholder="Ketik jawaban untuk selamatkan Sheriff! 🤠"
              style={{
                width: '100%', maxWidth: '600px', padding: '25px', 
                border: '4px solid #e5e7eb', borderRadius: '25px', 
                fontSize: '1.4rem', textAlign: 'center', outline: 'none',
                boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                marginBottom: '25px'
              }}
              autoFocus
              disabled={feedback !== null || timeLeft === 0}
            />
            <button 
              disabled={feedback !== null || timeLeft === 0}
              style={{
                padding: '20px 60px', border: 'none', borderRadius: '25px',
                fontSize: '1.4rem', fontWeight: '700', cursor: 'pointer',
                background: timeLeft === 0 ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', boxShadow: '0 15px 40px rgba(245,158,11,0.4)'
              }}
            >
              🚀 Selamatkan Sheriff!
            </button>
          </>
        );
      
      default:
        return <div style={{textAlign: 'center', color: '#64748b', fontSize: '1.4rem'}}>Game type "{q.type}" belum didukung</div>;
    }
  };

  const finishGame = () => {
    const finalScore = Math.round((score / (questions.length * 100)) * 100);
    setResult({ 
      scorePercent: finalScore, 
      score: score, 
      correct: Math.round(finalScore / 10), 
      total: questions.length,
      gainedXp: Math.round(score / 20)
    });
  };

  if (!level) {
    return (
      <div style={{ 
        padding: '100px 30px', 
        textAlign: 'center', 
        color: 'white', 
        fontSize: '1.8rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        🤠 Loading petualangan Sheriff...
      </div>
    );
  }

  const q = questions[index];

  return (
    <div style={{
      fontFamily: 'Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 0',
      position: 'relative'
    }}>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      
      <div style={{
        padding: '20px',
        marginLeft: collapsed ? "70px" : "280px",
        maxWidth: '1000px',
        margin: '0 auto',
        transition: 'margin-left 0.3s'
      }}>
        {/* ✅ STICKY TOP BAR */}
        <div style={{ 
          position: 'sticky',
          top: 20,
          zIndex: 100,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.95)', 
          padding: '25px 35px', 
          borderRadius: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(25px)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 30,
            color: '#1e293b', 
            fontSize: '1.7rem', 
            fontWeight: '700' 
          }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: timeLeft > 20 ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         timeLeft > 10 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                         'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              fontWeight: 'bold'
            }}>
              ⏱️ {timeLeft}s
            </div>
            <div>⭐ {score} XP</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 25 }}>
            <div style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '600' }}>
              Soal {index + 1}/{questions.length}
            </div>
            <button onClick={() => navigate(-1)} style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '25px', 
              padding: '15px 30px', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '1.1rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}>
              ← Kembali
            </button>
          </div>
        </div>

        {/* MAIN GAME CARD */}
        <div style={{ 
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(30px)',
          borderRadius: '40px',
          padding: '50px',
          boxShadow: '0 35px 120px rgba(0,0,0,0.35)',
          border: '3px solid rgba(255,255,255,0.3)',
          maxWidth: '950px',
          margin: '0 auto'
        }}>
          {/* TITLE */}
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '3rem', 
            background: 'linear-gradient(45deg, #1e40af, #3b82f6, #f59e0b)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '15px',
            fontWeight: '800',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            🤠 SAVE THE SHERIFF!
          </h2>

          <div style={{ 
            textAlign: 'center', 
            color: '#64748b', 
            fontSize: '1.5rem', 
            marginBottom: '45px',
            fontWeight: '600'
          }}>
            {level.title} - Level {level.levelNumber}
          </div>

          {/* HEARTS */}
          <div style={{
            display: 'flex',
            gap: 18,
            justifyContent: 'center',
            marginBottom: '50px',
            padding: '25px',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '30px',
            boxShadow: '0 15px 45px rgba(0,0,0,0.12)'
          }}>
            {Array(5).fill().map((_, i) => (
              <div key={i} style={{
                fontSize: '3rem',
                animation: i < lives ? 'heartBeat 1.5s ease-in-out infinite' : 'none',
                color: i < lives ? '#ef4444' : '#9ca3af',
                transition: 'all 0.4s ease',
                transform: i < lives ? 'scale(1.15)' : 'scale(0.85)',
                filter: i < lives ? 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' : 'none'
              }}>
                ❤️
              </div>
            ))}
          </div>

          {/* QUESTION */}
          <div style={{ 
            fontSize: '1.8rem', 
            lineHeight: 1.7, 
            marginBottom: '60px', 
            color: '#1e293b', 
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '35px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            borderLeft: '8px solid #3b82f6',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 15,
              left: 25,
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Pertanyaan
            </div>
            <div style={{ marginTop: 25 }}>
              {q.content}
            </div>
          </div>

          {/* SHERIFF CHARACTER */}
          <div style={{ 
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <div style={{
              position: 'relative',
              height: 320,
              margin: '0 auto 25px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              maxWidth: 280
            }}>
              {/* BODY */}
              <div style={{
                width: 240,
                height: 280,
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50% 50% 50% 50%',
                position: 'relative',
                boxShadow: '0 25px 70px rgba(251,191,36,0.5)',
                animation: feedback === 'wrong' ? 'sheriffFall 0.8s ease-in-out' : 'none',
                border: '5px solid rgba(255,255,255,0.4)'
              }}>
                {/* HEAD */}
                <div style={{
                  position: 'absolute',
                  top: '18%',
                  left: '28%',
                  width: '44%',
                  height: '36%',
                  background: '#fef3c7',
                borderRadius: '50% 42% 38% 38%',
                  zIndex: 3,
                  boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.15)'
                }}></div>
                
                {/* FACE - LEBIH BESAR & JELAS */}
                <div style={{
                  position: 'absolute',
                  top: '24%',
                  left: '48%',
                  transform: 'translateX(-50%)',
                  fontSize: '4.5rem',
                  zIndex: 4,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }}>
                  🤠
                </div>

                {/* HAT */}
                {showParts.hat && (
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '3rem',
                    zIndex: 5,
                    animation: 'heartBeat 2s ease-in-out infinite',
                    textShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}>🎩</div>
                )}

                {/* BADGE */}
                {showParts.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    fontSize: '2.4rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                    border: '3px solid rgba(255,255,255,0.8)'
                  }}>⭐</div>
                )}

                {/* GUN */}
                {showParts.gun && (
                  <div style={{
                    position: 'absolute',
                    bottom: '18px',
                    left: '18px',
                    fontSize: '2.4rem',
                    transform: 'rotate(-20deg)',
                    textShadow: '0 3px 12px rgba(0,0,0,0.6)'
                  }}>🔫</div>
                )}

                {/* BOOTS */}
                {showParts.boots && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '2.8rem',
                    textShadow: '0 4px 15px rgba(0,0,0,0.4)'
                  }}>👢👢</div>
                )}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '1.6rem', 
              color: lives > 2 ? '#059669' : lives > 0 ? '#f59e0b' : '#dc2626',
              fontWeight: '800',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {lives > 0 ? 'Selamatkan Sheriff dari bandit!' : 'Game Over! Sheriff jatuh! 😱'}
            </div>
          </div>

          {/* FEEDBACK */}
          {feedback && (
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              padding: '40px 60px',
              borderRadius: '35px',
              textAlign: 'center',
              marginBottom: '50px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
              background: feedback === "correct" 
                ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                : 'linear-gradient(135deg, #fef2f2, #fecaca)',
              color: feedback === "correct" ? '#166534' : '#dc2626',
              animation: feedback === "correct" ? 'slideIn 0.6s ease-out' : 'shake 0.6s ease-in-out'
            }}>
              {feedback === "correct" 
                ? motivationMessages.correct[Math.floor(Math.random() * motivationMessages.correct.length)]
                : motivationMessages.wrong[Math.floor(Math.random() * motivationMessages.wrong.length)]
              }
            </div>
          )}
          
          {/* GAME CONTROLS */}
          {!feedback && renderGame()}
        </div>
      </div>

      {/* VICTORY MODAL */}
      {result && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(25px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)', 
            padding: '90px 70px', 
            borderRadius: '45px', 
            textAlign: 'center', 
            boxShadow: '0 50px 150px rgba(0,0,0,0.7)',
            maxWidth: '700px', 
            width: '92%',
            animation: 'slideIn 0.8s ease-out'
          }}>
            <div style={{ fontSize: '7rem', marginBottom: '35px' }}>
              {result.scorePercent >= 90 ? '🤠🏆' : result.scorePercent >= 70 ? '🤠⭐' : '🤠💪'}
            </div>
            
            <h2 style={{ fontSize: '3.5rem', marginBottom: '35px', color: '#1e293b', fontWeight: '900' }}>
              SHERIFF SELAMAT!
            </h2>
            
            <div style={{ 
              fontSize: '5rem', 
              marginBottom: '35px',
              color: result.scorePercent >= 90 ? '#059669' : result.scorePercent >= 70 ? '#f59e0b' : '#dc2626',
              fontWeight: 'bold',
              textShadow: '0 5px 20px rgba(0,0,0,0.2)'
            }}>
              {result.scorePercent}%
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              marginBottom: '60px', 
              color: '#374151',
              lineHeight: 1.6,
              fontWeight: '600'
            }}>
              {result.scorePercent >= 90 && motivationMessages.victory[Math.floor(Math.random() * motivationMessages.victory.length)]}
              {result.scorePercent >= 70 && result.scorePercent < 90 && "Keren! Sheriff hampir sempurna! 🌟 Teruskan!"}
              {result.scorePercent < 70 && "Sheriff selamat tapi terluka! Latihan lagi yuk! 💪"}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '50px', 
              justifyContent: 'center', 
              marginBottom: '70px',
              fontSize: '1.9rem'
            }}>
              <div>⭐ Score: <strong style={{ color: '#3b82f6' }}>{result.score}</strong></div>
              <div>XP: <strong style={{ color: '#10b981' }}>+{result.gainedXp}</strong></div>
            </div>

            <button 
              onClick={() => navigate("/game")}
              style={{
                width: '100%', 
                padding: '35px', 
                fontSize: '1.8rem', 
                fontWeight: '900', 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '35px', 
                cursor: 'pointer', 
                boxShadow: '0 30px 80px rgba(245,158,11,0.6)',
                transition: 'all 0.4s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 35px 90px rgba(245,158,11,0.7)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 30px 80px rgba(245,158,11,0.6)';
              }}
            >
              🎮 Kembali ke Peta Petualangan
            </button>
          </div>
        </div>
      )}

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes sheriffFall {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(25px) rotate(-8deg); }
          50% { transform: translateY(50px) rotate(8deg); }
          75% { transform: translateY(25px) rotate(-5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
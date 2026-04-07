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
  const [sheriffScale, setSheriffScale] = useState(1); // ✅ SHERIFF MENYUSUT
  const [timeLeft, setTimeLeft] = useState(40);
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
      setSheriffScale(1);
      setTimeLeft(40);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (index < questions.length && lives > 0 && !feedback) {
      setTimeLeft(40);
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

  const handleCorrectAnswer = () => {
    clearInterval(questionTimerRef.current);
    setFeedback("correct");
    setScore(prev => prev + 100);
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) setIndex(prev => prev + 1);
      else finishGame();
    }, 1500);
  };

  const handleWrongAnswer = () => {
    clearInterval(questionTimerRef.current);
    setFeedback("wrong");
    setSheriffScale(prev => Math.max(0.2, prev * 0.75)); // ✅ MENYUSUT
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => finishGame(), 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          if (index + 1 < questions.length) setIndex(prev => prev + 1);
        }, 1500);
      }
      return newLives;
    });
  };

  const finishGame = () => {
    const finalScore = Math.round((score / (questions.length * 100)) * 100);
    setResult({ scorePercent: finalScore, score, gainedXp: Math.round(score / 20) });
  };

  const renderAnswerButtons = () => {
    const q = questions[index];
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        {q.meta.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => Number(i) === Number(q.meta.answerIndex) ? handleCorrectAnswer() : handleWrongAnswer()}
            disabled={feedback || timeLeft === 0}
            style={{
              padding: '20px 25px',
              border: '3px solid #e5e7eb',
              borderRadius: '20px',
              background: feedback === 'correct' ? '#10b981' : 
                         (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? '#10b981' :
                         timeLeft === 0 ? '#9ca3af' : 'white',
              color: feedback === 'correct' || (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? 'white' : '#1f2937',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: feedback || timeLeft === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: feedback || timeLeft === 0 ? 0.6 : 1
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  };

  const renderGame = () => {
    const q = questions[index];
    return q.type === "mcq" || q.type === "truefalse" 
      ? renderAnswerButtons()
      : <div>Coming soon...</div>;
  };

  if (!level) return (
    <div style={{padding: 100, textAlign: 'center', color: 'white', fontSize: '2rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      🤠 Loading...
    </div>
  );

  const q = questions[index];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      
      <div style={{marginLeft: collapsed ? '80px' : '300px', maxWidth: '800px', margin: '0 auto'}}>
        {/* TOP BAR - DUOLINGO STYLE */}
        <div style={{
          position: 'sticky',
          top: 20,
          background: 'white',
          padding: '20px 30px',
          borderRadius: '25px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          zIndex: 100
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '30px'}}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 'bold', boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
            }}>
              {timeLeft}s
            </div>
            <div style={{fontSize: '1.4rem', fontWeight: '600'}}>Score: {score}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <span style={{fontSize: '1.2rem', color: '#6b7280'}}>Q{index + 1}/{questions.length}</span>
            <button onClick={() => navigate(-1)} style={{
              background: '#6b7280', color: 'white', border: 'none', borderRadius: '20px',
              padding: '10px 20px', fontWeight: '600', cursor: 'pointer'
            }}>← Back</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          {/* TITLE */}
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
            <h1 style={{
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontWeight: '800'
            }}>
              Save the Sheriff!
            </h1>
            <p style={{color: '#6b7280', fontSize: '1.1rem', margin: '5px 0 0 0'}}>
              Level {level.levelNumber} • {level.title}
            </p>
          </div>

          {/* HEARTS */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px'}}>
            {Array(5).fill().map((_, i) => (
              <span key={i} style={{
                fontSize: '2.5rem',
                color: i < lives ? '#ef4444' : '#d1d5db'
              }}>❤️</span>
            ))}
          </div>

          {/* QUESTION */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '40px',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{fontSize: '1.6rem', color: '#111827', margin: '0 0 20px 0', lineHeight: 1.5}}>
              {q.content}
            </h2>
          </div>

          {/* SHERIFF - LINGKARAN BESAR YANG MENYUSUT */}
          <div style={{
            width: 200,
            height: 200,
            margin: '0 auto 40px',
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, #10b981 ${lives/5*360}deg, #ef4444 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            boxShadow: `0 0 0 ${30 - lives*5}px #ef4444, 0 20px 60px rgba(0,0,0,0.3)`,
            transform: `scale(${sheriffScale})`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: feedback === 'wrong' ? 'explode 0.6s ease-out' : 'none'
          }}>
            🤠
          </div>

          {/* FEEDBACK */}
          {feedback && (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              borderRadius: '20px',
              marginBottom: '30px',
              fontSize: '1.4rem',
              fontWeight: '700',
              background: feedback === 'correct' ? '#dcfce7' : '#fef2f2',
              color: feedback === 'correct' ? '#166534' : '#dc2626'
            }}>
              {feedback === 'correct' ? '✅ Perfect!' : '❌ Try again!'}
            </div>
          )}

          {/* ANSWERS */}
          {!feedback && renderGame()}
        </div>
      </div>

      {/* RESULT MODAL */}
      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '60px 40px', borderRadius: '30px',
            textAlign: 'center', maxWidth: '500px', boxShadow: '0 30px 100px rgba(0,0,0,0.5)'
          }}>
            <div style={{fontSize: '6rem', marginBottom: '20px'}}>
              {result.scorePercent >= 80 ? '🏆' : '⭐'}
            </div>
            <h2 style={{fontSize: '2.5rem', color: '#111827', marginBottom: '20px'}}>Complete!</h2>
            <div style={{
              fontSize: '4rem', fontWeight: 'bold', marginBottom: '30px',
              color: result.scorePercent >= 80 ? '#10b981' : '#f59e0b'
            }}>
              {result.scorePercent}%
            </div>
            <div style={{marginBottom: '40px', color: '#6b7280'}}>
              +{result.gainedXp} XP earned
            </div>
            <button onClick={() => navigate('/game')} style={{
              width: '100%', padding: '20px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '25px', fontSize: '1.3rem', fontWeight: '700', cursor: 'pointer'
            }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes explode {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.3) rotate(180deg); }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
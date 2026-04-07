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
  const [sheriffScale, setSheriffScale] = useState(1);
  const [timeLeft, setTimeLeft] = useState(40);
  const [theme, setTheme] = useState('✈️'); // ✅ THEME DARI URL
  const [story, setStory] = useState('');
  const questionTimerRef = useRef(null);
  const answerInputRef = useRef(null);

  useEffect(() => {
    loadLevel();
  }, [id]);

  const loadLevel = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get('theme') || '✈️';
      setTheme(themeParam);
      
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
      
      // ✅ STORY BERDASARKAN THEME & LEVEL
      const stories = {
        '✈️': [
          'Pilot, badai mendekat! Jawab cepat!',
          'Turbulence! Stabilkan pesawat!',
          'Runway in sight! Final approach!',
          'Emergency landing! Quick thinking!',
          'Cleared for takeoff! Great job!'
        ],
        '🚀': [
          'Houston, we have a problem!',
          'Engine failure! Fix the code!',
          'Orbit achieved! Perfect launch!',
          'Re-entry sequence! Stay focused!',
          'Mission success! Astronaut hero!'
        ],
        '⚡': [
          'Server crash! Debug now!',
          'Lightning storm! Secure the grid!',
          'Power surge! Isolate the fault!',
          'System overload! Optimize code!',
          'Grid stabilized! Electric genius!'
        ]
      };
      
      const materiIdx = Math.floor(parseInt(id) / 5); // Asumsi 5 level per materi
      const levelInMateri = (parseInt(id) - 1) % 5;
      setStory(stories[themeParam]?.[levelInMateri] || 'Adventure time!');
      
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
    setSheriffScale(prev => Math.max(0.15, prev * 0.8));
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) setTimeout(() => finishGame(), 1500);
      else setTimeout(() => { setFeedback(null); if (index + 1 < questions.length) setIndex(prev => prev + 1); }, 1500);
      return newLives;
    });
  };

  const handleEssaySubmit = (answer) => {
    // ✅ CEK JAWABAN ESSAY - SIMPEL
    const correctKeywords = ['function', 'if', 'for', 'while', 'return', 'let', 'const', 'var'];
    const hasKeyword = correctKeywords.some(keyword => answer.toLowerCase().includes(keyword));
    hasKeyword ? handleCorrectAnswer() : handleWrongAnswer();
  };

  const renderAnswerButtons = () => {
    const q = questions[index];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
        {q.meta.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => Number(i) === Number(q.meta.answerIndex) ? handleCorrectAnswer() : handleWrongAnswer()}
            disabled={feedback || timeLeft === 0}
            style={{
              padding: '22px 28px',
              border: '3px solid #e5e7eb',
              borderRadius: '22px',
              background: feedback === 'correct' ? '#10b981' : 
                         (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? '#10b981' :
                         timeLeft === 0 ? '#9ca3af' : 'white',
              color: feedback === 'correct' || (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? 'white' : '#1f2937',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: feedback || timeLeft === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: feedback || timeLeft === 0 ? 0.7 : 1
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
    
    switch (q.type) {
      case "mcq":
      case "truefalse":
        return renderAnswerButtons();
      
      case "essay":
      case "typing":
        return (
          <div style={{maxWidth: '550px', margin: '0 auto'}}>
            <input
              ref={answerInputRef}
              type="text"
              placeholder="Type your code/answer here... (Press Enter)"
              autoFocus
              style={{
                width: '100%',
                padding: '22px 25px',
                border: '3px solid #e5e7eb',
                borderRadius: '22px',
                fontSize: '1.3rem',
                textAlign: 'center',
                outline: 'none',
                marginBottom: '15px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                fontFamily: 'monospace'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !feedback && timeLeft > 0) {
                  handleEssaySubmit(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={feedback || timeLeft === 0}
            />
            <div style={{textAlign: 'center', color: '#6b7280', fontSize: '1rem'}}>
              Use keywords like: function, if, for, let, const
            </div>
          </div>
        );
      
      default:
        return renderAnswerButtons();
    }
  };

  const finishGame = () => {
    const finalScore = Math.round((score / (questions.length * 100)) * 100);
    setResult({ scorePercent: finalScore, score, gainedXp: Math.round(score / 20) });
  };

  if (!level) return (
    <div style={{padding: 100, textAlign: 'center', color: 'white', fontSize: '2rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      {theme} Loading mission...
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
      
      <div style={{marginLeft: collapsed ? '80px' : '300px', maxWidth: '850px', margin: '0 auto'}}>
        {/* TOP BAR */}
        <div style={{
          position: 'sticky',
          top: 20,
          background: 'white',
          padding: '25px 35px',
          borderRadius: '28px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '35px',
          zIndex: 100
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '35px'}}>
            <div style={{
              width: 65, height: 65, borderRadius: '50%',
              background: timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.25)'
            }}>
              {timeLeft}s
            </div>
            <div style={{fontSize: '1.5rem', fontWeight: '700'}}>Score: {score}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 25}}>
            <span style={{fontSize: '1.3rem', color: '#6b7280'}}>Q{index + 1}/{questions.length}</span>
            <button onClick={() => navigate(-1)} style={{
              background: '#6b7280', color: 'white', border: 'none', borderRadius: '22px',
              padding: '12px 25px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem'
            }}>← Back</button>
          </div>
        </div>

        {/* MAIN GAME */}
        <div style={{
          background: 'white',
          borderRadius: '35px',
          padding: '50px',
          boxShadow: '0 30px 100px rgba(0,0,0,0.2)',
          maxWidth: '750px',
          margin: '0 auto'
        }}>
          {/* TITLE & STORY */}
          <div style={{textAlign: 'center', marginBottom: '45px'}}>
            <h1 style={{
              fontSize: '2.8rem',
              background: theme === '✈️' ? 'linear-gradient(135deg, #3b82f6, #1e40af)' :
                         theme === '🚀' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                         'linear-gradient(135deg, #f59e0b, #d97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontWeight: '900'
            }}>
              {theme} Mission Control!
            </h1>
            <p style={{color: '#6b7280', fontSize: '1.2rem', margin: '10px 0 0 0', fontWeight: '500'}}>
              Level {level.levelNumber} • {story}
            </p>
          </div>

          {/* LIVES */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '45px'}}>
            {Array(5).fill().map((_, i) => (
              <span key={i} style={{
                fontSize: '2.8rem',
                color: i < lives ? '#ef4444' : '#d1d5db',
                transition: 'all 0.3s ease'
              }}>❤️</span>
            ))}
          </div>

          {/* QUESTION */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '25px',
            padding: '35px',
            marginBottom: '50px',
            textAlign: 'center',
            boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{fontSize: '1.7rem', color: '#111827', margin: '0 0 25px 0', lineHeight: 1.5}}>
              {q.content}
            </h2>
          </div>

          {/* CHARACTER - BERUBAH SESUAI THEME */}
          <div style={{
            width: 220,
            height: 220,
            margin: '0 auto 50px',
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${theme === '✈️' ? '#3b82f6' : theme === '🚀' ? '#ef4444' : '#f59e0b'} ${lives/5*360}deg, #ef4444 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5.5rem',
            boxShadow: `0 0 0 ${35 - lives*6}px #ef4444, 0 25px 80px rgba(0,0,0,0.35)`,
            transform: `scale(${sheriffScale}) rotate(${lives * 12}deg)`,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: feedback === 'wrong' ? 'explode 0.7s ease-out' : 'none'
          }}>
            {theme}
          </div>

          {/* FEEDBACK */}
          {feedback && (
            <div style={{
              textAlign: 'center',
              padding: '35px',
              borderRadius: '25px',
              marginBottom: '35px',
              fontSize: '1.5rem',
              fontWeight: '700',
              background: feedback === 'correct' ? '#dcfce7' : '#fef2f2',
              color: feedback === 'correct' ? '#166534' : '#dc2626'
            }}>
              {feedback === 'correct' ? '✅ Mission success!' : '❌ System failure!'}
            </div>
          )}

          {/* GAME */}
          {!feedback && renderGame()}
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(15px)'
        }}>
          <div style={{
            background: 'white', padding: '70px 50px', borderRadius: '35px',
            textAlign: 'center', maxWidth: '550px', boxShadow: '0 40px 120px rgba(0,0,0,0.6)'
          }}>
            <div style={{fontSize: '7rem', marginBottom: '25px'}}>
              {result.scorePercent >= 80 ? `${theme}🏆` : `${theme}⭐`}
            </div>
            <h2 style={{fontSize: '2.8rem', color: '#111827', marginBottom: '25px', fontWeight: '900'}}>
              Mission Complete!
            </h2>
            <div style={{
              fontSize: '4.5rem', fontWeight: 'bold', marginBottom: '35px',
              color: result.scorePercent >= 80 ? '#10b981' : '#f59e0b'
            }}>
              {result.scorePercent}%
            </div>
            <div style={{marginBottom: '50px', color: '#6b7280', fontSize: '1.3rem'}}>
              +{result.gainedXp} XP earned
            </div>
            <button onClick={() => navigate('/game')} style={{
              width: '100%', padding: '25px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '28px', fontSize: '1.4rem', fontWeight: '800',
              cursor: 'pointer', boxShadow: '0 15px 45px rgba(102,126,234,0.4)'
            }}>
              Next Mission ➡️
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes explode {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
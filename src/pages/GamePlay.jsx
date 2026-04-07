import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { apiGet, apiPost } from "../services/api";
import Sidebar from "../components/Sidebar";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

const sheriffFall = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(20px) rotate(-5deg); }
  50% { transform: translateY(40px) rotate(5deg); }
  75% { transform: translateY(20px) rotate(-3deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const explode = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
`;

const Container = styled.div`
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
`;

const Main = styled.main`
  padding: 30px;
  margin-left: ${(props) => (props.collapsed ? "70px" : "280px")};
  flex: 1;
  transition: margin-left 0.3s;
  animation: ${slideIn} 0.6s ease-out;
`;

const GameCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3);
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  border: 4px solid transparent;
  background-clip: padding-box;
`;

const SheriffContainer = styled.div`
  position: relative;
  height: 250px;
  margin: 30px 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Sheriff = styled.div`
  width: 200px;
  height: 220px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50% 50% 40% 40%;
  position: relative;
  animation: ${props => props.falling ? sheriffFall : 'none'} 0.8s ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 25%;
    width: 50%;
    height: 40%;
    background: #fef3c7;
    border-radius: 50% 40% 30% 30%;
  }
  
  &::after {
    content: '🤠';
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3rem;
    z-index: 2;
  }
`;

// Body parts that disappear when wrong
const BodyPart = styled.div`
  position: absolute;
  transition: all 0.5s ease;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0) translateY(20px)'};
  
  ${props => !props.visible && css`
    animation: ${explode} 0.6s ease-out forwards;
  `}
`;

const Hat = styled(BodyPart)`
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.5rem;
`;

const Badge = styled(BodyPart)`
  top: 10px;
  right: 10px;
  font-size: 2rem;
`;

const Gun = styled(BodyPart)`
  bottom: 10px;
  left: 10px;
  font-size: 2rem;
  transform: rotate(-20deg);
`;

const Boots = styled(BodyPart)`
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
`;

const HeartsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
`;

const Heart = styled.div`
  font-size: 2.5rem;
  animation: ${heartBeat} 1.5s ease-in-out infinite;
  color: ${props => props.active ? '#ef4444' : '#9ca3af'};
`;

const MotivationMessage = styled.div`
  font-size: 2rem;
  font-weight: bold;
  padding: 30px 50px;
  border-radius: 25px;
  text-align: center;
  margin: 30px 0;
  animation: ${slideIn} 0.6s ease-out;
  
  ${props => props.correct ? css`
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #166534;
    box-shadow: 0 15px 40px rgba(16,185,129,0.4);
  ` : css`
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
    box-shadow: 0 15px 40px rgba(239,68,68,0.4);
    animation: shake 0.6s ease-in-out;
  `}
`;

const VictoryModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(15px);
`;

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
  const [timeLeft, setTimeLeft] = useState(25);

  const timeoutRef = useRef(null);
  const questionTimerRef = useRef(null);

  useEffect(() => {
    loadLevel();
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(questionTimerRef.current);
    };
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
    } catch (err) {
      console.error(err);
      alert("Gagal memuat level");
    }
  };

  useEffect(() => {
    if (index < questions.length && lives > 0) {
      setTimeLeft(25);
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
  }, [index, lives]);

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
    setFeedback("correct");
    setScore(prev => prev + 100);
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex(prev => prev + 1);
      } else {
        finishGame();
      }
    }, 2500);
  };

  const handleWrongAnswer = () => {
    setFeedback("wrong");
    const parts = ['hat', 'badge', 'gun', 'boots'];
    const lostPart = parts[lives - 1]; // Lose parts sequentially
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
        }, 2500);
      }
      return newLives;
    });
  };

  const renderAnswerButtons = () => {
    const q = questions[index];
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px', 
        width: '100%', 
        maxWidth: '700px',
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
            disabled={feedback !== null}
            style={{
              padding: '25px 30px',
              border: '4px solid #f3f4f6',
              borderRadius: '25px',
              background: feedback === 'correct' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         feedback === 'wrong' && i === Number(q.meta.answerIndex) ? 'linear-gradient(135deg, #10b981, #059669)' :
                         'white',
              color: feedback === 'correct' || (feedback === 'wrong' && i === Number(q.meta.answerIndex)) ? 'white' : '#1e293b',
              cursor: feedback ? 'not-allowed' : 'pointer',
              fontSize: '1.3rem',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: feedback ? 'scale(0.95)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {feedback === 'correct' && i === Number(q.meta.answerIndex) && (
              <span style={{ position: 'absolute', top: 5, right: 5, fontSize: '1.5rem' }}>✅</span>
            )}
            {opt}
          </button>
        ))}
      </div>
    );
  };

  const finishGame = async () => {
    try {
      const finalScore = Math.round((score / (questions.length * 100)) * 100);
      setResult({ 
        scorePercent: finalScore, 
        score: score, 
        correct: Math.round(finalScore / 10), 
        total: questions.length,
        gainedXp: Math.round(score / 20)
      });
    } catch (err) {
      console.error(err);
    }
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
            />
            <button 
              style={{
                padding: '20px 60px', border: 'none', borderRadius: '25px',
                fontSize: '1.4rem', fontWeight: '700', cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', boxShadow: '0 15px 40px rgba(245,158,11,0.4)'
              }}
            >
              🚀 Selamatkan Sheriff!
            </button>
          </>
        );
      
      default:
        return <div>Game type "{q.type}" belum didukung</div>;
    }
  };

  if (!level) return (
    <Container>
      <div style={{ padding: '100px 30px', textAlign: 'center', color: 'white', fontSize: '1.8rem' }}>
        🤠 Loading petualangan Sheriff...
      </div>
    </Container>
  );

  const q = questions[index];

  return (
    <Container>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      
      <Main collapsed={collapsed}>
        {/* TOP BAR */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px 30px', 
          borderRadius: '25px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
            ⏱️ {timeLeft}s | ⭐ {score} XP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ fontSize: '1.3rem', color: '#1e293b' }}>
              Soal {index + 1}/{questions.length}
            </div>
            <button onClick={() => navigate(-1)} style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)', 
              color: 'white', border: 'none', 
              borderRadius: '20px', padding: '12px 25px', 
              cursor: 'pointer', fontWeight: '600'
            }}>
              ← Kembali
            </button>
          </div>
        </div>

        <GameCard>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #1e40af, #3b82f6, #f59e0b)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            🤠 SAVE THE SHERIFF!
          </h2>

          <div style={{ 
            textAlign: 'center', 
            color: '#64748b', 
            fontSize: '1.3rem', 
            marginBottom: '40px',
            fontWeight: '600'
          }}>
            {level.title} - Level {level.levelNumber}
          </div>

          {/* HEARTS */}
          <HeartsContainer>
            {Array(5).fill().map((_, i) => (
              <Heart key={i} active={i < lives}>❤️</Heart>
            ))}
          </HeartsContainer>

          {/* QUESTION */}
          <div style={{ 
            fontSize: '1.6rem', 
            lineHeight: 1.6, 
            marginBottom: '40px', 
            color: '#1e293b', 
            textAlign: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '25px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
          }}>
            {q.content}
          </div>

          {/* SHERIFF CHARACTER */}
          <SheriffContainer falling={feedback === 'wrong'}>
            <Sheriff falling={feedback === 'wrong'}>
              <Hat visible={showParts.hat}>🤠</Hat>
              <Badge visible={showParts.badge}>⭐</Badge>
              <Gun visible={showParts.gun}>🔫</Gun>
              <Boots visible={showParts.boots}>👢</Boots>
            </Sheriff>
            <div style={{ 
              marginTop: '20px', 
              fontSize: '1.4rem', 
              color: '#64748b',
              fontWeight: '600'
            }}>
              {lives > 0 ? 'Selamatkan Sheriff dari bandit!' : 'Game Over! Sheriff jatuh! 😱'}
            </div>
          </SheriffContainer>

          {/* FEEDBACK & GAME */}
          {feedback && (
            <MotivationMessage correct={feedback === "correct"}>
              {feedback === "correct" 
                ? motivationMessages.correct[Math.floor(Math.random() * motivationMessages.correct.length)]
                : motivationMessages.wrong[Math.floor(Math.random() * motivationMessages.wrong.length)]
              }
            </MotivationMessage>
          )}
          
          {!feedback && renderGame()}
        </GameCard>
      </Main>

      {/* VICTORY MODAL */}
      {result && (
        <VictoryModal>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)', 
            padding: '80px 60px', borderRadius: '40px', 
            textAlign: 'center', boxShadow: '0 30px 100px rgba(0,0,0,0.5)',
            maxWidth: '600px', width: '90%', animation: `${slideIn} 0.8s ease-out`
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '30px' }}>
              {result.scorePercent >= 90 ? '🤠🏆' : result.scorePercent >= 70 ? '🤠⭐' : '🤠💪'}
            </div>
            
            <h2 style={{ fontSize: '3rem', marginBottom: '30px', color: '#1e293b' }}>
              SHERIFF SELAMAT!
            </h2>
            
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '30px',
              color: result.scorePercent >= 90 ? '#059669' : result.scorePercent >= 70 ? '#f59e0b' : '#dc2626',
              fontWeight: 'bold'
            }}>
              {result.scorePercent}%
            </div>
            
            <div style={{ 
              fontSize: '1.8rem', 
              marginBottom: '40px', 
              color: '#374151',
              lineHeight: 1.6
            }}>
              {result.scorePercent >= 90 && motivationMessages.victory[Math.floor(Math.random() * motivationMessages.victory.length)]}
              {result.scorePercent >= 70 && result.scorePercent < 90 && "Keren! Sheriff hampir sempurna! 🌟 Teruskan!"}
              {result.scorePercent < 70 && "Sheriff selamat tapi terluka! Latihan lagi yuk! 💪"}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '30px', 
              justifyContent: 'center', 
              marginBottom: '50px',
              fontSize: '1.5rem'
            }}>
              <div>⭐ Score: <strong style={{ color: '#3b82f6' }}>{result.score}</strong></div>
              <div>XP: <strong style={{ color: '#10b981' }}>+{result.gainedXp}</strong></div>
            </div>

            <button 
              onClick={() => navigate("/game")}
              style={{
                width: '100%', padding: '30px', fontSize: '1.6rem', 
                fontWeight: '800', background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                color: 'white', border: 'none', borderRadius: '30px', 
                cursor: 'pointer', boxShadow: '0 20px 50px rgba(245,158,11,0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎮 Kembali ke Peta Petualangan
            </button>
          </div>
        </VictoryModal>
      )}
    </Container>
  );
}
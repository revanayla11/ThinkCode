import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { apiGet, apiPost } from "../services/api";
import Sidebar from "../components/Sidebar";

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Container = styled.div`
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Main = styled.main`
  padding: 30px;
  margin-left: ${(props) => (props.collapsed ? "70px" : "280px")};
  flex: 1;
  transition: margin-left 0.3s;
  animation: ${slideIn} 0.6s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  padding: 20px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const GameCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-width: 900px;
  margin: 0 auto;
  position: relative;
`;

const TimerBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: #e5e7eb;
  border-radius: 25px 25px 0 0;
  overflow: hidden;
`;

const TimerFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  width: ${props => props.progress}%;
  transition: width ${props => props.time}ms linear;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
`;

const QuestionCounter = styled.div`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 20px;
  font-weight: 500;
`;

const QuestionContent = styled.div`
  font-size: 1.4rem;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #1e293b;
  text-align: center;
`;

const GameArea = styled.div`
  min-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
`;

const MotivationMessage = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  padding: 25px 40px;
  border-radius: 20px;
  text-align: center;
  animation: ${pulse} 0.8s ease-out;
  max-width: 500px;
  margin: 0 auto;

  ${props => props.correct ? css`
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #166534;
  ` : css`
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
    animation: ${shake} 0.5s ease-in-out;
  `}
`;

// FLASHCARD DRAG & DROP
const FlashcardContainer = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Flashcard = styled.div`
  width: 220px;
  height: 120px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  padding: 20px;
  cursor: grab;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  user-select: none;
  transition: all 0.3s ease;

  &:active {
    cursor: grabbing;
    transform: scale(1.05);
  }
`;

const DropZone = styled.div`
  width: 280px;
  height: 140px;
  border: 4px dashed ${props => props.isCorrect ? '#10b981' : props.isWrong ? '#ef4444' : '#e5e7eb'};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.isCorrect ? '#d1fae5' : props.isWrong ? '#fee2e2' : '#f8fafc'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.droppable && `
    &:hover { border-color: #3b82f6; background: #eff6ff; }
  `}
`;

const DropZoneLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
`;

const DroppedItem = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 20px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.95rem;
`;

// MATCHING GAME
const MatchingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 700px;
  width: 100%;
`;

const MatchingCard = styled.div`
  height: 100px;
  border: 3px solid #e5e7eb;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-3px);
  }

  ${props => props.matched && `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border-color: #059669;
  `}
`;

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [dragData, setDragData] = useState(null);

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

      const fixedQuestions = (res.questions || []).map((q) => {
        let meta = q.meta;
        if (typeof meta === "string") {
          try { meta = JSON.parse(meta); } catch { meta = {}; }
        }
        return { ...q, meta };
      });

      setLevel(res.level);
      setQuestions(fixedQuestions);
      setIndex(0);
      setAnswers([]);
      setResult(null);
      setUserAnswer('');
    } catch (err) {
      console.error(err);
      alert("Gagal memuat level");
    }
  };

  useEffect(() => {
    if (index < questions.length) {
      // Timer 20 detik per soal
      setTimeLeft(20);
      questionTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current);
            submitAnswer(null); // Auto submit jika kehabisan waktu
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [index]);

  const motivationMessages = {
    correct: [
      "Hebat! Kamu semakin jago! 🚀",
      "Perfect! Terus semangat ya! 💪",
      "Mantap! Kamu luar biasa! ⭐",
      "Yes! Langkah menuju mastery! 🎯"
    ],
    wrong: [
      "Tenang, kamu pasti bisa! Coba lagi! 💪",
      "Belum apa-apa, masih banyak kesempatan! 🌟",
      "Jangan menyerah! Kamu hebat! 🔥",
      "Belajar dari kesalahan = menang besar! ⚡"
    ],
    greatResult: [
      "🏆 PERFECT! Kamu jenius!",
      "⭐ EXCELLENT! Level master tercapai!",
      "🎉 INCREDIBLE! Semua benar!",
      "🔥 LEGENDARY! Tak terkalahkan!"
    ],
    goodResult: [
      "👍 BAGUS! Hampir sempurna!",
      "✨ KEREN! Teruskan momentum ini!",
      "🎯 TEPAT! Kamu on fire!",
      "💎 HEBAT! Hasil luar biasa!"
    ],
    needPractice: [
      "💪 Kamu bisa lebih baik lagi!",
      "📚 Latihan lagi yuk, pasti bisa!",
      "🌱 Masih proses, terus belajar!",
      "⚡ Next time pasti lebih mantap!"
    ]
  };

  const getRandomMessage = (type) => {
    const messages = motivationMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const submitAnswer = (answer) => {
    clearInterval(questionTimerRef.current);
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
    setUserAnswer('');

    let correct = false;
    const q = questions[index];
    
    if (q.type === "mcq") {
      correct = Number(answer) === Number(q.meta.answerIndex);
    } else if (["essay", "typing"].includes(q.type)) {
      correct = String(answer).trim().toLowerCase() === String(q.meta.answer).trim().toLowerCase();
    } else if (q.type === "truefalse") {
      correct = Boolean(answer) === Boolean(q.meta.isTrue);
    } else if (q.type === "flashcard") {
      correct = answer === 'correct';
    } else if (q.type === "matching") {
      correct = q.meta.pairs.every((pair, i) => answers[index]?.[i] === pair.answerIndex);
    }

    setFeedback(correct ? "correct" : "wrong");

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex((prev) => prev + 1);
      } else {
        finish(newAnswers);
      }
    }, 2000);
  };

  const renderFlashcardGame = () => {
    const q = questions[index];
    return (
      <FlashcardContainer>
        {q.meta.statements.map((statement, i) => (
          <Flashcard
            key={i}
            draggable
            onDragStart={(e) => setDragData({ statement, index: i })}
          >
            {statement.text}
          </Flashcard>
        ))}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <DropZone
            droppable={true}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragData) {
                const isCorrect = dragData.statement.isCorrect;
                submitAnswer(isCorrect ? 'correct' : 'wrong');
                setDragData(null);
              }
            }}
          >
            <DropZoneLabel>✅ BENAR</DropZoneLabel>
            <div style={{ fontSize: '1.1rem', color: '#059669' }}>Taruh pernyataan benar</div>
          </DropZone>

          <DropZone
            droppable={true}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragData) {
                const isCorrect = dragData.statement.isCorrect;
                submitAnswer(isCorrect ? 'correct' : 'wrong');
                setDragData(null);
              }
            }}
          >
            <DropZoneLabel>❌ SALAH</DropZoneLabel>
            <div style={{ fontSize: '1.1rem', color: '#dc2626' }}>Taruh pernyataan salah</div>
          </DropZone>
        </div>
      </FlashcardContainer>
    );
  };

  const renderMatchingGame = () => {
    const q = questions[index];
    const [selectedLeft, setSelectedLeft] = useState(null);
    
    return (
      <MatchingContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {q.meta.leftItems.map((item, i) => (
            <MatchingCard
              key={`left-${i}`}
              onClick={() => {
                if (!selectedLeft) setSelectedLeft(i);
              }}
              style={{ 
                background: selectedLeft === i ? '#dbeafe' : 'white',
                borderColor: selectedLeft === i ? '#3b82f6' : '#e5e7eb'
              }}
            >
              {item}
            </MatchingCard>
          ))}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {q.meta.rightItems.map((item, i) => (
            <MatchingCard
              key={`right-${i}`}
              onClick={() => {
                if (selectedLeft !== null) {
                  const answer = Array(4).fill(null);
                  answer[selectedLeft] = i;
                  submitAnswer(answer);
                  setSelectedLeft(null);
                }
              }}
            >
              {item}
            </MatchingCard>
          ))}
        </div>
      </MatchingContainer>
    );
  };

  const finish = async (finalAnswers) => {
    try {
      const payload = finalAnswers.map((a, i) => ({
        questionId: questions[i].id,
        answer: a,
      }));

      const res = await apiPost(`/game/submit/${level.id}`, { answers: payload });
      if (!res.status) throw new Error("Submit gagal");
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Gagal submit hasil");
    }
  };

  const renderGame = () => {
    const q = questions[index];
    switch (q.type) {
      case "mcq":
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%', maxWidth: '600px' }}>
            {q.meta.options?.map((opt, i) => (
              <button
                key={i}
                style={{
                  padding: '20px',
                  border: '3px solid #e5e7eb',
                  borderRadius: '20px',
                  background: answers[index] === i ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'white',
                  color: answers[index] === i ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => submitAnswer(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "truefalse":
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '500px' }}>
            <button onClick={() => submitAnswer(true)} style={{
              padding: '25px', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.2rem',
              fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 30px rgba(16,185,129,0.4)'
            }}>
              ✅ BENAR
            </button>
            <button onClick={() => submitAnswer(false)} style={{
              padding: '25px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.2rem',
              fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 30px rgba(239,68,68,0.4)'
            }}>
              ❌ SALAH
            </button>
          </div>
        );

      case "essay":
      case "typing":
        return (
          <>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ketik jawaban Anda di sini..."
              style={{
                width: '100%', maxWidth: '500px', padding: '25px', border: '3px solid #e5e7eb',
                borderRadius: '25px', fontSize: '18px', textAlign: 'center', outline: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}
              autoFocus
            />
            <button 
              onClick={() => submitAnswer(userAnswer)}
              disabled={!userAnswer.trim()}
              style={{
                padding: '20px 50px', border: 'none', borderRadius: '25px',
                fontSize: '18px', fontWeight: '700', cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                background: userAnswer.trim() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#ccc',
                color: 'white', boxShadow: '0 10px 30px rgba(59,130,246,0.4)'
              }}
            >
              Submit Jawaban
            </button>
          </>
        );

      case "flashcard":
        return renderFlashcardGame();

      case "matching":
        return renderMatchingGame();

      default:
        return <div>Game type "{q.type}" belum didukung</div>;
    }
  };

  if (!level) return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Memuat level...</div>;
  if (!questions.length) return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Level belum memiliki soal</div>;

  const q = questions[index];

  return (
    <Container>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      
      <Main collapsed={collapsed}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600' }}>
            ⏱️ {timeLeft}s
          </div>
          <button onClick={() => navigate(-1)} style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
            border: 'none', borderRadius: '15px', padding: '12px 24px', cursor: 'pointer',
            fontWeight: '600', boxShadow: '0 4px 15px rgba(239,68,68,0.4)'
          }}>
            ← Kembali
          </button>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
          padding: '25px 35px', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {level.title}
          </h2>
          <div style={{ color: '#64748b', fontWeight: '500' }}>
            🎮 {level.type?.toUpperCase()} - Level {level.levelNumber} | Soal {index + 1}/{questions.length}
          </div>
        </div>

        <GameCard>
          <TimerBar>
            <TimerFill progress={(timeLeft / 20) * 100} time={1000} />
          </TimerBar>
          
          <ProgressBar style={{ marginBottom: '30px' }}>
            <ProgressFill progress={(index / questions.length) * 100} />
          </ProgressBar>

          <QuestionContent>{q.content}</QuestionContent>

          <GameArea>
            {feedback && (
              <MotivationMessage correct={feedback === "correct"}>
                {feedback === "correct" 
                  ? getRandomMessage("correct") 
                  : getRandomMessage("wrong")
                }
              </MotivationMessage>
            )}
            
            {!feedback && renderGame()}
          </GameArea>
        </GameCard>
      </Main>

      {result && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)', padding: '60px 50px',
            borderRadius: '30px', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
            maxWidth: '500px', width: '90%', animation: `${slideIn} 0.8s ease-out`
          }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '25px' }}>🎉 Level Selesai!</h2>
            
            <div style={{ fontSize: '4rem', marginBottom: '30px' }}>
              {result.scorePercent >= 90 ? '🏆' : result.scorePercent >= 70 ? '🥇' : '🥈'}
            </div>
            
            <div style={{ 
              fontSize: '2.5rem', marginBottom: '25px',
              color: result.scorePercent >= 90 ? '#059669' : result.scorePercent >= 70 ? '#d97706' : '#dc2626',
              fontWeight: 'bold'
            }}>
              {result.scorePercent}%
            </div>
            
            <div style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#374151' }}>
              {result.scorePercent >= 90 && getRandomMessage("greatResult")}
              {result.scorePercent >= 70 && result.scorePercent < 90 && getRandomMessage("goodResult")}
              {result.scorePercent < 70 && getRandomMessage("needPractice")}
            </div>

            <div style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
              Benar: <strong style={{ color: '#3b82f6' }}>{result.correct}/{result.total}</strong> | 
              XP: <strong style={{ color: '#10b981' }}>+{result.gainedXp}</strong>
            </div>

            {result.badge && (
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ marginBottom: '20px', color: '#1e293b' }}>🏅 Badge Baru!</h4>
                <img 
                  src={result.badge.image} 
                  alt={result.badge.badge_name}
                  style={{
                    width: '120px', height: '120px', objectFit: 'contain',
                    borderRadius: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
                  }}
                />
                <div style={{ fontWeight: '700', marginTop: '15px', fontSize: '1.1rem' }}>
                  {result.badge.badge_name}
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate("/game")}
              style={{
                width: '100%', padding: '25px', fontSize: '1.3rem', fontWeight: '700',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                border: 'none', borderRadius: '25px', cursor: 'pointer',
                boxShadow: '0 15px 40px rgba(59,130,246,0.4)'
              }}
            >
              🎮 Kembali ke Peta Game
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
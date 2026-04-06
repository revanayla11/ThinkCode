import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { apiGet, apiPost } from "../services/api";
import Sidebar from "../components/Sidebar";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(45deg, #1e40af, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const GameType = styled.span`
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
  }
`;

const GameCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-width: 900px;
  margin: 0 auto;
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
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 600px;
`;

const OptionButton = styled.button`
  padding: 20px;
  border: 3px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  }

  ${props => props.selected && `
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border-color: #2563eb;
  `}

  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border: 3px solid #e5e7eb;
  border-radius: 20px;
  font-size: 18px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: scale(1.02);
  }
`;

const ActionButton = styled.button`
  padding: 18px 40px;
  border: none;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);

  background: linear-gradient(135deg, ${props => props.variant === 'next' ? '#3b82f6, #1d4ed8' : '#10b981, #059669'});
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Feedback = styled.div`
  font-size: 2rem;
  font-weight: bold;
  padding: 20px;
  border-radius: 20px;
  text-align: center;
  animation: pulse 0.6s ease-out;

  ${props => props.correct ? `
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #166534;
  ` : `
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
  `}
`;

const ResultModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const ResultCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  padding: 50px;
  border-radius: 30px;
  text-align: center;
  box-shadow: 0 25px 80px rgba(0,0,0,0.4);
  max-width: 500px;
  width: 90%;
  animation: ${slideIn} 0.8s ease-out;
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

  const timeoutRef = useRef(null);

  useEffect(() => {
    loadLevel();
    return () => clearTimeout(timeoutRef.current);
  }, [id]);

  const loadLevel = async () => {
    try {
      const res = await apiGet(`/game/level/${id}`);
      if (!res.status) throw new Error("Load gagal");

      const fixedQuestions = (res.questions || []).map((q) => {
        let meta = q.meta;
        if (typeof meta === "string") {
          try {
            meta = JSON.parse(meta);
          } catch {
            meta = {};
          }
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

  if (!level) return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Memuat level...</div>;
  if (!questions.length) return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Level belum memiliki soal</div>;

  const q = questions[index];

  const submitAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
    setUserAnswer('');

    // Auto feedback untuk instant feedback
    let correct = false;
    if (q.type === "mcq") {
      correct = Number(answer) === Number(q.meta.answerIndex);
    } else if (["essay", "typing"].includes(q.type)) {
      correct = String(answer).trim().toLowerCase() === String(q.meta.answer).trim().toLowerCase();
    } else if (q.type === "truefalse") {
      correct = Boolean(answer) === Boolean(q.meta.isTrue);
    }

    setFeedback(correct ? "correct" : "wrong");

       timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex((prev) => prev + 1);
      } else {
        finish(newAnswers);
      }
    }, 1200);
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
    switch (q.type) {
      case "mcq":
        return (
          <OptionsGrid>
            {q.meta.options?.map((opt, i) => (
              <OptionButton
                key={i}
                selected={answers[index] === i}
                onClick={() => submitAnswer(i)}
              >
                {opt}
              </OptionButton>
            ))}
          </OptionsGrid>
        );

      case "truefalse":
        return (
          <OptionsGrid style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '500px' }}>
            <OptionButton onClick={() => submitAnswer(true)}>
              ✅ BENAR
            </OptionButton>
            <OptionButton onClick={() => submitAnswer(false)}>
              ❌ SALAH
            </OptionButton>
          </OptionsGrid>
        );

      case "essay":
      case "typing":
        return (
          <>
            <TextInput
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ketik jawaban Anda di sini..."
              autoFocus
            />
            <ActionButton 
              variant="submit"
              onClick={() => submitAnswer(userAnswer)}
              disabled={!userAnswer.trim()}
            >
              Submit Jawaban
            </ActionButton>
          </>
        );

      case "dragdrop":
        return (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#059669' }}>✅ BENAR</div>
              <div style={{
                width: '200px',
                height: '120px',
                border: '4px dashed #10b981',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#d1fae5',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
                onClick={() => submitAnswer('true')}
              >
                Taruh di sini
              </div>
            </div>
            
            <div style={{
              width: '300px',
              height: '120px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'grab',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
            }}>
              {q.content}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#dc2626' }}>❌ SALAH</div>
              <div style={{
                width: '200px',
                height: '120px',
                border: '4px dashed #ef4444',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fee2e2',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
                onClick={() => submitAnswer('false')}
              >
                Taruh di sini
              </div>
            </div>
          </div>
        );

      default:
        return <div>Game type "{q.type}" belum didukung</div>;
    }
  };

  return (
    <Container>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      
      <Main collapsed={collapsed}>
        <Header>
          <GameInfo>
            <Title>{level.title}</Title>
            <GameType>🎮 {level.type?.toUpperCase()} - Level {level.levelNumber}</GameType>
          </GameInfo>
          <BackButton onClick={() => navigate(-1)}>← Kembali</BackButton>
        </Header>

        <GameCard>
          <ProgressBar>
            <ProgressFill progress={(index / questions.length) * 100} />
          </ProgressBar>
          
          <QuestionCounter>
            Soal {index + 1} dari {questions.length}
          </QuestionCounter>

          <QuestionContent>{q.content}</QuestionContent>

          <GameArea>
            {feedback && (
              <Feedback correct={feedback === "correct"}>
                {feedback === "correct" ? "✅ Jawaban Benar!" : "❌ Jawaban Salah!"}
              </Feedback>
            )}
            
            {!feedback && renderGame()}
          </GameArea>
        </GameCard>
      </Main>

      {result && (
        <ResultModal>
          <ResultCard>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎉 Level Selesai!</h2>
            <div style={{ fontSize: '3rem', marginBottom: '30px' }}>
              {result.scorePercent >= 80 ? '🏆' : result.scorePercent >= 60 ? '🥈' : '🥉'}
            </div>
            
            <div style={{ 
              fontSize: '1.8rem', 
              marginBottom: '20px',
              color: result.scorePercent >= 80 ? '#059669' : result.scorePercent >= 60 ? '#d97706' : '#dc2626'
            }}>
              {result.scorePercent}%
            </div>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              Benar: <strong>{result.correct}/{result.total}</strong>
            </p>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
              XP: <strong style={{ color: '#3b82f6' }}>+{result.gainedXp}</strong>
            </p>

            {result.badge && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>🏅 Badge Baru!</h4>
                <img 
                  src={result.badge.image} 
                  alt={result.badge.badge_name}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                />
                <div style={{ fontWeight: '600', marginTop: '10px' }}>
                  {result.badge.badge_name}
                </div>
              </div>
            )}

            <ActionButton 
              variant="next"
              onClick={() => navigate("/game")}
              style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }}
            >
              Kembali ke Peta Game
            </ActionButton>
          </ResultCard>
        </ResultModal>
      )}
    </Container>
  );
}
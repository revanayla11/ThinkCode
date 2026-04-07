// QuizGame.jsx - Self-contained dengan style inline
import React, { useState, useEffect } from 'react';

const QuizGame = ({ onComplete }) => {
  const questions = [
    { id: 1, text: "🗺️ Ibukota Indonesia?", options: ["Jakarta ✅", "Bandung", "Surabaya", "Medan"], correct: 0 },
    { id: 2, text: "➕ 2 + 2 = ?", options: ["3", "4 ✅", "5", "6"], correct: 1 },
    { id: 3, text: "🌍 Planet terbesar?", options: ["Mars", "Jupiter ✅", "Venus", "Merkurius"], correct: 1 },
    { id: 4, text: "💧 Air pada suhu 25°C?", options: ["Padat", "Cair ✅", "Gas"], correct: 1 }
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[current];

  const handleAnswer = (selectedIndex) => {
    setAnswered(true);
    const isCorrect = selectedIndex === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 25);
      setFeedback('✅ Benar! Mantap!');
    } else {
      setFeedback(`❌ Salah! Jawaban benar: ${currentQuestion.options[currentQuestion.correct]}`);
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(prev => prev + 1);
        setAnswered(false);
        setFeedback('');
      } else {
        onComplete(Math.min(score + 25, 100));
      }
    }, 2000);
  };

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem'
    }}>
      {/* Progress Bar */}
      <div style={{
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #10b981, #059669)',
          width: `${progress}%`,
          transition: 'width 0.5s ease',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }} />
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '2rem',
          textAlign: 'center',
          lineHeight: '1.4',
          padding: '0 1rem'
        }}>
          {currentQuestion.text}
        </div>

        <div style={{
          display: 'grid',
          gap: '1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              style={{
                padding: '1.5rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '16px',
                background: answered 
                  ? index === currentQuestion.correct 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : index === currentQuestion.correct ? '#f3f4f6' : '#fee2e2'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: answered 
                  ? index === currentQuestion.correct 
                    ? 'white' 
                    : index === currentQuestion.correct ? '#111827' : '#dc2626'
                  : 'white',
                cursor: answered ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: answered 
                  ? index === currentQuestion.correct 
                    ? '0 10px 25px rgba(16, 185, 129, 0.4)'
                    : '0 5px 15px rgba(220, 38, 38, 0.2)'
                  : '0 5px 20px rgba(59, 130, 246, 0.4)',
                transform: answered ? 'scale(0.98)' : 'scale(1)'
              }}
              onClick={() => !answered && handleAnswer(index)}
              disabled={answered}
            >
              <span style={{ marginRight: '1rem' }}>{String.fromCharCode(65 + index)}.</span>
              {option.replace(' ✅', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: '1.5rem',
          marginTop: '1rem',
          borderRadius: '12px',
          background: feedback.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: feedback.includes('✅') ? '#065f46' : '#991b1b',
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'center',
          border: `3px solid ${feedback.includes('✅') ? '#10b981' : '#ef4444'}`,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <i className={`fas fa-${feedback.includes('✅') ? 'check-circle' : 'times-circle'} me-2`}></i>
          {feedback}
        </div>
      )}

      {/* Progress Info */}
      <div style={{
        textAlign: 'center',
        paddingTop: '1rem',
        color: '#6b7280',
        fontSize: '1rem'
      }}>
        Pertanyaan {current + 1} dari {questions.length} | Skor: {score}/{questions.length * 25}
      </div>
    </div>
  );
};

export default QuizGame;
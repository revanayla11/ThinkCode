// FlashcardGame.jsx - Self-contained dengan style inline
import React, { useState } from 'react';

const FlashcardGame = ({ onComplete }) => {
  const initialCards = [
    { id: 1, text: "🧪 Air adalah zat cair", correct: true },
    { id: 2, text: "🌞 Matahari mengorbit bumi", correct: false },
    { id: 3, text: "🌿 Daun berfotosintesis", correct: true },
    { id: 4, text: "🐟 Ikan hidup di darat", correct: false },
    { id: 5, text: "🌍 Bumi berbentuk bulat", correct: true }
  ];

  const [cards, setCards] = useState(initialCards);
  const [score, setScore] = useState(0);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropFeedback, setDropFeedback] = useState({});

  const trueZoneRef = React.useRef();
  const falseZoneRef = React.useRef();

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, isCorrectZone) => {
    e.preventDefault();
    const cardId = parseInt(e.dataTransfer.getData('text/plain'));
    const card = cards.find(c => c.id === cardId);
    
    if (!card) return;

    const isCorrect = card.correct === isCorrectZone;
    const newScore = score + (isCorrect ? 20 : 0);
    
    setCards(prev => prev.filter(c => c.id !== cardId));
    setScore(newScore);
    setDropFeedback({ 
      [cardId]: isCorrect ? '✅ Benar!' : '❌ Salah!' 
    });

    setTimeout(() => {
      setDropFeedback({});
      if (newScore >= 95) {
        onComplete(100);
      }
    }, 1500);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      padding: '1rem'
    }}>
      {/* Score */}
      <div style={{
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#059669',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '1rem',
        borderRadius: '12px'
      }}>
        Score: {score}/100
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
        {/* Cards Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          borderRadius: '20px',
          border: '3px dashed #cbd5e1'
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem' }}>
            Drag kartu ke kotak yang tepat:
          </h3>
          {cards.map(card => (
            <div
              key={card.id}
              className="flashcard"
              draggable
              onDragStart={(e) => handleDragStart(e, card)}
              style={{
                padding: '1.5rem 2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                cursor: 'grab',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: '3px solid transparent',
                transition: 'all 0.3s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              }}
            >
              {card.text}
            </div>
          ))}
        </div>

        {/* Drop Zones */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem',
          justifyContent: 'center'
        }}>
          <div
            ref={trueZoneRef}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, true)}
            style={{
              height: '200px',
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              border: '4px dashed #10b981',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dcfce7, #bbf7d0)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }}></i>
            <h3 style={{ margin: 0, color: '#059669', fontSize: '1.5rem', fontWeight: '800' }}>BENAR</h3>
            {dropFeedback[draggedCard?.id] && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: '700'
              }}>
                {dropFeedback[draggedCard?.id]}
              </div>
            )}
          </div>

          <div
            ref={falseZoneRef}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, false)}
            style={{
              height: '200px',
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: '4px dashed #ef4444',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className="fas fa-times-circle" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}></i>
            <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.5rem', fontWeight: '800' }}>SALAH</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardGame;
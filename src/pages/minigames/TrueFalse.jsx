import React, { useState, useEffect } from 'react';

const TrueFalse = ({ question, onCorrect, onWrong, disabled }) => {
  const [cards, setCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState({ true: [], false: [] });
  const [score, setScore] = useState(0);

  // Generate random statements (simulasi database)
  const statements = [
    "React adalah library JavaScript untuk UI",
    "JavaScript dibuat oleh Microsoft",
    "const tidak bisa diubah nilainya",
    "Array dimulai dari index 1",
    "Function adalah first-class citizen di JS"
  ];

  const correctAnswers = [true, false, true, false, true]; // Jawaban benar

  useEffect(() => {
    // Shuffle cards
    const shuffled = statements.map((s, i) => ({ 
      id: i, 
      content: s, 
      correct: correctAnswers[i] 
    })).sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setDroppedCards({ true: [], false: [] });
    setScore(0);
  }, [question]);

  const handleDragStart = (e, cardId) => {
    if (disabled) return;
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, isTrue) => {
    if (disabled) return;
    e.preventDefault();
    
    const cardId = parseInt(e.dataTransfer.getData('cardId'));
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
      const newDropped = { ...droppedCards };
      newDropped[isTrue ? 'true' : 'false'].push(card);
      
      // Check if correct
      const isCorrect = card.correct === isTrue;
      if (isCorrect) {
        setScore(prev => Math.min(100, prev + 20));
      }
      
      setDroppedCards(newDropped);
      setCards(prev => prev.filter(c => c.id !== cardId));
      
      // Check completion
      if (newDropped.true.length + newDropped.false.length === statements.length) {
        setTimeout(() => {
          if (score >= 80) onCorrect();
          else onWrong();
        }, 800);
      }
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ec4899, #be185d)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '1.2rem'
      }}>
        📚 Score: {score}
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Drag card ke kotak yang benar!
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
        {/* Cards Stack */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <h3 style={{ color: '#6b7280', margin: 0 }}>📬 Tumpukan Kartu</h3>
          <div style={{
            height: '400px',
            width: '280px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '24px',
            border: '3px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)'
          }}>
            {cards.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                🎉 Semua kartu sudah ditempatkan!
              </div>
            ) : (
              cards.slice(0, 3).map((card, idx) => ( // Show top 3 cards
                <div
                  key={card.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  style={{
                    width: '240px',
                    padding: '1.5rem 2rem',
                    background: `hsl(${200 + idx * 20}, 70%, 95%)`,
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    transform: `translateY(${idx * 10}px) rotate(${idx * 2}deg)`,
                    cursor: disabled ? 'not-allowed' : 'grab',
                    border: '3px solid rgba(255,255,255,0.8)',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    lineHeight: '1.4',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {card.content}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drop Zones */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2rem', 
          justifyContent: 'center' 
        }}>
          {[
            { isTrue: true, label: '✅ BENAR', color: '#10b981' },
            { isTrue: false, label: '❌ SALAH', color: '#ef4444' }
          ].map(({ isTrue, label, color }) => (
            <div
              key={label}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, isTrue)}
              style={{
                height: '200px',
                minWidth: '300px',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `4px dashed ${color}`,
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
                backdropFilter: 'blur(20px)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: color
              }}>
                {label}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
                width: '100%'
              }}>
                {droppedCards[isTrue ? 'true' : 'false'].map(card => (
                  <div key={card.id} style={{
                    padding: '1rem',
                    background: card.correct === isTrue ? '#fff' : '#fee2e2',
                    borderRadius: '16px',
                    border: `2px solid ${card.correct === isTrue ? '#10b981' : '#ef4444'}`,
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }}>
                    {card.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrueFalse;
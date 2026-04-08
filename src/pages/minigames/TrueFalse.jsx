import React, { useState, useEffect } from 'react';

const TrueFalse = ({ question, onCorrect, onWrong, disabled }) => {
  const [cards, setCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState({ true: [], false: [] });

  const adminStatements = question.content.split('\n').filter(s => s.trim());
  const correctAnswers = question.meta.answer ? 
    question.meta.answer.split(',').map(a => a.trim() === 'true') : [];

  useEffect(() => {
    if (adminStatements.length > 0) {
      const statementCards = adminStatements.map((content, idx) => ({
        id: idx,
        content: content.trim(),
        correct: correctAnswers[idx] || false
      })).sort(() => Math.random() - 0.5);
      
      setCards(statementCards);
      setDroppedCards({ true: [], false: [] });
    }
  }, [question]);

  const handleDragStart = (e, cardId) => {
    if (disabled) return;
    e.dataTransfer.setData('cardId', cardId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, isTrue) => {
    if (disabled) return;
    e.preventDefault();
    
    const cardId = parseInt(e.dataTransfer.getData('cardId'));
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
      const newDropped = { ...droppedCards };
      newDropped[isTrue ? 'true' : 'false'].push(card);
      
      setDroppedCards(newDropped);
      setCards(prev => prev.filter(c => c.id !== cardId));
      
      if (newDropped.true.length + newDropped.false.length === adminStatements.length) {
        setTimeout(() => {
          const allCorrect = Object.values(newDropped).every(dropped => 
            dropped.every(card => card.correct === (dropped === newDropped.true))
          );
          
          if (allCorrect) {
            onCorrect();
          } else {
            onWrong();
          }
        }, 1000);
      }
    }
  };

  if (adminStatements.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        minHeight: '500px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal True/False di admin</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      minHeight: '650px',
      maxHeight: '850px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ec4899, #be185d)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)',
        minHeight: '60px'
      }}>
        <div>✅ True/False ({adminStatements.length} soal)</div>
        <div>🎯 {cards.length === 0 ? 'Selesai!' : `${cards.length} tersisa`}</div>
      </div>

      {/* PERNYATAAN CARDS - Dragable */}
      <div style={{
        flex: '0 0 200px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '20px',
        border: '3px dashed #d1d5db',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        minHeight: '180px'
      }}>
        {cards.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#10b981',
            fontSize: '1.2rem',
            fontWeight: '700',
            width: '100%'
          }}>
            🎉 Semua sudah ditempatkan!
          </div>
        ) : (
          cards.map((card, idx) => (
            <div
              key={card.id}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, card.id)}
              style={{
                width: '220px',
                height: '100px',
                padding: '1.2rem',
                background: `linear-gradient(135deg, 
                  hsl(${220 + (idx % 5) * 20}, 70%, 95%), 
                  hsl(${220 + (idx % 5) * 20}, 60%, 92%)
                )`,
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                cursor: disabled ? 'not-allowed' : 'grab',
                border: '3px solid rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                lineHeight: '1.4',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <div style={{ flex: 1 }}>
                {card.content}
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 6px 16px rgba(236, 72, 153, 0.4)'
              }}>
                🖱️
              </div>
            </div>
          ))
        )}
      </div>

      {/* BENAR | SALAH - Side by Side */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'stretch',
        minHeight: '300px'
      }}>
        {/* BENAR */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, true)}
          style={{
            flex: 1,
            maxWidth: '500px',
            background: 'linear-gradient(135deg, #10b98115, #10b98108)',
            border: '4px dashed #10b981',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backdropFilter: 'blur(15px)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 20px 50px rgba(16, 185, 129, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '280px'
          }}
        >
          <div style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: '#10b981',
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            marginBottom: '1rem'
          }}>
            ✅ BENAR
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            alignContent: 'flex-start',
            padding: '1rem 0'
          }}>
            {droppedCards.true.map(card => (
              <div 
                key={card.id}
                style={{
                  padding: '1.2rem 1.5rem',
                  background: card.correct === true 
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                    : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  borderRadius: '16px',
                  border: `3px solid ${card.correct === true ? '#10b981' : '#ef4444'}`,
                  fontSize: '0.9rem',
                  maxWidth: '200px',
                  boxShadow: card.correct === true 
                    ? '0 10px 30px rgba(16, 185, 129, 0.4)' 
                    : '0 8px 25px rgba(239, 68, 68, 0.3)',
                  position: 'relative',
                  animation: 'slideIn 0.3s ease-out',
                  lineHeight: '1.4',
                  userSelect: 'none'
                }}
              >
                <div>{card.content}</div>
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: card.correct === true ? '#10b981' : '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {card.correct === true ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SALAH */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, false)}
          style={{
            flex: 1,
            maxWidth: '500px',
            background: 'linear-gradient(135deg, #ef444415, #ef444408)',
            border: '4px dashed #ef4444',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backdropFilter: 'blur(15px)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '280px'
          }}
        >
          <div style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: '#ef4444',
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            marginBottom: '1rem'
          }}>
            ❌ SALAH
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            alignContent: 'flex-start',
            padding: '1rem 0'
          }}>
            {droppedCards.false.map(card => (
              <div 
                key={card.id}
                style={{
                  padding: '1.2rem 1.5rem',
                  background: card.correct === false 
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                    : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  borderRadius: '16px',
                  border: `3px solid ${card.correct === false ? '#10b981' : '#ef4444'}`,
                  fontSize: '0.9rem',
                  maxWidth: '200px',
                  boxShadow: card.correct === false 
                    ? '0 10px 30px rgba(16, 185, 129, 0.4)' 
                    : '0 8px 25px rgba(239, 68, 68, 0.3)',
                  position: 'relative',
                  animation: 'slideIn 0.3s ease-out',
                  lineHeight: '1.4',
                  userSelect: 'none'
                }}
              >
                <div>{card.content}</div>
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: card.correct === false ? '#10b981' : '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {card.correct === false ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(255,255,255,0.8)',
        padding: '1rem',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#6b7280',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        🖱️ Seret card pernyataan ke kolom BENAR atau SALAH
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TrueFalse;
import React, { useState, useEffect } from 'react';

const TrueFalse = ({ question, onCorrect, onWrong, disabled }) => {
  const [cards, setCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState({ true: [], false: [] });
  const [showFeedback, setShowFeedback] = useState({ show: false, type: '', message: '' });

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
      setShowFeedback({ show: false, type: '', message: '' });
    }
  }, [question]);

  const showMiniFeedback = (type, message) => {
    setShowFeedback({ show: true, type, message });
    setTimeout(() => setShowFeedback({ show: false, type: '', message: '' }), 1500);
  };

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
      
      // Mini feedback
      showMiniFeedback(
        card.correct === isTrue ? 'correct' : 'wrong', 
        card.correct === isTrue ? '✅ Benar!' : '❌ Salah!'
      );
      
      // Final check
      if (newDropped.true.length + newDropped.false.length === adminStatements.length) {
        setTimeout(() => {
          const allCorrect = Object.values(newDropped).every(dropped => 
            dropped.every(card => card.correct === (dropped === newDropped.true))
          );
          allCorrect ? onCorrect() : onWrong();
        }, 1200);
      }
    }
  };

  if (adminStatements.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', borderRadius: '20px' }}>
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
      minHeight: '700px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* MINI HEADER - Tanpa counter */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ec4899, #be185d)',
        color: 'white',
        padding: '0.8rem 1.5rem',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)',
        minHeight: '50px'
      }}>
        ✅ True / False
      </div>

      {/* PERNYATAAN CARDS */}
      <div style={{
        flex: '0 0 180px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.8rem',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '16px',
        border: '2px dashed #d1d5db',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        minHeight: '160px'
      }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#10b981', fontSize: '1.1rem', fontWeight: '700', width: '100%' }}>
            🎉 Semua sudah ditempatkan!
          </div>
        ) : (
          cards.map((card, idx) => (
            <div
              key={card.id}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, card.id)}
              style={{
                width: '200px',
                height: '85px',
                padding: '1rem',
                background: `linear-gradient(135deg, hsl(${220 + (idx % 5) * 20}, 70%, 95%), hsl(${220 + (idx % 5) * 20}, 60%, 92%))`,
                borderRadius: '14px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                cursor: disabled ? 'not-allowed' : 'grab',
                border: '2px solid rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                lineHeight: '1.3',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <div style={{ flex: 1 }}>{card.content}</div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
              }}>
                🖱️
              </div>
            </div>
          ))
        )}
      </div>

      {/* BENAR | SALAH - BOX KECIL */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '1.5rem',
        justifyContent: 'center',
        alignItems: 'stretch',
        minHeight: '320px'
      }}>
        {/* BENAR - BOX KOMPAK */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, true)}
          style={{
            flex: 1, maxWidth: '380px',
            background: 'linear-gradient(135deg, #10b98112, #10b98106)',
            border: '3px dashed #10b981',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column',
            gap: '0.8rem',
            backdropFilter: 'blur(12px)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.15)',
            minHeight: '280px'
          }}
        >
          <div style={{
            fontSize: '1.6rem', fontWeight: '900', color: '#10b981',
            textAlign: 'center', textShadow: '0 1px 4px rgba(16, 185, 129, 0.3)',
            marginBottom: '0.5rem'
          }}>
            ✅ BENAR
          </div>
          <div style={{
            flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
            justifyContent: 'center', alignContent: 'flex-start', padding: '0.5rem 0'
          }}>
            {droppedCards.true.map(card => (
              <div key={card.id} style={{
                padding: '1rem 1.2rem',
                background: card.correct === true ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: '12px',
                border: `2px solid ${card.correct === true ? '#10b981' : '#ef4444'}`,
                fontSize: '0.85rem', maxWidth: '160px',
                boxShadow: card.correct === true ? '0 6px 20px rgba(16, 185, 129, 0.3)' : '0 6px 20px rgba(239, 68, 68, 0.25)',
                position: 'relative', lineHeight: '1.3', userSelect: 'none'
              }}>
                <div>{card.content}</div>
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: card.correct === true ? '#10b981' : '#ef4444',
                  color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 'bold'
                }}>
                  {card.correct === true ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SALAH - BOX KOMPAK */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, false)}
          style={{
            flex: 1, maxWidth: '380px',
            background: 'linear-gradient(135deg, #ef444412, #ef444406)',
            border: '3px dashed #ef4444',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column',
            gap: '0.8rem',
            backdropFilter: 'blur(12px)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 15px 40px rgba(239, 68, 68, 0.15)',
            minHeight: '280px'
          }}
        >
          <div style={{
            fontSize: '1.6rem', fontWeight: '900', color: '#ef4444',
            textAlign: 'center', textShadow: '0 1px 4px rgba(239, 68, 68, 0.3)',
            marginBottom: '0.5rem'
          }}>
            ❌ SALAH
          </div>
          <div style={{
            flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
            justifyContent: 'center', alignContent: 'flex-start', padding: '0.5rem 0'
          }}>
            {droppedCards.false.map(card => (
              <div key={card.id} style={{
                padding: '1rem 1.2rem',
                background: card.correct === false ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: '12px',
                border: `2px solid ${card.correct === false ? '#10b981' : '#ef4444'}`,
                fontSize: '0.85rem', maxWidth: '160px',
                boxShadow: card.correct === false ? '0 6px 20px rgba(16, 185, 129, 0.3)' : '0 6px 20px rgba(239, 68, 68, 0.25)',
                position: 'relative', lineHeight: '1.3', userSelect: 'none'
              }}>
                <div>{card.content}</div>
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: card.correct === false ? '#10b981' : '#ef4444',
                  color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 'bold'
                }}>
                  {card.correct === false ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MINI NOTIF FEEDBACK */}
      {showFeedback.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: showFeedback.type === 'correct' 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', fontWeight: '700', fontSize: '1rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          transform: 'scale(1)',
          animation: 'popIn 0.3s ease-out'
        }}>
          {showFeedback.message}
        </div>
      )}

      {/* Instructions - Kecil */}
      <div style={{
        background: 'rgba(255,255,255,0.8)', padding: '0.8rem',
        borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem',
        color: '#6b7280', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        🖱️ Seret card ke BENAR atau SALAH
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default TrueFalse;
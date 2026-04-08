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
      minHeight: '600px',
      maxHeight: '800px',
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
        <div>📚 Soal: {adminStatements.length}</div>
        <div>🎯 {cards.length === 0 ? 'Selesai!' : `${cards.length} tersisa`}</div>
      </div>

      {/* Main Game */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '2rem',
        minHeight: '450px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Cards Stack */}
        <div style={{
          flex: '0 0 320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <h3 style={{ 
            color: '#374151', 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            📬 Tumpukan Pernyataan
          </h3>
          <div style={{
            height: '420px',
            width: '100%',
            maxWidth: '300px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '20px',
            border: '2px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: cards.length > 0 ? 'flex-start' : 'center',
            padding: '1.5rem 1rem',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            {cards.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#10b981',
                fontSize: '1.1rem',
                fontWeight: '700'
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
                    width: '100%',
                    maxWidth: '280px',
                    padding: '1rem 1.2rem',
                    background: `hsl(${220 + (idx % 5) * 15}, 70%, 95%)`,
                    borderRadius: '14px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    cursor: disabled ? 'not-allowed' : 'grab',
                    border: '2px solid rgba(255,255,255,0.9)',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    position: 'relative',
                    marginBottom: '0.5rem'
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
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          justifyContent: 'center',
          maxWidth: '600px'
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
                height: '220px',
                background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                border: `3px dashed ${color}`,
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backdropFilter: 'blur(10px)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color,
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                marginBottom: '0.5rem'
              }}>
                {label}
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.8rem',
                justifyContent: 'center',
                flex: 1,
                minHeight: '120px'
              }}>
                {droppedCards[isTrue ? 'true' : 'false'].map(card => (
                  <div 
                    key={card.id} 
                    style={{
                      padding: '0.9rem 1.2rem',
                      background: card.correct === isTrue ? 
                        'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 
                        'linear-gradient(135deg, #fee2e2, #fecaca)',
                      borderRadius: '10px',
                      border: `2px solid ${card.correct === isTrue ? '#10b981' : '#ef4444'}`,
                      fontSize: '0.85rem',
                      maxWidth: '180px',
                      minWidth: '120px',
                      boxShadow: card.correct === isTrue ? 
                        '0 6px 20px rgba(16, 185, 129, 0.25)' : 
                        '0 6px 20px rgba(239, 68, 68, 0.25)',
                      position: 'relative',
                      userSelect: 'none',
                      lineHeight: '1.3'
                    }}
                  >
                    <div>{card.content}</div>
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: card.correct === isTrue ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {card.correct === isTrue ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
        🖱️ Seret pernyataan ke kolom BENAR atau SALAH
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
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
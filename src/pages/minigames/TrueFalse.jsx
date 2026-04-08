import React, { useState, useEffect } from 'react';

const TrueFalse = ({ question, onCorrect, onWrong, disabled }) => {
  const [cards, setCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState({ true: [], false: [] });

  // 🔥 AMBIL SOAL DARI ADMIN DATABASE!
  const adminStatements = question.content.split('\n').filter(s => s.trim());
  const correctAnswers = question.meta.answer ? 
    question.meta.answer.split(',').map(a => a.trim() === 'true') : 
    []; // Dari admin input "true,false,true"

  useEffect(() => {
    if (adminStatements.length > 0) {
      // Buat cards dari soal admin
      const statementCards = adminStatements.map((content, idx) => ({
        id: idx,
        content: content.trim(),
        correct: correctAnswers[idx] || false
      })).sort(() => Math.random() - 0.5); // Shuffle
      
      setCards(statementCards);
      setDroppedCards({ true: [], false: [] });
    }
  }, [question]);

  const handleDragStart = (e, cardId) => {
    if (disabled) return;
    e.dataTransfer.setData('cardId', cardId.toString());
  };

  const handleDragOver = (e) => e.preventDefault();

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
      
      // 🔥 VALIDASI FINAL - CEK GAME SELESAI
      if (newDropped.true.length + newDropped.false.length === adminStatements.length) {
        // CEK SEMUA JAWABAN BENAR
        const allCorrect = Object.values(newDropped).every(dropped => 
          dropped.every(card => card.correct === (dropped === newDropped.true))
        );
        
        setTimeout(() => {
          if (allCorrect) {
            onCorrect();
          } else {
            onWrong();
          }
        }, 800);
      }
    }
  };

  // JIKA BELUM ADA SOAL ADMIN, fallback
  if (adminStatements.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
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
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1rem'
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
        boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)'
      }}>
        <div>
          📚 Soal: {adminStatements.length}
        </div>
        <div style={{ fontSize: '1.1rem' }}>
          🎯 {cards.length === 0 ? 'Selesai!' : `${cards.length} tersisa`}
        </div>
      </div>

      {/* MAIN GAME */}
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
          <h3 style={{ 
            color: '#6b7280', 
            margin: 0, 
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            📬 Tumpukan Pernyataan
          </h3>
          <div style={{
            height: '400px',
            width: '300px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '24px',
            border: '3px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: cards.length > 0 ? 'flex-start' : 'center',
            padding: '2rem 1rem',
            overflowY: 'auto',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            {cards.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#10b981',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                🎉 Semua sudah ditempatkan!
              </div>
            ) : (
              cards.slice(0, 4).map((card, idx) => (
                <div
                  key={card.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    background: `hsl(${220 + idx * 15}, 70%, 95%)`,
                    borderRadius: '16px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                    cursor: disabled ? 'not-allowed' : 'grab',
                    border: '2px solid rgba(255,255,255,0.8)',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    transition: 'all 0.3s ease',
                    userSelect: 'none'
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
                minHeight: '250px',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `4px dashed ${color}`,
                borderRadius: '24px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backdropFilter: 'blur(20px)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '800',
                color,
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {label}
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                {droppedCards[isTrue ? 'true' : 'false'].map(card => (
                  <div 
                    key={card.id} 
                    style={{
                      padding: '1rem 1.5rem',
                      background: card.correct === isTrue ? 
                        'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 
                        'linear-gradient(135deg, #fee2e2, #fecaca)',
                      borderRadius: '12px',
                      border: `3px solid ${card.correct === isTrue ? '#10b981' : '#ef4444'}`,
                      fontSize: '0.85rem',
                      maxWidth: '200px',
                      boxShadow: card.correct === isTrue ? 
                        '0 8px 25px rgba(16, 185, 129, 0.3)' : 
                        '0 8px 25px rgba(239, 68, 68, 0.3)',
                      position: 'relative',
                      animation: 'slideIn 0.4s ease',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ lineHeight: '1.3' }}>
                      {card.content}
                    </div>
                    {/* Visual Feedback Icon */}
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: card.correct === isTrue ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
    </div>
  );
};

export default TrueFalse;
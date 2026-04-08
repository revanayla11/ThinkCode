import React, { useState, useEffect } from 'react';

const DragDropGame = ({ question, onCorrect, onWrong, disabled, onLevelComplete }) => {
  // 🔥 DATA DARI ADMIN
  const questionText = question.content || 'Susun urutan yang benar!';
  const correctOrder = question.meta.answers || ['A', 'B', 'C', 'D'];
  
  const [items, setItems] = useState([]);
  const [userMapping, setUserMapping] = useState({});
  const [score, setScore] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false); // 🔥 Score popup AKHIR LEVEL

  useEffect(() => {
    // Items = A,B,C,D,E,F berdasarkan correctOrder length
    const newItems = Array.from({length: correctOrder.length}, (_, i) => 
      String.fromCharCode(65 + i)
    );
    setItems(newItems);
    setUserMapping({});
    setScore(0);
    setShowScorePopup(false);
  }, [question]);

  const handleDragStart = (e, item) => {
    if (disabled) return;
    e.dataTransfer.setData('item', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    if (disabled) return;
    e.preventDefault();
    
    const item = e.dataTransfer.getData('item');
    
    // Remove from previous position
    const newMapping = { ...userMapping };
    delete newMapping[Object.keys(userMapping).find(key => userMapping[key] === item)];
    newMapping[targetIndex] = item;
    
    setUserMapping(newMapping);
    
    // Calculate score
    let correctCount = 0;
    Object.entries(newMapping).forEach(([idx, mappedItem]) => {
      if (mappedItem === correctOrder[idx]) correctCount++;
    });
    setScore(Math.round((correctCount / correctOrder.length) * 100));
    
    // Complete check - 🔥 HAPUS POPUP, CUMA onCorrect/onWrong
    if (Object.keys(newMapping).length === correctOrder.length) {
      const isCompleteCorrect = Object.entries(newMapping).every(([idx, item]) => 
        item === correctOrder[idx]
      );
      
      if (isCompleteCorrect) {
        onCorrect(); // 🔥 Langsung onCorrect, popup di parent
      } else {
        onWrong();
      }
    }
  };

  // 🔥 HANDLE LEVEL COMPLETION (DIPANGGIL OLEH PARENT)
  const handleLevelCompletion = async (finalScore) => {
    setShowScorePopup(true);
    
    // Submit data ke parent
    if (onLevelComplete) {
      await onLevelComplete({
        scorePercent: finalScore,
        totalQuestions: 1,
        correctAnswers: 1,
        heartsUsed: 1
      });
    }
  };

  // 🔥 SCORE POPUP - HANYA DI AKHIR LEVEL
  if (showScorePopup) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '3.5rem 3rem',
          borderRadius: '28px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(16,185,129,0.5)',
          maxWidth: '450px',
          width: '100%',
          position: 'relative',
          animation: 'popupSlide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}>
          {/* Success Icon */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '4.5rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(245,158,11,0.5)',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 2
          }}>
            🧩
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{
              fontSize: '3.5rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }}>
              🎉
            </div>
            
            <h2 style={{ 
              fontSize: '2.8rem', 
              fontWeight: '900', 
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Level Selesai!
            </h2>

            {/* Score Display */}
            <div style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(15px)',
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              marginBottom: '2.5rem',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                fontWeight: '900', 
                color: '#ecfdf5',
                marginBottom: '0.5rem',
                lineHeight: '1'
              }}>
                {score}%
              </div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                opacity: 0.95 
              }}>
                Perfect Arrangement!
              </div>
            </div>

            {/* Rewards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              maxWidth: '350px',
              margin: '0 auto 2.5rem'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1.5rem 1rem',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>+25</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>XP</div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1.5rem 1rem',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥇</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Gold</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Badge</div>
              </div>
            </div>

            {/* Success Message */}
            <div style={{
              padding: '1.5rem 2rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '2.5rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              lineHeight: '1.5'
            }}>
              ✅ Drag & Drop level selesai! Semua rewards berhasil didapatkan!
            </div>

            {/* Auto Continue Timer */}
            <div style={{
              padding: '1rem 2rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              Auto lanjut dalam <span style={{ color: '#ecfdf5', fontSize: '1.3rem' }}>3s</span> ⏱️
            </div>
          </div>

          <style jsx>{`
            @keyframes popupSlide {
              from { 
                opacity: 0; 
                transform: translateY(50px) scale(0.9); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // JIKA BELUM ADA SOAL
  if (!questionText.trim() || correctOrder.length === 0) {
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <h3>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Drag & Drop di admin</p>
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
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
        minHeight: '60px'
      }}>
        <div>🔗 Drag & Drop</div>
        <div>Score: <strong>{score}%</strong></div>
      </div>

      {/* SOAL ADMIN */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        border: '2px solid #e5e7eb',
        boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#1f2937'
      }}>
        <div style={{ 
          fontWeight: '800', 
          marginBottom: '1rem', 
          color: '#92400e',
          fontSize: '1.3rem'
        }}>
          📝 Soal:
        </div>
        {questionText}
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: '2px dashed #f59e0b',
        color: '#92400e',
        fontWeight: '600',
        fontSize: '1rem'
      }}>
        🧩 Seret huruf ke posisi angka yang benar!
      </div>

      {/* Main Game - NO FEEDBACK WARNA (NETRAL SAMPAI AKHIR) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '3rem', 
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: '400px'
      }}>
        {/* Items (A,B,C,D) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          minWidth: '140px',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            color: '#374151', 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            📦 Huruf
          </h3>
          {items.map((item, idx) => (
            <div
              key={item}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                height: '85px',
                width: '85px',
                background: Object.values(userMapping).includes(item) 
                  ? '#dbeafe'  // 🔥 Selected: biru muda
                  : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                border: `3px solid ${
                  Object.values(userMapping).includes(item) ? '#3b82f6' : '#e5e7eb'
                }`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: '800',
                color: '#1f2937',
                cursor: disabled ? 'not-allowed' : 'grab',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Arrows */}
        <div style={{
          fontSize: '3.5rem',
          color: '#6b7280',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          ➡️
        </div>

        {/* Targets (1️⃣,2️⃣,3️⃣,4️⃣) - NO GREEN/RED */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          minWidth: '320px'
        }}>
          <h3 style={{ 
            color: '#374151', 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            🎯 Posisi
          </h3>
          {correctOrder.map((_, targetIdx) => (
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, targetIdx)}
              style={{
                height: '85px',
                background: userMapping[targetIdx] 
                  ? '#dbeafe'  // 🔥 Selected: biru muda SAJA
                  : 'rgba(59,130,246,0.08)',
                border: `3px dashed ${
                  userMapping[targetIdx] ? '#3b82f6' : '#60a5fa'
                }`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                fontSize: '1.8rem',
                fontWeight: '700',
                color: userMapping[targetIdx] ? '#1f2937' : '#6b7280',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {userMapping[targetIdx] ? (
                <span style={{ fontSize: '1.3rem' }}>
                  {targetIdx + 1}️⃣ {userMapping[targetIdx]}
                </span>
              ) : (
                <span>{targetIdx + 1}️⃣ Taruh disini...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '14px',
        background: '#e5e7eb',
        borderRadius: '7px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, 
            ${score === 100 ? '#10b981' : score >= 75 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444'} 0%, 
            #fbbf24 100%)`,
          width: `${score}%`,
          borderRadius: '7px',
          transition: 'width 0.4s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }} />
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
        🖱️ Seret huruf ke posisi angka | Lengkapi semua untuk selesai
      </div>
    </div>
  );
};

export default DragDropGame;
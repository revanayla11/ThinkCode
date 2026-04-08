import React, { useState, useEffect } from 'react';

const DragDropGame = ({ question, onCorrect, onWrong, disabled }) => {
  // 🔥 DATA DARI ADMIN
  const questionText = question.content || 'Susun urutan yang benar!';
  const correctOrder = question.meta.answers || ['A', 'B', 'C', 'D'];
  
  const [items, setItems] = useState([]);
  const [userMapping, setUserMapping] = useState({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Items = A,B,C,D,E,F berdasarkan correctOrder length
    const newItems = Array.from({length: correctOrder.length}, (_, i) => 
      String.fromCharCode(65 + i)
    );
    setItems(newItems);
    setUserMapping({});
    setScore(0);
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
    
    // Complete check
    if (Object.keys(newMapping).length === correctOrder.length) {
      const isCompleteCorrect = Object.entries(newMapping).every(([idx, item]) => 
        item === correctOrder[idx]
      );
      setTimeout(() => {
        isCompleteCorrect ? onCorrect() : onWrong();
      }, 1000);
    }
  };

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

      {/* Main Game - FIXED LAYOUT */}
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
                  ? '#f3f4f6' 
                  : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                border: `3px solid ${
                  Object.values(userMapping).includes(item) ? '#d1d5db' : '#3b82f6'
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

        {/* Targets (1️⃣,2️⃣,3️⃣,4️⃣) */}
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
                  ? (userMapping[targetIdx] === correctOrder[targetIdx] 
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                    : 'linear-gradient(135deg, #fee2e2, #fecaca)')
                  : 'rgba(59,130,246,0.08)',
                border: `3px dashed ${
                  userMapping[targetIdx] 
                    ? (userMapping[targetIdx] === correctOrder[targetIdx] ? '#10b981' : '#ef4444')
                    : '#60a5fa'
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
                  {userMapping[targetIdx] === correctOrder[targetIdx] && ' ✅'}
                </span>
              ) : (
                <span>{targetIdx + 1}️⃣ Taruh disini...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar - FIXED */}
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
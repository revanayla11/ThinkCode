import React, { useState, useEffect } from 'react';

const DragDropGame = ({ question, onCorrect, onWrong, disabled }) => {
  const correctOrder = question.meta.answers || ['A', 'B', 'C', 'D']; // Urutan benar
  const [items, setItems] = useState([]);
  const [userMapping, setUserMapping] = useState({}); // {targetIndex: item}
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Items = A,B,C,D,E,F
    setItems(Array.from({length: correctOrder.length}, (_, i) => 
      String.fromCharCode(65 + i) // A,B,C,D...
    ));
    setUserMapping({});
    setScore(0);
  }, [question]);

  const handleDragStart = (e, item) => {
    if (disabled) return;
    e.dataTransfer.setData('item', item);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetIndex) => {
    if (disabled) return;
    e.preventDefault();
    
    const item = e.dataTransfer.getData('item');
    const newMapping = { ...userMapping, [targetIndex]: item };
    setUserMapping(newMapping);
    
    // Check partial score
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
      }, 800);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        fontWeight: '700'
      }}>
        🔗 Score: {score}%
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: '2px dashed #f59e0b',
        color: '#92400e',
        fontWeight: '600'
      }}>
        🧩 Susun urutan yang benar: Drag huruf ke angka!
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '3rem', alignItems: 'center' }}>
        {/* Items (A,B,C,D) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minWidth: '120px'
        }}>
          <h3 style={{ color: '#6b7280', margin: 0, textAlign: 'center' }}>📦 Items</h3>
          {items.map((item, idx) => (
            <div
              key={item}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                height: '80px',
                background: Object.values(userMapping).includes(item) 
                  ? '#f3f4f6' 
                  : 'white',
                border: `4px solid ${Object.values(userMapping).includes(item) ? '#d1d5db' : '#3b82f6'}`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#1f2937',
                cursor: disabled ? 'not-allowed' : 'grab',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                userSelect: 'none'
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Arrows */}
        <div style={{
          fontSize: '3rem',
          color: '#6b7280',
          fontWeight: 'bold'
        }}>
          ➡️
        </div>

        {/* Targets (1️⃣,2️⃣,3️⃣,4️⃣) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h3 style={{ color: '#6b7280', margin: 0, textAlign: 'center' }}>🎯 Targets</h3>
          {correctOrder.map((_, targetIdx) => (
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, targetIdx)}
              style={{
                height: '80px',
                width: '300px',
                background: userMapping[targetIdx] 
                  ? (userMapping[targetIdx] === correctOrder[targetIdx] 
                    ? '#dcfce7' 
                    : '#fee2e2')
                  : 'rgba(59,130,246,0.1)',
                border: `4px dashed ${
                  userMapping[targetIdx] 
                    ? (userMapping[targetIdx] === correctOrder[targetIdx] ? '#10b981' : '#ef4444')
                    : '#3b82f6'
                }`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                fontSize: '2rem',
                fontWeight: '800',
                color: userMapping[targetIdx] ? '#1f2937' : '#6b7280',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              {userMapping[targetIdx] ? (
                <span style={{ fontSize: '1.5rem' }}>
                  {targetIdx + 1}️⃣ {userMapping[targetIdx]}
                  {userMapping[targetIdx] === correctOrder[targetIdx] && ' ✅'}
                </span>
              ) : (
                <span>{targetIdx + 1}️⃣ Drop disini...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '12px',
        background: '#e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, 
            ${score === 100 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} 0%, 
            #fbbf24 100%)`,
          width: `${score}%`,
          borderRadius: '6px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

export default DragDropGame;
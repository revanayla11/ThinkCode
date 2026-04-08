import React, { useState, useEffect, useRef } from 'react';

const TypingGame = ({ question, onCorrect, onWrong, disabled }) => {
  const [grid, setGrid] = useState(Array(8).fill().map(() => Array(20).fill('')));
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false); // 🔥 NEW: Score popup state
  const inputRef = useRef();

  // 🔥 SOAL DARI ADMIN + TARGET ANSWER
  const questionText = question.content || 'Tulis fungsi untuk menjumlahkan 2 angka';
  const targetAnswer = question.meta.answer || 'function tambah(a, b) { return a + b; }';
  const answerChars = targetAnswer.toUpperCase().split('');

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedCell]);

  const handleCellClick = (row, col) => {
    if (disabled) return;
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (e) => {
    if (disabled || !/[a-zA-Z0-9\s(){};+=_\$]/.test(e.key)) return;
    
    e.preventDefault();
    const newGrid = grid.map(r => [...r]);
    
    newGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();
    
    let nextCol = selectedCell.col + 1;
    let nextRow = selectedCell.row;
    
    if (nextCol >= 20) {
      nextCol = 0;
      nextRow += 1;
    }
    
    if (nextRow < 8) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
    
    setGrid(newGrid);
    setScore(prev => Math.min(100, prev + 2));
    
    // Check completion
    const filledText = newGrid.flat().join('').replace(/\s+/g, ' ').trim();
    if (filledText.includes(targetAnswer.toUpperCase())) {
      // 🔥 SHOW SCORE POPUP SEBELUM onCorrect()
      setShowScorePopup(true);
      setTimeout(() => {
        setShowScorePopup(false);
        onCorrect();
      }, 2500); // 2.5 detik untuk lihat popup
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, disabled]);

  const getCellColor = (row, col) => {
    const cellValue = grid[row][col];
    const expectedChar = answerChars[row * 20 + col] || '';
    
    if (cellValue === expectedChar && expectedChar) return '#10b981';
    if (cellValue && cellValue !== expectedChar) return '#ef4444';
    return '#f3f4f6';
  };

  // 🔥 SCORE POPUP COMPONENT
  const ScorePopup = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4)',
        maxWidth: '400px',
        width: '90%',
        transform: 'scale(1)',
        animation: 'popupSlide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        }}>
          🎉
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          marginBottom: '0.5rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          SELAMAT!
        </div>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          opacity: 0.95
        }}>
          Score: <span style={{ color: '#ecfdf5' }}>{score}</span>/100
        </div>
        <div style={{
          fontSize: '1.1rem',
          opacity: 0.9,
          lineHeight: '1.4',
          marginBottom: '2rem'
        }}>
          Kamu berhasil mengetik semua kode dengan benar!
        </div>
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: '600',
          backdropFilter: 'blur(10px)'
        }}>
          ⏱️ Selesai dalam {Math.round((grid.flat().filter(c => c).length * 50) / 1000)} detik
        </div>
      </div>
    </div>
  );

  // JIKA BELUM ADA SOAL
  if (!questionText.trim()) {
    return (
      <div style={{ 
        height: '100%', 
        minHeight: '500px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⌨️</div>
          <h3>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Coding di admin</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🔥 SCORE POPUP - HANYA TAMPIL KETIKA showScorePopup = true */}
      {showScorePopup && <ScorePopup />}
      
      <div style={{
        height: '100%',
        minHeight: '650px',
        maxHeight: '850px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        fontFamily: '"JetBrains Mono", Monaco, Consolas, monospace'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          fontWeight: '700',
          fontSize: '1rem',
          boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
          minHeight: '60px'
        }}>
          <div>⌨️ Score: {score}/100</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Klik kotak → Ketik kode
          </div>
        </div>

        {/* SOAL ADMIN */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '2px solid #e5e7eb',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#1f2937'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#1e40af' }}>
            📝 Soal:
          </div>
          {questionText}
        </div>

        {/* Hint - HANYA 3 KARAKTER PERTAMA */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          border: '2px dashed #22c55e',
          fontSize: '1rem',
          color: '#166534',
          fontFamily: 'inherit',
          fontWeight: '500'
        }}>
          💡 Hint: <code>{targetAnswer.slice(0, 25)}...</code>
        </div>

        {/* Grid Editor - FIXED SIZE */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: '24px',
          padding: '2rem 1rem',
          gap: '1.5rem',
          minHeight: '400px'
        }}>
          {/* Grid Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(20, 26px)`,
            gridTemplateRows: `repeat(8, 30px)`,
            gap: '1px',
            maxWidth: '580px',
            width: '100%',
            background: '#334155',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4), 0 15px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }} tabIndex={0} ref={inputRef}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellColor = getCellColor(rowIndex, colIndex);
                const isSelected = rowIndex === selectedCell.row && colIndex === selectedCell.col;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                        : cellColor,
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: isSelected ? 'white' : '#1e293b',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      border: isSelected ? '2px solid #60a5fa' : '1px solid transparent',
                      boxShadow: isSelected 
                        ? '0 0 15px rgba(59,130,246,0.6)' 
                        : cell ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      userSelect: 'none'
                    }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell || ''}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Progress - Fixed Position */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '250px',
            textAlign: 'center'
          }}>
            Progress: {Math.round((score / 100) * 100)}% | 
            Karakter: <strong>{grid.flat().filter(c => c).length}</strong>/160
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
          ⌨️ Gunakan keyboard untuk mengetik | Klik kotak untuk pindah posisi
        </div>
      </div>
    </>
  );
};

export default TypingGame;
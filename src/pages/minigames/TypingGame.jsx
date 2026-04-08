import React, { useState, useEffect, useRef } from 'react';

const TypingGame = ({ 
  question, 
  levelId, 
  onLevelComplete, 
  onCorrect, 
  onWrong, 
  disabled = false,
  userStats 
}) => {
  const [grid, setGrid] = useState(Array(8).fill().map(() => Array(20).fill('')));
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef();

  // 🔥 SOAL DARI ADMIN + TARGET ANSWER
  const questionText = question?.content || 'Tulis fungsi untuk menjumlahkan 2 angka';
  const targetAnswer = question?.meta?.answer || 'function tambah(a, b) { return a + b; }';
  const rewardXp = question?.reward_xp || 25;
  const answerChars = targetAnswer.toUpperCase().split('');

  useEffect(() => {
    if (!disabled && !isCompleted) {
      inputRef.current?.focus();
    }
  }, [selectedCell, disabled, isCompleted]);

  const handleCellClick = (row, col) => {
    if (disabled || isCompleted || isSubmitting) return;
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (e) => {
    if (disabled || isCompleted || isSubmitting || !/[a-zA-Z0-9\s(){};+=_\$]/.test(e.key)) return;
    
    e.preventDefault();
    const newGrid = grid.map(r => [...r]);
    
    newGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();
    
    let nextCol = selectedCell.col + 1;
    let nextRow = selectedCell.row;
    
    if (nextCol >= 20) {
      nextCol = 0;
      nextRow += 1;
    }
    
    if (nextRow < 8 && !isCompleted) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
    
    setGrid(newGrid);
    const newScore = Math.min(100, score + 2);
    setScore(newScore);
    
    // Check completion
    const filledText = newGrid.flat().join('').replace(/\s+/g, ' ').trim();
    if (filledText.includes(targetAnswer.toUpperCase()) && !isCompleted) {
      handleCompletion(newScore);
    }
  };

  // 🔥 HANDLE LEVEL COMPLETION
  const handleCompletion = async (finalScore) => {
    setIsCompleted(true);
    setIsSubmitting(true);
    
    // Auto submit ke backend
    try {
      const submitData = {
        scorePercent: finalScore,
        totalQuestions: 1,
        correctAnswers: 1,
        heartsUsed: 1
      };

      if (onLevelComplete) {
        await onLevelComplete(submitData);
      }

      setTimeout(() => {
        setShowCompletionModal(true);
        setIsSubmitting(false);
      }, 800);
    } catch (error) {
      console.error('Completion failed:', error);
      setIsSubmitting(false);
    }
  };

  // 🔥 GLOBAL KEY LISTENER
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e);
    if (!disabled && !isCompleted) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, disabled, isCompleted, isSubmitting]);

  const getCellColor = (row, col) => {
    const cellValue = grid[row][col];
    const expectedChar = answerChars[row * 20 + col] || '';
    
    if (cellValue === expectedChar && expectedChar && isCompleted) return '#10b981';
    if (cellValue && cellValue !== expectedChar) return '#ef4444';
    return '#f3f4f6';
  };

  const getBadge = (scorePercent) => {
    if (scorePercent >= 90) return { name: 'Gold', color: '#f59e0b', emoji: '🥇' };
    if (scorePercent >= 75) return { name: 'Silver', color: '#9ca3af', emoji: '🥈' };
    if (scorePercent >= 60) return { name: 'Bronze', color: '#b45309', emoji: '🥉' };
    return { name: 'Completed', color: '#6b7280', emoji: '✅' };
  };

  // 🔥 COMPLETION MODAL
  if (showCompletionModal) {
    const badgeInfo = getBadge(score);
    return (
      <div style={{
        height: '100%',
        minHeight: '650px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          padding: '3rem 2.5rem',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}>
          {/* Success Icon */}
          <div style={{
            fontSize: '5rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            width: '140px',
            height: '140px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px rgba(16,185,129,0.4)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            🎉
          </div>
          
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Level Selesai!
          </h2>

          {/* Score Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '2rem 1.5rem',
            borderRadius: '20px',
            marginBottom: '2rem',
            border: '3px solid #f59e0b',
            boxShadow: '0 10px 30px rgba(245,158,11,0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              background: 'linear-gradient(135deg, #b45309, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {Math.round(score)}%
            </div>
            <div style={{ color: '#92400e', fontSize: '1.1rem', fontWeight: '600' }}>
              Perfect Score!
            </div>
          </div>

          {/* Rewards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              fontWeight: '700',
              boxShadow: '0 10px 25px rgba(16,185,129,0.3)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '1.3rem' }}>XP</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>+{rewardXp}</div>
            </div>
            
            <div style={{
              background: `linear-gradient(135deg, ${badgeInfo.color}, ${badgeInfo.color}cc)`,
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              fontWeight: '700',
              boxShadow: `0 10px 25px ${badgeInfo.color}33`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badgeInfo.emoji}</div>
              <div style={{ fontSize: '1.3rem' }}>Badge</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{badgeInfo.name}</div>
            </div>
          </div>

          {/* Success Message */}
          <div style={{
            padding: '2rem 1.5rem',
            background: 'rgba(34,197,94,0.15)',
            borderRadius: '16px',
            border: '2px solid rgba(34,197,94,0.3)',
            marginBottom: '2.5rem',
            fontSize: '1.2rem',
            color: '#166534',
            fontWeight: '600',
            lineHeight: '1.5'
          }}>
            🎉 Selamat! Kamu berhasil menyelesaikan level ini dengan sempurna dan mendapatkan semua rewards!
          </div>

          {/* Action Button */}
          <button 
            onClick={() => {
              setShowCompletionModal(false);
              onCorrect?.();
            }}
            style={{
              width: '100%',
              padding: '1.5rem 2rem',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '1.2rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 15px 35px rgba(59,130,246,0.4)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 20px 40px rgba(59,130,246,0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 15px 35px rgba(59,130,246,0.4)';
            }}
          >
            🚀 Lanjut ke Level Berikutnya
          </button>

          {/* Current Stats */}
          {userStats && (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '12px',
              marginTop: '2rem',
              fontSize: '0.95rem',
              color: '#374151'
            }}>
              <div><strong>Total XP:</strong> {userStats.xp || 0}</div>
              <div><strong>Hearts:</strong> {userStats.hearts || 5}/5</div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: translateY(50px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
        `}</style>
      </div>
    );
  }

  // 🔥 NO QUESTION STATE
  if (!questionText?.trim()) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⌨️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Coding di admin panel</p>
        </div>
      </div>
    );
  }

  // 🔥 MAIN GAME UI
  return (
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
        <div>⌨️ Score: {Math.round(score)}/100</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          {isCompleted ? '✅ Selesai!' : 'Klik kotak → Ketik kode'}
        </div>
      </div>

      {/* Question */}
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

      {/* Hint */}
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
        💡 Hint: <code>{targetAnswer.slice(0, 35)}...</code>
      </div>

      {/* Grid Editor */}
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
                                        background: isSelected && !isCompleted
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                      : cellColor,
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: isSelected ? 'white' : '#1e293b',
                    cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid #60a5fa' : '1px solid transparent',
                    boxShadow: isSelected && !isCompleted
                      ? '0 0 15px rgba(59,130,246,0.6)' 
                      : cell ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                    opacity: isCompleted ? 0.8 : 1
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell || ''}
                </div>
              );
            })
          )}
        </div>
        
        {/* Progress */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          border: '1px solid rgba(255,255,255,0.2)',
          minWidth: '280px',
          textAlign: 'center'
        }}>
          Progress: {Math.round((score / 100) * 100)}% | 
          Karakter: <strong>{grid.flat().filter(c => c).length}</strong>/160
          {isCompleted && (
            <div style={{ fontSize: '0.9rem', mt: '0.5rem', opacity: 0.9 }}>
              ✅ Menunggu konfirmasi...
            </div>
          )}
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
        ⌨️ Gunakan keyboard untuk mengetik | Klik kotak untuk pindah posisi | 
        {isSubmitting && '⏳ Mensubmit...'}
      </div>
    </div>
  );
};

export default TypingGame;
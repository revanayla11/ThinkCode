import React, { useState, useEffect } from 'react';

const DragDropGame = ({ 
  question, 
  levelId, 
  onLevelComplete, 
  onCorrect, 
  onWrong, 
  disabled = false,
  userStats 
}) => {
  // 🔥 DATA DARI ADMIN
  const questionText = question?.content || 'Susun urutan yang benar!';
  const correctOrder = question?.meta?.answers || ['A', 'B', 'C', 'D'];
  const rewardXp = question?.reward_xp || 30;
  
  const [items, setItems] = useState([]);
  const [userMapping, setUserMapping] = useState({});
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const newItems = Array.from({length: correctOrder.length}, (_, i) => 
      String.fromCharCode(65 + i)
    );
    setItems(newItems);
    setUserMapping({});
    setScore(0);
    setIsCompleted(false);
  }, [question]);

  const handleDragStart = (e, item) => {
    if (disabled || isCompleted || isSubmitting) return;
    e.dataTransfer.setData('item', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    if (disabled || isCompleted || isSubmitting) return;
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
    const newScore = Math.round((correctCount / correctOrder.length) * 100);
    setScore(newScore);
    
    // Complete check
    if (Object.keys(newMapping).length === correctOrder.length) {
      const isCompleteCorrect = Object.entries(newMapping).every(([idx, item]) => 
        item === correctOrder[idx]
      );
      
      if (isCompleteCorrect) {
        setIsCompleted(true);
        handleCompletion(newScore);
      } else {
        onWrong?.();
      }
    }
  };

  // 🔥 HANDLE COMPLETION
  const handleCompletion = async (finalScore) => {
    setIsSubmitting(true);
    
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
      }, 800);
    } catch (error) {
      console.error('Completion failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadge = (scorePercent) => {
    if (scorePercent === 100) return { name: 'Gold', color: '#f59e0b', emoji: '🥇' };
    if (scorePercent >= 90) return { name: 'Platinum', color: '#a855f7', emoji: '⭐' };
    if (scorePercent >= 75) return { name: 'Silver', color: '#9ca3af', emoji: '🥈' };
    return { name: 'Bronze', color: '#b45309', emoji: '🥉' };
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
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,251,235,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          animation: 'float 5s ease-in-out infinite'
        }} />
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(25px)',
          padding: '3rem 2.5rem',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          maxWidth: '520px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.3)',
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
            🧩
          </div>
          
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            Urutan Sempurna!
          </h2>

          {/* Score Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '2rem 1.5rem',
            borderRadius: '20px',
            marginBottom: '2rem',
            border: '3px solid #f59e0b',
            boxShadow: '0 15px 35px rgba(245,158,11,0.3)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              color: '#b45309'
            }}>
              {score}%
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#92400e' }}>
              Perfect Sequence!
            </div>
          </div>

          {/* Rewards */}
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
            fontWeight: '600'
          }}>
            🎉 Kamu berhasil menyusun urutan dengan sempurna!
          </div>

          {/* Next Button */}
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
              transition: 'all 0.3s ease'
            }}
          >
            🚀 Lanjut Level Selanjutnya
          </button>

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
            from { opacity: 0; transform: translateY(50px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  // 🔥 NO QUESTION STATE
  if (!questionText?.trim() || correctOrder.length === 0) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔗</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Drag & Drop di admin panel</p>
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: `linear-gradient(135deg, 
          ${score === 100 ? '#10b981' : score >= 75 ? '#f59e0b' : '#3b82f6'}, 
          ${score === 100 ? '#059669' : score >= 75 ? '#d97706' : '#1d4ed8'})`,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(16,185,129,0.3)',
        minHeight: '60px'
      }}>
        <div>🔗 Drag & Drop {isCompleted && '✅'}</div>
        <div style={{ fontSize: '1.1rem' }}>
          Score: <strong>{score}%</strong> {isSubmitting && '⏳'}
        </div>
      </div>

      {/* Question */}
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
        🧩 Seret huruf ke posisi angka yang benar! Lengkapi semua untuk selesai
      </div>

      {/* Main Game */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '3rem', 
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: '400px',
        opacity: isCompleted || isSubmitting ? 0.7 : 1,
        pointerEvents: isCompleted || isSubmitting ? 'none' : 'auto'
      }}>
        {/* Items */}
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
              draggable={!disabled && !isCompleted && !isSubmitting}
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
                cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'grab',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                userSelect: 'none'
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

        {/* Targets */}
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
                cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            right: '-20px',
            top: '-8px',
            width: '16px',
            height: '16px',
            background: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: score > 0 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {score}%
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
        🖱️ Seret huruf ke posisi angka | 
        {isCompleted ? '✅ Menunggu konfirmasi...' : 'Lengkapi semua untuk selesai'}
      </div>
    </div>
  );
};

export default DragDropGame;
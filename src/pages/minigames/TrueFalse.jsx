import React, { useState, useEffect } from 'react';

const TrueFalse = ({ 
  question, 
  levelId, 
  onLevelComplete, 
  onCorrect, 
  onWrong, 
  disabled = false,
  userStats 
}) => {
  const [cards, setCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState({ true: [], false: [] });
  const [showFeedback, setShowFeedback] = useState({ show: false, type: '', message: '' });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  // 🔥 DATA DARI ADMIN
  const questionText = question?.content || '';
  const adminStatements = questionText.split('\n').filter(s => s.trim());
  const correctAnswers = question?.meta?.answer ? 
    question.meta.answer.split(',').map(a => a.trim() === 'true') : [];
  const rewardXp = question?.reward_xp || 25;

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
      setScore(0);
      setIsCompleted(false);
    }
  }, [question]);

  const showMiniFeedback = (type, message) => {
    setShowFeedback({ show: true, type, message });
    setTimeout(() => setShowFeedback({ show: false, type: '', message: '' }), 1500);
  };

  const handleDragStart = (e, cardId) => {
    if (disabled || isCompleted || isSubmitting) return;
    e.dataTransfer.setData('cardId', cardId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, isTrue) => {
    if (disabled || isCompleted || isSubmitting) return;
    e.preventDefault();
    
    const cardId = parseInt(e.dataTransfer.getData('cardId'));
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
      const newDropped = { ...droppedCards };
      newDropped[isTrue ? 'true' : 'false'].push(card);
      
      setDroppedCards(newDropped);
      setCards(prev => prev.filter(c => c.id !== cardId));
      
      // Calculate score
      const totalPlaced = newDropped.true.length + newDropped.false.length;
      let correctCount = 0;
      Object.entries(newDropped).forEach(([bucket, bucketCards]) => {
        bucketCards.forEach(card => {
          if (card.correct === (bucket === 'true')) correctCount++;
        });
      });
      const newScore = Math.round((correctCount / totalPlaced) * 100);
      setScore(newScore);
      
      // Final check
      if (totalPlaced === adminStatements.length) {
        setIsCompleted(true);
        setTimeout(() => {
          const allCorrect = Object.values(newDropped).every(dropped => 
            dropped.every(card => card.correct === (dropped === newDropped.true))
          );
          
          if (allCorrect) {
            handleCompletion(newScore);
          } else {
            onWrong?.();
          }
        }, 1200);
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
        background: 'linear-gradient(135deg, #ec4899, #be185d)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 75%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          animation: 'float 4s ease-in-out infinite'
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
            ✅
          </div>
          
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            Klasifikasi Sempurna!
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
              Perfect Classification!
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
            🎉 Kamu berhasil mengklasifikasi semua pernyataan dengan benar!
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
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📝</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal True/False di admin panel</p>
        </div>
      </div>
    );
  }

  // Hitung ukuran card berdasarkan panjang teks
  const getCardWidth = (content) => {
    const wordCount = content.split(' ').length;
    if (wordCount <= 4) return '160px';
    if (wordCount <= 7) return '220px';
    if (wordCount <= 10) return '280px';
    return '340px';
  };

  // 🔥 MAIN UI
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
          ${score === 100 ? '#10b981' : score >= 75 ? '#ec4899' : '#3b82f6'}, 
          ${score === 100 ? '#059669' : score >= 75 ? '#be185d' : '#1d4ed8'})`,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(16,185,129,0.3)',
        minHeight: '60px'
      }}>
        <div>📝 True/False {isCompleted && '✅'}</div>
        <div style={{ fontSize: '1.1rem' }}>
          Score: <strong>{score}%</strong> {isSubmitting && '⏳'}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(236, 72, 153, 0.1)',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: '2px dashed #ec4899',
        color: '#be185d',
        fontWeight: '600',
        fontSize: '1rem'
      }}>
        🧩 Seret pernyataan ke kolom BENAR atau SALAH
      </div>

      {/* Game Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        opacity: isCompleted || isSubmitting ? 0.8 : 1,
        pointerEvents: isCompleted || isSubmitting ? 'none' : 'auto'
      }}>
        {/* Statements Cards */}
        <div style={{
          flex: '0 0 160px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          border: '3px dashed #d1d5db',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
          minHeight: '140px'
        }}>
          {cards.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#10b981', 
              fontSize: '1.2rem', 
              fontWeight: '800', 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              🎉 Semua sudah ditempatkan!
            </div>
          ) : (
            cards.map((card, idx) => (
              <div
                key={card.id}
                draggable={!disabled && !isCompleted && !isSubmitting}
                onDragStart={(e) => handleDragStart(e, card.id)}
                style={{
                  width: getCardWidth(card.content),
                  height: '90px',
                  padding: '1.2rem',
                  background: `linear-gradient(135deg, hsl(${220 + (idx % 6) * 40}, 70%, 95%), hsl(${220 + (idx % 6) * 40}, 60%, 92%))`,
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'grab',
                  border: '2px solid rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  lineHeight: '1.3',
                  transition: 'all 0.25s ease',
                  userSelect: 'none',
                                    display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  maxWidth: '360px'
                }}
              >
                <div style={{ flex: 1 }}>{card.content}</div>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                  flexShrink: 0
                }}>
                  🖱️
                </div>
              </div>
            ))
          )}
        </div>

        {/* True/False Boxes */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem',
          justifyContent: 'center',
          alignItems: 'stretch',
          minHeight: '320px'
        }}>
          {/* TRUE Box */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, true)}
            style={{
              flex: 1, maxWidth: '420px',
              background: 'linear-gradient(135deg, #10b98120, #10b98110)',
              border: '4px dashed #10b981',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex', flexDirection: 'column',
              gap: '1rem',
              backdropFilter: 'blur(15px)',
              cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 20px 50px rgba(16, 185, 129, 0.2)',
              minHeight: '300px'
            }}
          >
            <div style={{
              fontSize: '2rem', fontWeight: '900', color: '#10b981',
              textAlign: 'center', textShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
              marginBottom: '1rem'
            }}>
              ✅ BENAR
            </div>
            <div style={{
              flex: 1, display: 'flex', flexWrap: 'wrap', gap: '1rem',
              justifyContent: 'center', alignContent: 'flex-start', padding: '1rem 0'
            }}>
              {droppedCards.true.map(card => (
                <div key={card.id} style={{
                  padding: '1.2rem 1.4rem',
                  background: card.correct === true ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  borderRadius: '14px',
                  border: `3px solid ${card.correct === true ? '#10b981' : '#ef4444'}`,
                  fontSize: '0.88rem', maxWidth: '180px',
                  boxShadow: card.correct === true ? '0 8px 25px rgba(16, 185, 129, 0.35)' : '0 8px 25px rgba(239, 68, 68, 0.3)',
                  position: 'relative', lineHeight: '1.35', userSelect: 'none'
                }}>
                  <div>{card.content}</div>
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: card.correct === true ? '#10b981' : '#ef4444',
                    color: 'white', borderRadius: '50%', width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
                  }}>
                    {card.correct === true ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FALSE Box */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, false)}
            style={{
              flex: 1, maxWidth: '420px',
              background: 'linear-gradient(135deg, #ef444420, #ef444410)',
              border: '4px dashed #ef4444',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex', flexDirection: 'column',
              gap: '1rem',
              backdropFilter: 'blur(15px)',
              cursor: (disabled || isCompleted || isSubmitting) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 20px 50px rgba(239, 68, 68, 0.2)',
              minHeight: '300px'
            }}
          >
            <div style={{
              fontSize: '2rem', fontWeight: '900', color: '#ef4444',
              textAlign: 'center', textShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              marginBottom: '1rem'
            }}>
              ❌ SALAH
            </div>
            <div style={{
              flex: 1, display: 'flex', flexWrap: 'wrap', gap: '1rem',
              justifyContent: 'center', alignContent: 'flex-start', padding: '1rem 0'
            }}>
              {droppedCards.false.map(card => (
                <div key={card.id} style={{
                  padding: '1.2rem 1.4rem',
                  background: card.correct === false ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  borderRadius: '14px',
                  border: `3px solid ${card.correct === false ? '#10b981' : '#ef4444'}`,
                  fontSize: '0.88rem', maxWidth: '180px',
                  boxShadow: card.correct === false ? '0 8px 25px rgba(16, 185, 129, 0.35)' : '0 8px 25px rgba(239, 68, 68, 0.3)',
                  position: 'relative', lineHeight: '1.35', userSelect: 'none'
                }}>
                  <div>{card.content}</div>
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: card.correct === false ? '#10b981' : '#ef4444',
                    color: 'white', borderRadius: '50%', width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
                  }}>
                    {card.correct === false ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '16px',
        background: '#e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, 
            ${score === 100 ? '#10b981' : score >= 75 ? '#ec4899' : score >= 50 ? '#f59e0b' : '#ef4444'} 0%, 
            #fbbf24 100%)`,
          width: `${score}%`,
          borderRadius: '8px',
          transition: 'width 0.5s ease',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            right: '-20px',
            top: '-10px',
            width: '20px',
            height: '20px',
            background: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
            display: score > 0 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {score}%
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        padding: '1rem',
        borderRadius: '14px',
        textAlign: 'center',
        fontSize: '0.95rem',
        color: '#6b7280',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        fontWeight: '500'
      }}>
        🖱️ Seret pernyataan ke kolom <strong>BENAR</strong> atau <strong>SALAH</strong> | 
        {isCompleted ? '✅ Menunggu konfirmasi...' : 'Lengkapi semua untuk selesai'}
      </div>
    </div>
  );
};

export default TrueFalse;
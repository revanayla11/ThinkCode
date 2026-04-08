import React, { useState } from 'react';

const MultipleChoice = ({ 
  question, 
  levelId, 
  onLevelComplete, 
  onCorrect, 
  onWrong, 
  disabled = false,
  userStats 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  // 🔥 DATA DARI ADMIN
  const questionText = question?.content || 'Pilih jawaban yang benar';
  const options = question?.meta?.options || ['Belum ada pilihan jawaban'];
  const correctIndex = parseInt(question?.meta?.answerIndex) || 0;
  const rewardXp = question?.reward_xp || 20;

  const handleAnswer = async (index) => {
    if (disabled || isAnswered || isSubmitting) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrect = index === correctIndex;
    const finalScore = isCorrect ? 100 : 0;
    setScore(finalScore);
    
    setTimeout(async () => {
      if (isCorrect) {
        await handleCompletion(finalScore);
      } else {
        onWrong?.();
        setTimeout(() => setSelectedAnswer(null), 1500);
        setTimeout(() => setIsAnswered(false), 1500);
      }
    }, 800);
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
      }, 500);
    } catch (error) {
      console.error('Completion failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadge = (scorePercent) => {
    if (scorePercent === 100) return { name: 'Gold', color: '#f59e0b', emoji: '🥇' };
    return { name: 'Silver', color: '#9ca3af', emoji: '🥈' };
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
        background: 'linear-gradient(135deg, #10b981, #059669)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'float 4s ease-in-out infinite'
        }} />
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(25px)',
          padding: '3rem 2.5rem',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.3)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}>
          {/* Success Icon */}
          <div style={{
            fontSize: '5rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            width: '140px',
            height: '140px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px rgba(245,158,11,0.4)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            ⭐
          </div>
          
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Jawaban Benar!
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
              100%
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#92400e' }}>
              Perfect Answer!
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
            🎉 Jawabanmu sempurna! Kamu mendapatkan semua rewards!
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
              color: '#374151',
              textAlign: 'left'
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
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }

  // 🔥 NO QUESTION STATE
  if (!questionText?.trim() || options.length === 0) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❓</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Multiple Choice di admin panel</p>
        </div>
      </div>
    );
  }

  // 🔥 MAIN UI
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
        background: `linear-gradient(135deg, ${isAnswered ? '#10b981' : '#3b82f6'}, ${isAnswered ? '#059669' : '#1d4ed8'})`,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(16,185,129,0.3)',
        minHeight: '60px'
      }}>
        <div>❓ Multiple Choice {isAnswered && '✅'}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          {isSubmitting ? '⏳ Mensubmit...' : 'Pilih 1 jawaban benar'}
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '2rem',
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
          color: '#1e40af',
          fontSize: '1.3rem'
        }}>
          📝 Soal:
        </div>
        <div>{questionText}</div>
      </div>

      {/* Options */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.2rem',
        padding: '1.5rem',
        background: 'rgba(248, 250, 252, 0.9)',
        borderRadius: '20px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '2px solid #f1f5f9'
      }}>
        {options.map((option, index) => {
          const isCorrectOption = index === correctIndex;
          const isSelected = selectedAnswer === index;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled || isAnswered || isSubmitting}
              style={{
                width: '100%',
                padding: '1.3rem 1.8rem',
                background: disabled || isSubmitting ? '#f8fafc' : 
                           isAnswered ? 
                           (isCorrectOption ? '#dcfce7' : '#fee2e2') :
                           isSelected ? '#dbeafe' : '#ffffff',
                color: disabled || isSubmitting ? '#9ca3af' :
                      isAnswered ? 
                      (isCorrectOption ? '#166534' : '#991b1b') : '#1f2937',
                border: '3px solid',
                borderColor: disabled || isSubmitting ? '#e5e7eb' :
                            isAnswered ? 
                            (isCorrectOption ? '#22c55e' : '#ef4444') : '#e5e7eb',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: (disabled || isAnswered || isSubmitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: (disabled || isAnswered || isSubmitting) ? '0 2px 8px rgba(0,0,0,0.05)' :
                          isCorrectOption ? '0 12px 30px rgba(34,197,94,0.4)' :
                          isSelected ? '0 8px 20px rgba(59,130,246,0.2)' :
                          '0 4px 15px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: '70px',
                opacity: isAnswered && !isCorrectOption && !isSelected ? 0.6 : 1
              }}
            >
              {/* Number Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: disabled || isSubmitting ? '#e5e7eb' :
                           isAnswered ? 
                           (isCorrectOption ? '#22c55e' : '#ef4444') :
                           isSelected ? '#3b82f6' : '#6b7280',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1rem',
                marginRight: '1rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}>
                {index + 1}
              </div>
              
              {/* Option Text */}
              <span style={{ 
                lineHeight: '1.4',
                flex: 1
              }}>
                {option}
              </span>
              
              {/* Checkmark for correct */}
              {isAnswered && isCorrectOption && (
                <div style={{
                  fontSize: '1.5rem',
                  marginLeft: '1rem'
                }}>
                  ✅
                </div>
              )}
            </button>
          );
        })}
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
        🖱️ {isAnswered ? '✅ Jawaban diproses...' : 'Klik pilihan jawaban yang menurutmu benar'}
      </div>
    </div>
  );
};

export default MultipleChoice;
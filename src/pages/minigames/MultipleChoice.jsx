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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
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
        onCorrect?.();
      } else {
        onWrong?.();
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsAnswered(false);
        }, 1500);
      }
    }, 800);
  };

  // 🔥 HANDLE COMPLETION (DIPANGGIL OLEH PARENT KETIKA LEVEL SELESAI)
  const handleLevelCompletion = async (finalScore) => {
    setIsSubmitting(true);
    setShowScorePopup(true); // 🔥 SHOW POPUP HANYA DI AKHIR LEVEL
    
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
    } catch (error) {
      console.error('Completion failed:', error);
    } finally {
      setIsSubmitting(false);
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
            ⭐
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }}>
              🎉
            </div>
            
            <h2 style={{ 
              fontSize: '2.5rem', 
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
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              marginBottom: '2rem',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                color: '#ecfdf5',
                marginBottom: '0.5rem'
              }}>
                {score}%
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
                Perfect Score!
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
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>+{rewardXp}</div>
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
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '2.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              lineHeight: '1.5'
            }}>
              ✅ Level Multiple Choice selesai! Semua rewards berhasil didapatkan!
            </div>

            {/* Auto Continue Timer */}
            <div style={{
              padding: '1rem 2rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              Auto lanjut dalam <span style={{ color: '#ecfdf5', fontSize: '1.2rem' }}>3s</span>
            </div>
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

  // 🔥 MAIN UI - SAMPAI DENGAN TRUEFALSE (TIDAK ADA WARNA BENAR/SALAH)
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

      {/* Options - SAMPAI DENGAN TRUEFALSE (HANYA SELECTED YANG BERUBAH WARNA) */}
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
                           isSelected ? '#dbeafe' : '#ffffff',
                color: disabled || isSubmitting ? '#9ca3af' : '#1f2937',
                border: '3px solid',
                borderColor: disabled || isSubmitting ? '#e5e7eb' : 
                            isSelected ? '#3b82f6' : '#e5e7eb',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: (disabled || isAnswered || isSubmitting) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: (disabled || isAnswered || isSubmitting) ? '0 2px 8px rgba(0,0,0,0.05)' :
                          isSelected ? '0 8px 20px rgba(59,130,246,0.2)' :
                          '0 4px 15px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: '70px',
                opacity: disabled || isSubmitting ? 0.6 : 1
              }}
            >
              {/* Number Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: disabled || isSubmitting ? '#e5e7eb' :
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
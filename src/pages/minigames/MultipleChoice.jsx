import React, { useState, useEffect, useCallback } from 'react';

const MultipleChoice = ({ 
  question, 
  onCorrect, 
  onWrong, 
  disabled = false,
  isProcessing = false // 🔥 Tambah prop ini dari parent
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);

  // 🔥 DATA DARI ADMIN
  const questionText = question?.content || 'Pilih jawaban yang benar';
  const options = question?.meta?.options || ['Belum ada pilihan jawaban'];
  const correctIndex = parseInt(question?.meta?.answerIndex) || 0;

  // 🔥 RESET STATE KETIKA QUESTION BARU
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setLocalProcessing(false);
  }, [question]);

  // 🔥 HANDLER YANG IMMEDIATE & ATOMIC
  const handleAnswer = useCallback((index) => {
    // Cek semua kondisi disable SEBELUM apa pun
    if (disabled || isAnswered || localProcessing || isProcessing) {
      console.log('Blocked:', { disabled, isAnswered, localProcessing, isProcessing });
      return;
    }

    console.log('Answer clicked:', index);
    
    // 🔥 IMMEDIATE STATE UPDATE
    setSelectedAnswer(index);
    setIsAnswered(true);
    setLocalProcessing(true);

    // 🔥 VALIDASI & CALLBACK KE PARENT (INSTANT, NO DELAY)
    const isCorrect = index === correctIndex;
    
    // 🔥 CALL PARENT IMMEDIATELY (tanpa timeout)
    if (isCorrect) {
      onCorrect();
    } else {
      onWrong();
    }

    // 🔥 LOCAL FEEDBACK (tidak bergantung parent)
    if (!isCorrect) {
      // Reset LOCAL state setelah 1.5s untuk wrong answer
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
        setLocalProcessing(false);
      }, 1500);
    }
  }, [disabled, isAnswered, localProcessing, isProcessing, correctIndex, onCorrect, onWrong]);

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
          {(localProcessing || isProcessing) ? '⏳ Memproses...' : 'Pilih 1 jawaban benar'}
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
          const isSelected = selectedAnswer === index;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled || isAnswered || localProcessing || isProcessing}
              style={{
                width: '100%',
                padding: '1.3rem 1.8rem',
                background: (disabled || isAnswered || localProcessing || isProcessing) ? '#f8fafc' : 
                           isSelected ? '#dbeafe' : '#ffffff',
                color: (disabled || isAnswered || localProcessing || isProcessing) ? '#9ca3af' : '#1f2937',
                border: '3px solid',
                borderColor: (disabled || isAnswered || localProcessing || isProcessing) ? '#e5e7eb' : 
                            isSelected ? '#3b82f6' : '#e5e7eb',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: (disabled || isAnswered || localProcessing || isProcessing) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: (disabled || isAnswered || localProcessing || isProcessing) ? '0 2px 8px rgba(0,0,0,0.05)' :
                          isSelected ? '0 8px 20px rgba(59,130,246,0.2)' :
                          '0 4px 15px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: '70px',
                opacity: (disabled || isAnswered || localProcessing || isProcessing) ? 0.6 : 1
              }}
            >
              {/* Number Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: (disabled || isAnswered || localProcessing || isProcessing) ? '#e5e7eb' :
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
        🖱️ {(localProcessing || isProcessing) 
          ? '⏳ Jawaban sedang diproses...' 
          : isAnswered 
          ? '✅ Jawaban sudah dipilih' 
          : 'Klik pilihan jawaban yang menurutmu benar'
        }
      </div>
    </div>
  );
};

export default MultipleChoice;
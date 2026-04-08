import React from 'react';

const MultipleChoice = ({ question, onCorrect, onWrong, disabled }) => {
  // 🔥 DATA DARI ADMIN
  const questionText = question.content || 'Pilih jawaban yang benar';
  const options = question.meta.options || ['Belum ada pilihan jawaban'];
  const correctIndex = parseInt(question.meta.answerIndex) || 0;

  const handleAnswer = (index) => {
    if (disabled) return;
    
    setTimeout(() => {
      if (index === correctIndex) {
        onCorrect();
      } else {
        onWrong();
      }
    }, 300);
  };

  // JIKA BELUM ADA SOAL
  if (!questionText.trim() || options.length === 0) {
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
          <h3>Tunggu soal dari guru!</h3>
          <p>Guru perlu tambah soal Multiple Choice di admin</p>
        </div>
      </div>
    );
  }

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
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
        minHeight: '60px'
      }}>
        <div>❓ Multiple Choice</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          Pilih 1 jawaban benar
        </div>
      </div>

      {/* SOAL ADMIN */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '2rem',
        borderRadius: '20px',
        border: '2px solid #e5e7eb',
        boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#1f2937',
        position: 'relative'
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

      {/* Options - FIXED HEIGHT */}
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
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '1.3rem 1.8rem',
              background: disabled ? '#f8fafc' : 
                         index === correctIndex ? '#dcfce7' : 
                         '#ffffff',
              color: disabled ? '#9ca3af' : 
                    index === correctIndex ? '#166534' : '#1f2937',
              border: '3px solid',
              borderColor: disabled ? '#e5e7eb' : 
                          index === correctIndex ? '#22c55e' : '#e5e7eb',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: disabled ? '0 2px 8px rgba(0,0,0,0.05)' : 
                        index === correctIndex ? 
                        '0 8px 25px rgba(34, 197, 94, 0.3)' : 
                        '0 4px 15px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minHeight: '70px'
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = index === correctIndex 
                  ? '0 12px 30px rgba(34, 197, 94, 0.4)' 
                  : '0 10px 25px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = index === correctIndex 
                  ? '0 8px 25px rgba(34, 197, 94, 0.3)' 
                  : '0 4px 15px rgba(0,0,0,0.08)';
              }
            }}
          >
            {/* Number Badge */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: index === correctIndex ? '#22c55e' : '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1rem',
              marginRight: '1rem',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
        ))}
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
        🖱️ Klik pilihan jawaban yang menurutmu benar
      </div>
    </div>
  );
};

export default MultipleChoice;
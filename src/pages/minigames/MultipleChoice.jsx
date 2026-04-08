import React from 'react';

const MultipleChoice = ({ question, onCorrect, onWrong, disabled }) => {
  const options = question.meta.options || [];
  const correctIndex = question.meta.answerIndex || 0;

  const handleAnswer = (index) => {
    if (disabled) return;
    
    if (index === correctIndex) {
      onCorrect();
    } else {
      onWrong();
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem' 
    }}>
      {/* Instructions */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        fontWeight: '600'
      }}>
        ❓ Pilih jawaban yang benar!
      </div>

      {/* Options */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        padding: '2rem',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={disabled}
            style={{
              padding: '1.5rem 2rem',
              background: disabled ? '#f3f4f6' : 
                         index === correctIndex ? '#10b981' : 
                         '#ffffff',
              color: disabled ? '#9ca3af' : 
                    index === correctIndex ? 'white' : '#1f2937',
              border: '3px solid',
              borderColor: disabled ? '#e5e7eb' : 
                          index === correctIndex ? '#059669' : '#d1d5db',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: disabled ? 'none' : 
                        index === correctIndex ? 
                        '0 10px 25px rgba(16,185,129,0.4)' : 
                        '0 4px 12px rgba(0,0,0,0.1)',
              transform: disabled ? 'none' : 'translateY(0)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!disabled && index !== correctIndex) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {index + 1}. {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;
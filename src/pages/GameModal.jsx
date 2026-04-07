// GameModal.jsx - Self-contained
import React, { useState } from 'react';
import QuizGame from './QuizGame';
import FlashcardGame from './FlashcardGame';
import SheriffGame from './SheriffGame';
import TTSGame from './TTSGame';

const GameModal = ({ game, onClose, onClaimReward }) => {
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const renderGameComponent = () => {
    const gameProps = {
      onComplete: (s) => {
        setScore(s);
        setGameCompleted(true);
      }
    };

    switch (game?.type) {
      case 'quiz': return <QuizGame {...gameProps} />;
      case 'flashcard': return <FlashcardGame {...gameProps} />;
      case 'sheriff': return <SheriffGame {...gameProps} />;
      case 'tts': return <TTSGame {...gameProps} />;
      default: return <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Game loading...</div>;
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const containerStyle = {
    background: 'white',
    borderRadius: '24px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '800px',
    height: '600px',
    position: 'relative',
    boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  if (gameCompleted) {
    return (
      <div style={modalStyle} onClick={onClose}>
        <div style={containerStyle} onClick={e => e.stopPropagation()}>
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2rem'
          }}>
            <div style={{
              fontSize: '6rem',
              color: '#f59e0b'
            }}>
              <i className="fas fa-trophy"></i>
            </div>
            <h2 style={{ fontSize: '2.5rem', color: '#111827', margin: 0 }}>
              Selamat!
            </h2>
            <div style={{
              fontSize: '4rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {score}/100
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              padding: '1.5rem 3rem',
              borderRadius: '20px',
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>
              <div>{game.xp_reward} XP</div>
              <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{game.badge_name}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '1.2rem 3rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                }}
                onClick={() => onClaimReward(score)}
              >
                <i className="fas fa-gift me-2"></i>
                Claim Reward
              </button>
              <button 
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #d1d5db',
                  padding: '1.2rem 2rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={onClose}
              >
                Main Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={containerStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className={`fas fa-${game?.icon}`} style={{ fontSize: '1.5rem' }}></i>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              {game?.title}
            </h2>
          </div>
          <button 
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div style={{
          height: 'calc(100% - 80px)',
          padding: '2rem',
          overflow: 'auto'
        }}>
          {renderGameComponent()}
        </div>
      </div>
    </div>
  );
};

export default GameModal;
// SheriffGame.jsx - Self-contained dengan style inline
import React, { useState, useEffect } from 'react';

const SheriffGame = ({ onComplete }) => {
  const [health, setHealth] = useState(100);
  const [bullets, setBullets] = useState([
    { id: 1, x: '15%', y: '25%', isBad: false, hit: false },
    { id: 2, x: '75%', y: '45%', isBad: true, hit: false },
    { id: 3, x: '30%', y: '65%', isBad: false, hit: false },
    { id: 4, x: '60%', y: '30%', isBad: true, hit: false },
    { id: 5, x: '20%', y: '80%', isBad: false, hit: false }
  ]);
  const [gameOver, setGameOver] = useState(false);

  const handleBulletClick = (bullet) => {
    if (bullet.hit || gameOver) return;

    const newBullets = bullets.map(b => 
      b.id === bullet.id ? { ...b, hit: true } : b
    );
    
    if (bullet.isBad) {
      // Hit bad bullet - lose health
      setHealth(prev => Math.max(0, prev - 25));
      setGameOver(true);
      setTimeout(() => onComplete(25), 1500);
    } else {
      // Hit good bullet - continue
      setBullets(newBullets);
      if (newBullets.filter(b => !b.hit).length === 0) {
        onComplete(100);
      }
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1.5rem'
    }}>
      {/* Health Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #ef4444 0%, #10b981 100%)',
        height: '20px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          height: '100%',
          background: '#10b981',
          width: `${health}%`,
          transition: 'width 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1rem',
          color: 'white',
          fontWeight: '700'
        }}>
          Nyawa: {health}%
        </div>
      </div>

      {/* Sheriff Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        borderRadius: '24px',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid #f59e0b',
        boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.2)'
      }}>
        {/* Sheriff Body */}
        <div style={{
          position: 'relative',
          width: '250px',
          height: '350px'
        }}>
          {/* Head */}
          <div style={{
            position: 'absolute',
            top: '5%',
            left: '35%',
            width: '60px',
            height: '60px',
            background: '#f97316',
            borderRadius: '50%',
            border: '4px solid #ea580c',
            zIndex: 3,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '25%',
              width: '12px',
              height: '12px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '20px 0 0 white'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '20px',
              background: '#f97316',
              borderRadius: '50%'
            }}></div>
          </div>

          {/* Body */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '100px',
            height: '120px',
            background: 'linear-gradient(180deg, #1f2937, #374151)',
            borderRadius: '50px 50px 20px 20px',
            zIndex: 2,
            border: '4px solid #111827'
          }}></div>

          {/* Arms */}
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '10%',
            width: '25px',
            height: '80px',
            background: 'linear-gradient(180deg, #f97316, #ea580c)',
            borderRadius: '20px',
            transformOrigin: 'bottom center',
            transform: 'rotate(-20deg)',
            zIndex: 1
          }}></div>
          <div style={{
            position: 'absolute',
            top: '35%',
            right: '10%',
            width: '25px',
            height: '80px',
            background: 'linear-gradient(180deg, #f97316, #ea580c)',
            borderRadius: '20px',
            transformOrigin: 'bottom center',
            transform: 'rotate(20deg)',
            zIndex: 1
          }}></div>

          {/* Legs */}
          <div style={{
            position: 'absolute',
            bottom: '5%',
            left: '30%',
            width: '20px',
            height: '90px',
            background: 'linear-gradient(180deg, #1f2937, #111827)',
            borderRadius: '10px 10px 20px 20px'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '5%',
            right: '30%',
            width: '20px',
            height: '90px',
            background: 'linear-gradient(180deg, #1f2937, #111827)',
            borderRadius: '10px 10px 20px 20px'
          }}></div>

          {/* Hat */}
          <div style={{
            position: 'absolute',
            top: '2%',
            left: '28%',
            width: '80px',
            height: '35px',
            background: 'linear-gradient(135deg, #7c2d12, #a85521)',
            borderRadius: '40px 40px 10px 10px',
            zIndex: 4,
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}></div>
        </div>

        {/* Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: '40px',
              height: '40px',
              background: bullet.isBad 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: bullet.hit ? 'not-allowed' : 'pointer',
              border: `4px solid ${bullet.hit ? '#6b7280' : 'white'}`,
              boxShadow: bullet.isBad 
                ? '0 0 20px rgba(239, 68, 68, 0.6)' 
                : '0 0 20px rgba(16, 185, 129, 0.6)',
              transition: 'all 0.3s ease',
              opacity: bullet.hit ? 0.5 : 1,
              transform: bullet.hit ? 'scale(0.8)' : 'scale(1)'
            }}
            onClick={() => handleBulletClick(bullet)}
          >
            <i className={`fas fa-${bullet.isBad ? 'skull-crossbones' : 'shield-alt'}`} 
               style={{ fontSize: '1.2rem', color: 'white' }}></i>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '1.3rem',
        color: '#1f2937',
        fontWeight: '700'
      }}>
        Klik peluru merah untuk kalah! Lindungi sheriff! 🛡️
      </div>
    </div>
  );
};

export default SheriffGame;
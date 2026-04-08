// TTSGame.jsx - Self-contained dengan style inline
import React, { useState, useEffect, useRef } from 'react';

const TTSGame = ({ onComplete }) => {
  const [grid, setGrid] = useState(Array(10).fill().map(() => Array(15).fill('')));
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
  const [score, setScore] = useState(0);
  const inputRef = useRef();

  // Words to solve
  const words = [
    { word: 'R E A C T', row: 0, col: 0, horizontal: true },
    { word: 'G A M E S', row: 3, col: 8, horizontal: true },
    { word: 'Q U I Z', row: 6, col: 2, horizontal: true }
  ];

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (selectedCell.row === -1 || !/[a-zA-Z]/.test(e.key)) return;
    
    e.preventDefault();
    const newGrid = grid.map(r => [...r]);
    newGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();
    
    setGrid(newGrid);
    setScore(prev => Math.min(100, prev + 5));
    setSelectedCell(prev => ({ row: prev.row, col: (prev.col + 1) % 15 }));
    
    if (score >= 90) {
      setTimeout(() => onComplete(100), 500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, score, grid]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1rem'
    }}>
      {/* Score & Instructions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Score: {score}
        </div>
        <div style={{ color: '#6b7280', fontSize: '1rem' }}>
          Klik sel → Ketik huruf → Enter
        </div>
      </div>

      {/* Words List */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.05)',
        padding: '1rem',
        borderRadius: '12px',
        border: '2px dashed #c4b5fd'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#6d28d9' }}>Kata yang dicari:</h4>
        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#3730a3' }}>
          REACT • GAMES • QUIZ
        </div>
      </div>

      {/* TTS Grid */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto'
      }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(15, 1fr)',
            gap: '1px',
            maxWidth: '600px',
            background: '#e5e7eb',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
          }}
          tabIndex={0}
          ref={inputRef}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 
                    rowIndex === selectedCell.row && colIndex === selectedCell.col
                      ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                      : cell 
                        ? '#ffffff'
                        : '#f1f5f9',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: rowIndex === selectedCell.row && colIndex === selectedCell.col ? 'white' : '#374151',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  boxShadow: cell ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={(e) => {
                  if (rowIndex === selectedCell.row && colIndex === selectedCell.col) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {cell || ''}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TTSGame;
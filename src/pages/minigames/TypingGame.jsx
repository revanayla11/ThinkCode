import React, { useState, useEffect, useRef } from 'react';

const TypingGame = ({ question, onCorrect, onWrong, disabled }) => {
  const [grid, setGrid] = useState(Array(8).fill().map(() => Array(20).fill('')));
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const inputRef = useRef();

  // Target answer untuk code completion
  const targetAnswer = question.meta.answer || 'function tambah(a, b) { return a + b; }';
  const answerChars = targetAnswer.toUpperCase().split('');

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedCell]);

  const handleCellClick = (row, col) => {
    if (disabled) return;
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (e) => {
    if (disabled || !/[a-zA-Z0-9\s(){};+=_\$\$]/.test(e.key)) return;
    
    e.preventDefault();
    const newGrid = grid.map(r => [...r]);
    
    // Fill current cell
    newGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();
    
    // Move to next cell
    let nextCol = selectedCell.col + 1;
    let nextRow = selectedCell.row;
    
    if (nextCol >= 20) {
      nextCol = 0;
      nextRow += 1;
    }
    
    if (nextRow < 8) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
    
    setGrid(newGrid);
    setScore(prev => Math.min(100, prev + 5));
    
    // Auto complete check
    const filledText = newGrid.flat().join('').replace(/\s+/g, ' ').trim();
    if (filledText.includes(targetAnswer.toUpperCase())) {
      setTimeout(() => onCorrect(), 500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, disabled]);

  const getCellColor = (row, col) => {
    const cellValue = grid[row][col];
    const expectedChar = answerChars[row * 20 + col] || '';
    
    if (cellValue === expectedChar && expectedChar) return '#10b981';
    if (cellValue && cellValue !== expectedChar) return '#ef4444';
    return '#f9fafb';
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1rem',
      fontFamily: 'Monaco, Consolas, monospace'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        fontWeight: '700'
      }}>
        ⌨️ Score: {score}
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Klik kotak → Ketik kode → Tab=Hint
        </div>
      </div>

      {/* Hint */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '1rem',
        borderRadius: '12px',
        border: '2px dashed #3b82f6',
        fontSize: '0.95rem',
        color: '#1e40af'
      }}>
        💡 Hint: {targetAnswer.slice(0, 30)}...
      </div>

      {/* Grid Editor */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: '24px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(20, 28px)`,
          gridTemplateRows: `repeat(8, 32px)`,
          gap: '1px',
          maxWidth: '600px',
          background: '#334155',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
        }} tabIndex={0} ref={inputRef}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const cellColor = getCellColor(rowIndex, colIndex);
              const isSelected = rowIndex === selectedCell.row && colIndex === selectedCell.col;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                      : cellColor,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: isSelected ? 'white' : '#1e293b',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: isSelected ? '3px solid #60a5fa' : '2px solid transparent',
                    boxShadow: isSelected 
                      ? '0 0 20px rgba(59,130,246,0.5)' 
                      : cell ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell || ''}
                </div>
              );
            })
          )}
        </div>
        
        {/* Progress */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1.1rem'
        }}>
          Progress: {Math.round((score / 100) * 100)}% | 
          Karakter: {grid.flat().filter(c => c).length}/160
        </div>
      </div>
    </div>
  );
};

export default TypingGame;
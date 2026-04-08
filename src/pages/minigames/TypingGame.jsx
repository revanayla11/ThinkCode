import React, { useState, useEffect, useRef } from "react";

const TypingGame = ({ question, onCorrect, onWrong, disabled }) => {
  const [grid, setGrid] = useState(
    Array(8).fill().map(() => Array(20).fill(""))
  );
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  const inputRef = useRef();
  const hasFinishedRef = useRef(false);

  // 🔥 DATA DARI ADMIN
  const questionText =
    question.content || "Tulis fungsi untuk menjumlahkan 2 angka";
  const targetAnswer =
    question.meta?.answer || "function tambah(a, b) { return a + b; }";

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedCell]);

  useEffect(() => {
    // reset saat soal baru
    setGrid(Array(8).fill().map(() => Array(20).fill("")));
    setSelectedCell({ row: 0, col: 0 });
    hasFinishedRef.current = false;
  }, [question]);

  const handleCellClick = (row, col) => {
    if (disabled) return;
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (e) => {
    if (disabled) return;
    if (!/[a-zA-Z0-9\s(){};+=_\$]/.test(e.key)) return;

    e.preventDefault();

    const newGrid = grid.map((r) => [...r]);
    newGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();

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

    // 🔥 CHECK JAWABAN
    if (hasFinishedRef.current) return;

    const filledText = newGrid
      .flat()
      .join("")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    const answer = targetAnswer.toUpperCase();

    const isFilledEnough = filledText.length >= answer.length;

    if (isFilledEnough) {
      hasFinishedRef.current = true;

      if (filledText.includes(answer)) {
        onCorrect();
      } else {
        onWrong();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e);
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, grid, disabled]);

  const getCellColor = (row, col) => {
    const cellValue = grid[row][col];
    if (!cellValue) return "#f3f4f6";
    return "#e5e7eb";
  };

  if (!questionText.trim()) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <h3>Tunggu soal dari guru!</h3>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        padding: "1.5rem",
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          fontWeight: "700",
        }}
      >
        ⌨️ Ketik jawaban dengan benar
      </div>

      {/* SOAL */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "16px",
          border: "2px solid #e5e7eb",
        }}
      >
        <strong>📝 Soal:</strong>
        <div style={{ marginTop: "0.5rem" }}>{questionText}</div>
      </div>

      {/* GRID */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#1e293b",
          borderRadius: "20px",
          padding: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(20, 26px)`,
            gridTemplateRows: `repeat(8, 30px)`,
            gap: "2px",
          }}
          tabIndex={0}
          ref={inputRef}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected =
                rowIndex === selectedCell.row &&
                colIndex === selectedCell.col;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: "26px",
                    height: "30px",
                    background: isSelected ? "#3b82f6" : getCellColor(rowIndex, colIndex),
                    color: isSelected ? "white" : "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    borderRadius: "4px",
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        ⌨️ Klik kotak lalu ketik jawaban
      </div>
    </div>
  );
};

export default TypingGame;
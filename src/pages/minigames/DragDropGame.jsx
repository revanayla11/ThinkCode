import React, { useState, useEffect, useRef } from "react";

const DragDropGame = ({ question, onCorrect, onWrong, disabled }) => {
  const questionText = question?.content || "Susun urutan yang benar!";
  const correctOrder = question?.meta?.answers || [];

  const [items, setItems] = useState([]);
  const [userMapping, setUserMapping] = useState({});
  const [score, setScore] = useState(0);

  const hasFinishedRef = useRef(false);

  // 🔥 RESET SAAT SOAL GANTI
  useEffect(() => {
    const newItems = Array.from({ length: correctOrder.length }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    setItems(newItems);
    setUserMapping({});
    setScore(0);
    hasFinishedRef.current = false;
  }, [question]);

  const handleDragStart = (e, item) => {
    if (disabled) return;
    e.dataTransfer.setData("item", item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    if (disabled || hasFinishedRef.current) return;
    e.preventDefault();

    const item = e.dataTransfer.getData("item");

    const newMapping = { ...userMapping };

    // hapus posisi lama
    const prevKey = Object.keys(newMapping).find(
      (key) => newMapping[key] === item
    );
    if (prevKey !== undefined) delete newMapping[prevKey];

    newMapping[targetIndex] = item;

    setUserMapping(newMapping);

    // 🔥 HITUNG SCORE
    let correctCount = 0;
    Object.entries(newMapping).forEach(([idx, mappedItem]) => {
      if (mappedItem === correctOrder[idx]) correctCount++;
    });

    const newScore = Math.round(
      (correctCount / correctOrder.length) * 100
    );
    setScore(newScore);

    // 🔥 CHECK COMPLETE
    if (Object.keys(newMapping).length === correctOrder.length) {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      const isCorrect = Object.entries(newMapping).every(
        ([idx, item]) => item === correctOrder[idx]
      );

      setTimeout(() => {
        if (isCorrect) {
          onCorrect?.();
        } else {
          onWrong?.();

          // optional reset biar bisa ulang
          setTimeout(() => {
            setUserMapping({});
            setScore(0);
            hasFinishedRef.current = false;
          }, 1200);
        }
      }, 500);
    }
  };

  // 🔥 EMPTY STATE
  if (!questionText?.trim() || correctOrder.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          fontWeight: "700",
        }}
      >
        🔗 Drag & Drop | Score: {score}%
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

      {/* GAME AREA */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item) => (
            <div
              key={item}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                width: "70px",
                height: "70px",
                background: Object.values(userMapping).includes(item)
                  ? "#dbeafe"
                  : "#fff",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                cursor: disabled ? "not-allowed" : "grab",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* TARGET */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {correctOrder.map((_, idx) => (
            <div
              key={idx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              style={{
                width: "200px",
                height: "70px",
                border: "2px dashed #60a5fa",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                padding: "0 1rem",
                background: userMapping[idx] ? "#dbeafe" : "#f8fafc",
              }}
            >
              {userMapping[idx]
                ? `${idx + 1}. ${userMapping[idx]}`
                : `${idx + 1}. Taruh di sini`}
            </div>
          ))}
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
        🖱️ Seret huruf ke posisi yang benar
      </div>
    </div>
  );
};

export default DragDropGame;
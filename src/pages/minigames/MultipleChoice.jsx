import React, { useState, useEffect, useRef } from "react";

const MultipleChoice = ({
  question,
  onCorrect,
  onWrong,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const hasFinishedRef = useRef(false);

  // 🔥 DATA DARI ADMIN
  const questionText = question?.content || "Pilih jawaban yang benar";
  const options = question?.meta?.options || [];
  const correctIndex = parseInt(question?.meta?.answerIndex) || 0;

  // 🔥 RESET SAAT SOAL GANTI
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    hasFinishedRef.current = false;
  }, [question]);

  const handleAnswer = (index) => {
    if (disabled || isAnswered || hasFinishedRef.current) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === correctIndex;

    // 🔥 DELAY BIAR ADA FEEL
    setTimeout(() => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      if (isCorrect) {
        onCorrect?.();
      } else {
        onWrong?.();

        // reset biar bisa jawab lagi (optional UX)
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsAnswered(false);
          hasFinishedRef.current = false;
        }, 1200);
      }
    }, 500);
  };

  // 🔥 EMPTY STATE
  if (!questionText?.trim() || options.length === 0) {
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
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          fontWeight: "700",
        }}
      >
        ❓ Multiple Choice {isAnswered && "⏳"}
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

      {/* OPTIONS */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled || isAnswered}
              style={{
                padding: "1.2rem 1.5rem",
                background: isSelected ? "#dbeafe" : "#ffffff",
                border: "2px solid",
                borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: disabled || isAnswered ? "not-allowed" : "pointer",
                textAlign: "left",
              }}
            >
              {index + 1}. {option}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        🖱️ {isAnswered ? "Jawaban diproses..." : "Pilih jawaban yang benar"}
      </div>
    </div>
  );
};

export default MultipleChoice;
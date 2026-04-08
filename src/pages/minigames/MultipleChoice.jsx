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

  // 🔥 SAFE DATA (ANTI ERROR)
  const questionText = question?.content || "";
  const options = question?.meta?.options;
  const correctIndex = parseInt(question?.meta?.answerIndex ?? -1);

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

    setTimeout(() => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      if (isCorrect) {
        onCorrect?.();
      } else {
        onWrong?.();

        // optional retry UX
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsAnswered(false);
          hasFinishedRef.current = false;
        }, 1200);
      }
    }, 500);
  };

  // 🔥 LOADING STATE (BEDA DENGAN EMPTY)
  if (!question) {
    return (
      <div style={styles.center}>
        <div style={styles.text}>⏳ Loading soal...</div>
      </div>
    );
  }

  // 🔥 BELUM ADA DATA DARI ADMIN
  if (!question?.meta || !Array.isArray(options)) {
    return (
      <div style={styles.center}>
        <div style={styles.text}>📭 Soal belum tersedia</div>
      </div>
    );
  }

  // 🔥 EMPTY STATE
  if (!questionText.trim() || options.length === 0) {
    return (
      <div style={styles.center}>
        <div style={styles.text}>🧑‍🏫 Tunggu soal dari guru!</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        ❓ Multiple Choice {isAnswered && "⏳"}
      </div>

      {/* SOAL */}
      <div style={styles.questionBox}>
        <strong>📝 Soal:</strong>
        <div style={{ marginTop: "0.5rem" }}>{questionText}</div>
      </div>

      {/* OPTIONS */}
      <div style={styles.options}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled || isAnswered}
              style={{
                ...styles.option,
                background: isSelected ? "#dbeafe" : "#fff",
                borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                cursor: disabled || isAnswered ? "not-allowed" : "pointer",
              }}
            >
              {index + 1}. {option}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        🖱️{" "}
        {isAnswered
          ? "Jawaban diproses..."
          : "Pilih jawaban yang benar"}
      </div>
    </div>
  );
};

// 🔥 STYLES (BIAR RAPI & REUSABLE)
const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "1.5rem",
  },
  header: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "16px",
    fontWeight: "700",
  },
  questionBox: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "2px solid #e5e7eb",
  },
  options: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  option: {
    padding: "1.2rem 1.5rem",
    border: "2px solid",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    textAlign: "left",
    transition: "0.2s",
  },
  footer: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  center: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: "1.1rem",
    color: "#6b7280",
    textAlign: "center",
  },
};

export default MultipleChoice;
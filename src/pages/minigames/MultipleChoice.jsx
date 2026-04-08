import React, { useState, useEffect, useRef } from "react";

const MultipleChoice = ({
  question,
  onAnswer, // 🔥 SATU CALLBACK (true / false)
  disabled = false,
}) => {
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const lockRef = useRef(false);

  // 🔥 DATA
  const questionText = question?.content || "";
  const options = question?.meta?.options || [];
  const correctIndex = parseInt(question?.meta?.answerIndex ?? -1);

  // 🔄 RESET SAAT SOAL GANTI
  useEffect(() => {
    setSelected(null);
    setIsAnswered(false);
    lockRef.current = false;
  }, [question]);

  // 🎯 HANDLE JAWABAN (SAMA KAYAK TRUEFALSE)
  const handleAnswer = (index) => {
    if (disabled || isAnswered || lockRef.current) return;

    setSelected(index);
    setIsAnswered(true);

    const isCorrect = index === correctIndex;

    // 🔥 KIRIM KE PARENT (POPUP DI PARENT)
    setTimeout(() => {
      if (lockRef.current) return;
      lockRef.current = true;

      onAnswer?.(isCorrect);
    }, 400); // sedikit delay biar ada feel klik
  };

  // ⏳ LOADING
  if (!question) {
    return (
      <div style={styles.center}>
        <div style={styles.text}>⏳ Loading soal...</div>
      </div>
    );
  }

  // ❗ EMPTY
  if (!questionText || options.length === 0) {
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
        <div style={{ marginTop: 8 }}>{questionText}</div>
      </div>

      {/* OPTIONS */}
      <div style={styles.options}>
        {options.map((opt, i) => {
          const isSelected = selected === i;

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={disabled || isAnswered}
              style={{
                ...styles.option,
                background: isSelected ? "#dbeafe" : "#fff",
                borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                cursor:
                  disabled || isAnswered ? "not-allowed" : "pointer",
              }}
            >
              <span style={styles.badge}>{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        {isAnswered
          ? "⏳ Menunggu hasil..."
          : "Pilih jawaban yang benar"}
      </div>
    </div>
  );
};

// 🎨 STYLES
const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "1.5rem",
  },
  header: {
    background: "#3b82f6",
    color: "#fff",
    padding: "1rem",
    borderRadius: 12,
    fontWeight: "bold",
  },
  questionBox: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: 12,
    border: "2px solid #e5e7eb",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: 12,
    border: "2px solid",
    fontWeight: 600,
    textAlign: "left",
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#3b82f6",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },
  center: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#6b7280",
  },
};

export default MultipleChoice;
import { useState } from "react";

export default function DragDropGame({ question, onCorrect, onWrong }) {
  const [dropped, setDropped] = useState(null);

  const handleDrop = (zone) => {
    setDropped(zone);

    const isCorrect = zone === question.meta.answer;

    setTimeout(() => {
      isCorrect ? onCorrect() : onWrong();
    }, 500);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* KARTU */}
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text", "card")}
        style={{
          margin: "20px auto",
          padding: 20,
          width: 300,
          background: "#f3f4f6",
          borderRadius: 15,
          cursor: "grab",
          fontWeight: "bold",
        }}
      >
        {question.meta.statement}
      </div>

      {/* DROP ZONE */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
        {["benar", "salah"].map((zone) => (
          <div
            key={zone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(zone)}
            style={{
              width: 150,
              height: 150,
              borderRadius: 20,
              border: "3px dashed #9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                dropped === zone
                  ? zone === question.meta.answer
                    ? "#bbf7d0"
                    : "#fecaca"
                  : "#fff",
              fontWeight: "bold",
            }}
          >
            {zone.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
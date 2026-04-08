import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../services/api";

export default function AdminMiniGame() {
  const [materi, setMateri] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [levelForm, setLevelForm] = useState({
    levelNumber: "",
    title: "",
    totalQuestions: "",
    reward_xp: "",
    gameType: "mcq",
  });

  const [questionForm, setQuestionForm] = useState({
    content: "",
    options: ["", "", "", "", ""],
    answerIndex: 0,
    answer: "",
    statement: "",
  });

  // ================= LOAD =================
  useEffect(() => {
    loadMateri();
  }, []);

  const loadMateri = async () => {
    const res = await apiGet("/admin/minigame/materi");
    setMateri(res.data);
  };

  const loadLevels = async (slug) => {
    const res = await apiGet(`/admin/minigame/${slug}/levels`);
    setLevels(res.data);
  };

  const loadQuestions = async (slug, levelNumber) => {
    const res = await apiGet(`/admin/minigame/${slug}/levels/${levelNumber}`);
    setQuestions(res.data.questions);
  };

  // ================= LEVEL =================
  const submitLevel = async () => {
    await apiPost(`/admin/minigame/${selectedMateri.slug}/levels`, levelForm);
    loadLevels(selectedMateri.slug);
  };

  // ================= QUESTION =================
  const submitQuestion = async () => {
    let meta = {};

    if (selectedLevel.gameType === "mcq") {
      meta = {
        options: questionForm.options,
        answerIndex: Number(questionForm.answerIndex),
      };
    }

    if (selectedLevel.gameType === "typing") {
      meta = { answer: questionForm.answer };
    }

    if (selectedLevel.gameType === "truefalse") {
      meta = { answer: questionForm.answer === "true" };
    }

    if (selectedLevel.gameType === "dragdrop") {
      meta = {
        statement: questionForm.statement,
        answer: questionForm.answer,
      };
    }

    await apiPost(
      `/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`,
      {
        content: questionForm.content,
        type: selectedLevel.gameType,
        meta,
      }
    );

    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Mini Game Admin</h1>

      {/* ================= MATERI ================= */}
      <h3>Pilih Materi</h3>
      {materi.map((m) => (
        <button
          key={m.id}
          onClick={() => {
            setSelectedMateri(m);
            loadLevels(m.slug);
          }}
        >
          {m.title}
        </button>
      ))}

      {/* ================= LEVEL ================= */}
      {selectedMateri && (
        <>
          <h3>Tambah Level</h3>

          <input
            placeholder="Level Number"
            onChange={(e) =>
              setLevelForm({ ...levelForm, levelNumber: e.target.value })
            }
          />

          <input
            placeholder="Judul Level"
            onChange={(e) =>
              setLevelForm({ ...levelForm, title: e.target.value })
            }
          />

          <input
            placeholder="Total Soal"
            onChange={(e) =>
              setLevelForm({ ...levelForm, totalQuestions: e.target.value })
            }
          />

          <input
            placeholder="XP"
            onChange={(e) =>
              setLevelForm({ ...levelForm, reward_xp: e.target.value })
            }
          />

          {/* 🔥 GAME TYPE */}
          <select
            onChange={(e) =>
              setLevelForm({ ...levelForm, gameType: e.target.value })
            }
          >
            <option value="mcq">MCQ</option>
            <option value="typing">Typing</option>
            <option value="truefalse">True False</option>
            <option value="dragdrop">Drag Drop</option>
          </select>

          <button onClick={submitLevel}>Tambah Level</button>

          <hr />

          <h3>List Level</h3>
          {levels.map((l) => (
            <div key={l.id}>
              <b>
                Level {l.levelNumber} - {l.title} ({l.gameType})
              </b>
              <button
                onClick={() => {
                  setSelectedLevel(l);
                  loadQuestions(selectedMateri.slug, l.levelNumber);
                }}
              >
                Kelola Soal
              </button>
            </div>
          ))}
        </>
      )}

      {/* ================= QUESTION ================= */}
      {selectedLevel && (
        <>
          <h3>Tambah Soal ({selectedLevel.gameType})</h3>

          <textarea
            placeholder="Pertanyaan"
            onChange={(e) =>
              setQuestionForm({ ...questionForm, content: e.target.value })
            }
          />

          {/* MCQ */}
          {selectedLevel.gameType === "mcq" &&
            questionForm.options.map((opt, i) => (
              <input
                key={i}
                placeholder={`Opsi ${i + 1}`}
                onChange={(e) => {
                  const newOpts = [...questionForm.options];
                  newOpts[i] = e.target.value;
                  setQuestionForm({ ...questionForm, options: newOpts });
                }}
              />
            ))}

          {selectedLevel.gameType === "mcq" && (
            <input
              placeholder="Jawaban Index (0-4)"
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  answerIndex: e.target.value,
                })
              }
            />
          )}

          {/* TYPING */}
          {selectedLevel.gameType === "typing" && (
            <input
              placeholder="Jawaban"
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            />
          )}

          {/* TRUE FALSE */}
          {selectedLevel.gameType === "truefalse" && (
            <select
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            >
              <option value="true">Benar</option>
              <option value="false">Salah</option>
            </select>
          )}

          {/* DRAG DROP */}
          {selectedLevel.gameType === "dragdrop" && (
            <>
              <textarea
                placeholder="Statement"
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    statement: e.target.value,
                  })
                }
              />

              <select
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    answer: e.target.value,
                  })
                }
              >
                <option value="benar">Benar</option>
                <option value="salah">Salah</option>
              </select>
            </>
          )}

          <button onClick={submitQuestion}>Tambah Soal</button>

          <hr />

          {/* LIST SOAL */}
          <h3>Daftar Soal</h3>
          {questions.map((q) => {
            const meta = JSON.parse(q.meta || "{}");

            return (
              <div key={q.id}>
                <p>{q.content}</p>

                {q.type === "mcq" && (
                  <p>Jawaban: {meta.options?.[meta.answerIndex]}</p>
                )}

                {q.type === "typing" && <p>{meta.answer}</p>}

                {q.type === "truefalse" && (
                  <p>{meta.answer ? "Benar" : "Salah"}</p>
                )}

                {q.type === "dragdrop" && (
                  <p>
                    {meta.statement} → {meta.answer}
                  </p>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { apiGet, apiPost } from "../../services/api";

// ================= STYLE =================
const Container = styled.div`
  padding: 20px;
`;
const Button = styled.button`
  margin: 5px;
`;
const Input = styled.input`
  display: block;
  margin: 5px 0;
`;
const Textarea = styled.textarea`
  display: block;
  margin: 5px 0;
`;
const Select = styled.select`
  display: block;
  margin: 5px 0;
`;

// ================= COMPONENT =================
export default function AdminMiniGame() {
  const [materi, setMateri] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [levelForm, setLevelForm] = useState({
    title: "",
    levelNumber: "",
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

  const currentGameType = selectedLevel?.gameType;

  // ================= LEVEL =================
  const submitLevel = async () => {
    await apiPost(`/admin/minigame/${selectedMateri.slug}/levels`, levelForm);
    loadLevels(selectedMateri.slug);
  };

  // ================= QUESTION =================
  const submitQuestion = async () => {
    let meta = {};

    if (currentGameType === "mcq") {
      meta = {
        options: questionForm.options,
        answerIndex: Number(questionForm.answerIndex),
      };
    }

    if (currentGameType === "typing") {
      meta = { answer: questionForm.answer };
    }

    if (currentGameType === "truefalse") {
      meta = { answer: questionForm.answer === "true" };
    }

    if (currentGameType === "dragdrop") {
      meta = {
        statement: questionForm.statement,
        answer: questionForm.answer,
      };
    }

    await apiPost(
      `/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`,
      {
        content: questionForm.content,
        type: currentGameType, // 🔥 FIX UTAMA
        meta,
      }
    );

    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  };

  return (
    <Container>
      <h1>Admin Mini Game</h1>

      {/* ================= MATERI ================= */}
      <h3>Pilih Materi</h3>
      {materi.map((m) => (
        <Button
          key={m.id}
          onClick={() => {
            setSelectedMateri(m);
            loadLevels(m.slug);
          }}
        >
          {m.title}
        </Button>
      ))}

      {/* ================= LEVEL ================= */}
      {selectedMateri && (
        <>
          <h3>Tambah Level</h3>

          <Input
            placeholder="Judul"
            onChange={(e) =>
              setLevelForm({ ...levelForm, title: e.target.value })
            }
          />

          <Input
            placeholder="Level"
            onChange={(e) =>
              setLevelForm({ ...levelForm, levelNumber: e.target.value })
            }
          />

          <Select
            onChange={(e) =>
              setLevelForm({ ...levelForm, gameType: e.target.value })
            }
          >
            <option value="mcq">MCQ</option>
            <option value="typing">Typing</option>
            <option value="truefalse">True False</option>
            <option value="dragdrop">Drag Drop</option>
          </Select>

          <Button onClick={submitLevel}>Tambah Level</Button>

          <hr />

          {levels.map((l) => (
            <div key={l.id}>
              <b>
                {l.title} ({l.gameType})
              </b>

              <Button
                onClick={() => {
                  setSelectedLevel(l);
                  loadQuestions(selectedMateri.slug, l.levelNumber);
                }}
              >
                Kelola Soal
              </Button>
            </div>
          ))}
        </>
      )}

      {/* ================= QUESTION ================= */}
      {selectedLevel && (
        <>
          <h3>Tambah Soal ({currentGameType})</h3>

          <Textarea
            placeholder="Pertanyaan"
            onChange={(e) =>
              setQuestionForm({ ...questionForm, content: e.target.value })
            }
          />

          {/* ================= MCQ ================= */}
          {currentGameType === "mcq" &&
            questionForm.options.map((opt, i) => (
              <Input
                key={i}
                placeholder={`Opsi ${i + 1}`}
                onChange={(e) => {
                  const opts = [...questionForm.options];
                  opts[i] = e.target.value;
                  setQuestionForm({ ...questionForm, options: opts });
                }}
              />
            ))}

          {currentGameType === "mcq" && (
            <Input
              placeholder="Jawaban Index (0-4)"
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  answerIndex: e.target.value,
                })
              }
            />
          )}

          {/* ================= TYPING ================= */}
          {currentGameType === "typing" && (
            <Input
              placeholder="Jawaban"
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            />
          )}

          {/* ================= TRUE FALSE ================= */}
          {currentGameType === "truefalse" && (
            <Select
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            >
              <option value="true">Benar</option>
              <option value="false">Salah</option>
            </Select>
          )}

          {/* ================= DRAG DROP ================= */}
          {currentGameType === "dragdrop" && (
            <>
              <Textarea
                placeholder="Statement (yang akan di-drag)"
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    statement: e.target.value,
                  })
                }
              />

              <Select
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    answer: e.target.value,
                  })
                }
              >
                <option value="benar">Masuk ke BENAR</option>
                <option value="salah">Masuk ke SALAH</option>
              </Select>
            </>
          )}

          <Button onClick={submitQuestion}>Tambah Soal</Button>

          <hr />

          {/* ================= LIST SOAL ================= */}
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
    </Container>
  );
}
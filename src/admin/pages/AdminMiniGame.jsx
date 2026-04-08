import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

// ================= STYLE =================
const Container = styled.div``;
const Button = styled.button``;
const Input = styled.input``;
const Textarea = styled.textarea``;
const Select = styled.select``;

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
    type: "mcq",
    options: ["", "", "", "", ""],
    answerIndex: 0,
    answer: "",
    statement: "",
  });

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

    if (questionForm.type === "mcq") {
      meta = {
        options: questionForm.options,
        answerIndex: Number(questionForm.answerIndex),
      };
    }

    if (questionForm.type === "typing") {
      meta = { answer: questionForm.answer };
    }

    if (questionForm.type === "truefalse") {
      meta = { answer: questionForm.answer === "true" };
    }

    if (questionForm.type === "dragdrop") {
      meta = {
        statement: questionForm.statement,
        answer: questionForm.answer,
      };
    }

    await apiPost(
      `/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`,
      {
        content: questionForm.content,
        type: questionForm.type,
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
              <b>{l.title}</b>
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
          <h3>Tambah Soal</h3>

          <Textarea
            placeholder="Pertanyaan"
            onChange={(e) =>
              setQuestionForm({ ...questionForm, content: e.target.value })
            }
          />

          <Select
            onChange={(e) =>
              setQuestionForm({ ...questionForm, type: e.target.value })
            }
          >
            <option value="mcq">MCQ</option>
            <option value="typing">Typing</option>
            <option value="truefalse">True False</option>
            <option value="dragdrop">Drag Drop</option>
          </Select>

          {/* MCQ */}
          {questionForm.type === "mcq" &&
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

          {/* TYPING */}
          {questionForm.type === "typing" && (
            <Input
              placeholder="Jawaban"
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            />
          )}

          {/* TRUE FALSE */}
          {questionForm.type === "truefalse" && (
            <Select
              onChange={(e) =>
                setQuestionForm({ ...questionForm, answer: e.target.value })
              }
            >
              <option value="true">Benar</option>
              <option value="false">Salah</option>
            </Select>
          )}

          {/* DRAG DROP */}
          {questionForm.type === "dragdrop" && (
            <>
              <Textarea
                placeholder="Statement"
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
                <option value="benar">Benar</option>
                <option value="salah">Salah</option>
              </Select>
            </>
          )}

          <Button onClick={submitQuestion}>Tambah Soal</Button>

          <hr />

          {questions.map((q) => {
            const meta = JSON.parse(q.meta || "{}");

            return (
              <div key={q.id}>
                <p>{q.content}</p>

                {q.type === "mcq" && <p>{meta.options?.[meta.answerIndex]}</p>}
                {q.type === "typing" && <p>{meta.answer}</p>}
                {q.type === "truefalse" && (
                  <p>{meta.answer ? "Benar" : "Salah"}</p>
                )}
                {q.type === "dragdrop" && (
                  <p>{meta.statement} → {meta.answer}</p>
                )}
              </div>
            );
          })}
        </>
      )}
    </Container>
  );
}
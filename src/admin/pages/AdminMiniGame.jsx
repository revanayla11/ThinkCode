import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`

  color: #ffffff;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #1E1E2F;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1E1E2F;
`;

const MateriContainer = styled.div`
  margin-bottom: 40px;
`;

const MateriButton = styled.button`
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 10px 20px;
  border: 2px solid ${props => props.active ? '#1E1E2F' : '#d1d5db'};
  border-radius: 10px;
  background: ${props => props.active ? '#1E1E2F' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#1E1E2F'};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(30, 30, 47, 0.3);
  }
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  margin-bottom: 30px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 6px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #1E1E2F;
    box-shadow: 0 0 0 3px rgba(30, 30, 47, 0.1);
  }
`;

const TextareaField = styled.textarea`
  width: 100%;
  padding: 12px 6px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 10px;
  min-height: 80px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #1E1E2F;
    box-shadow: 0 0 0 3px rgba(30, 30, 47, 0.1);
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #1E1E2F;
    box-shadow: 0 0 0 3px rgba(30, 30, 47, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: ${props => {
    if (props.variant === 'success') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    return 'linear-gradient(135deg, #1E1E2F, #3A3A4F)';
  }};
  color: white;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(30, 30, 47, 0.3);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const TableCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #1E1E2F;
  color: #ffffff;
`;

const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.3s ease;
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  font-size: 0.9rem;
  color: #374151;
`;

export default function AdminMiniGame() {
  const [materi, setMateri] = useState([]);
  const [badges, setBadges] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [levelForm, setLevelForm] = useState({
    levelNumber: "",
    title: "",
    totalQuestions: "",
    reward_xp: "",
    reward_badge_id: "",
  });
  const [editingLevelId, setEditingLevelId] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    content: "",
    type: "mcq",
    options: ["", "", "", "", ""],
    answerIndex: 0,
    answer: "",
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  useEffect(() => {
    loadMateri();
    loadBadges();
  }, []);

  const loadMateri = async () => {
    const res = await apiGet("/admin/minigame/materi");
    setMateri(res.data || []);
  };

  const loadBadges = async () => {
    const res = await apiGet("/admin/minigame/badges");
    setBadges(res.data || []);
  };

  const loadLevels = async (slug) => {
    const res = await apiGet(`/admin/minigame/${slug}/levels`);
    setLevels(res.data || []);
    setSelectedLevel(null);
    setQuestions([]);
  };

  const loadQuestions = async (slug, levelNumber) => {
    const res = await apiGet(
      `/admin/minigame/${slug}/levels/${levelNumber}`
    );
    setQuestions(res.data.questions || []);
  };

  const submitLevel = async () => {
    if (!selectedMateri) return alert("Pilih materi dulu");

    const payload = {
      levelNumber: Number(levelForm.levelNumber),
      title: levelForm.title,
      totalQuestions: Number(levelForm.totalQuestions),
      reward_xp: Number(levelForm.reward_xp),
      reward_badge_id: levelForm.reward_badge_id || null,
    };

    if (editingLevelId) {
      await apiPut(`/admin/minigame/level/${editingLevelId}`, payload);
    } else {
      await apiPost(
        `/admin/minigame/${selectedMateri.slug}/levels`,
        payload
      );
    }

    setLevelForm({
      levelNumber: "",
      title: "",
      totalQuestions: "",
      reward_xp: "",
      reward_badge_id: "",
    });
    setEditingLevelId(null);
    loadLevels(selectedMateri.slug);
  };

  const editLevel = (lvl) => {
    setEditingLevelId(lvl.id);
    setLevelForm({
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      totalQuestions: lvl.totalQuestions,
      reward_xp: lvl.reward_xp,
      reward_badge_id: lvl.reward_badge_id || "",
    });
  };

  const deleteLevel = async (id) => {
    if (!window.confirm("Hapus level?")) return;
    await apiDelete(`/admin/minigame/level/${id}`);
    loadLevels(selectedMateri.slug);
  };

  const submitQuestion = async () => {
    if (!selectedMateri || !selectedLevel)
      return alert("Pilih level dulu");

    const meta =
      questionForm.type === "mcq"
        ? {
            options: questionForm.options,
            answerIndex: Number(questionForm.answerIndex),
          }
        : {
            answer: questionForm.answer,
          };

    const payload = {
      content: questionForm.content,
      type: questionForm.type,
      meta,
    };

    if (editingQuestionId) {
      await apiPut(`/admin/minigame/question/${editingQuestionId}`, payload);
    } else {
      await apiPost(
        `/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`,
        payload
      );
    }

    setQuestionForm({
      content: "",
      type: "mcq",
      options: ["", "", "", "", ""],
      answerIndex: 0,
      answer: "",
    });
    setEditingQuestionId(null);
    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  };

  const editQuestion = (q) => {
    const meta = JSON.parse(q.meta || "{}");
    setEditingQuestionId(q.id);
    setQuestionForm({
      content: q.content,
      type: q.type,
      options: meta.options || ["", "", "", "", ""],
      answerIndex: meta.answerIndex ?? 0,
      answer: meta.answer || "",
    });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Hapus soal?")) return;
    await apiDelete(`/admin/minigame/question/${id}`);
    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  };

  return (
    <Container>
      <Header>Mini Game Admin</Header>

      <SectionTitle>Pilih Materi</SectionTitle>
      <MateriContainer>
        {materi.map((m) => (
          <MateriButton
            key={m.id}
            active={selectedMateri?.id === m.id}
            onClick={() => {
              setSelectedMateri(m);
              loadLevels(m.slug);
            }}
          >
            {m.title}
          </MateriButton>
        ))}
      </MateriContainer>

      {selectedMateri && (
        <>
          <SectionTitle>Form Level</SectionTitle>
          <FormCard>
            <FormGroup>
              <InputField
                type="number"
                placeholder="Level"
                value={levelForm.levelNumber}
                onChange={(e) =>
                  setLevelForm({ ...levelForm, levelNumber: e.target.value })
                }
              />
              <InputField
                placeholder="Judul Level"
                value={levelForm.title}
                onChange={(e) =>
                  setLevelForm({ ...levelForm, title: e.target.value })
                }
              />
              <InputField
                type="number"
                placeholder="Total Soal"
                value={levelForm.totalQuestions}
                onChange={(e) =>
                  setLevelForm({ ...levelForm, totalQuestions: e.target.value })
                }
              />
              <InputField
                type="number"
                placeholder="XP"
                value={levelForm.reward_xp}
                onChange={(e) =>
                  setLevelForm({ ...levelForm, reward_xp: e.target.value })
                }
              />

              <SelectField
                value={levelForm.reward_badge_id}
                onChange={(e) =>
                  setLevelForm({
                    ...levelForm,
                    reward_badge_id: e.target.value,
                  })
                }
              >
                <option value="">-- Tanpa Badge --</option>
                {badges.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.badge_name}
                  </option>
                ))}
              </SelectField>

              <Button onClick={submitLevel}>
                {editingLevelId ? "Update Level" : "Tambah Level"}
              </Button>
            </FormGroup>
          </FormCard>

          <TableCard>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Level</TableHeader>
                  <TableHeader>Judul</TableHeader>
                  <TableHeader>XP</TableHeader>
                  <TableHeader>Aksi</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {levels.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.levelNumber}</TableCell>
                    <TableCell>{l.title}</TableCell>
                    <TableCell>{l.reward_xp}</TableCell>
                    <TableCell>
                      <ButtonGroup>
                        <Button onClick={() => editLevel(l)}>Edit</Button>
                        <Button variant="danger" onClick={() => deleteLevel(l.id)}>Hapus</Button>
                        <Button variant="success" onClick={() => {
                          setSelectedLevel(l);
                          loadQuestions(selectedMateri.slug, l.levelNumber);
                        }}>Kelola Soal</Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        </>
      )}

      {selectedLevel && (
        <>
          <SectionTitle>Form Soal – Level {selectedLevel.levelNumber}</SectionTitle>

          <FormCard>
            <FormGroup>
              <TextareaField
                placeholder="Pertanyaan"
                value={questionForm.content}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, content: e.target.value })
                }
              />

              <SelectField
                value={questionForm.type}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, type: e.target.value })
                }
              >
                <option value="mcq">Pilihan Ganda</option>
                <option value="essay">Essay</option>
              </SelectField>

              {questionForm.type === "mcq" &&
                questionForm.options.map((opt, i) => (
                  <InputField
                    key={i}
                    placeholder={`Opsi ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...questionForm.options];
                      opts[i] = e.target.value;
                      setQuestionForm({ ...questionForm, options: opts });
                    }}
                  />
                ))}

              {questionForm.type === "mcq" && (
                <SelectField
                  value={questionForm.answerIndex}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      answerIndex: e.target.value,
                    })
                  }
                >
                  {questionForm.options.map((_, i) => (
                    <option key={i} value={i}>
                      Opsi {i + 1}
                    </option>
                  ))}
                </SelectField>
              )}

              {questionForm.type === "essay" && (
                <InputField
                  placeholder="Jawaban benar"
                  value={questionForm.answer}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, answer: e.target.value })
                  }
                />
              )}

              <Button onClick={submitQuestion}>
                {editingQuestionId ? "Update Soal" : "Tambah Soal"}
              </Button>
            </FormGroup>
          </FormCard>

          <TableCard>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Soal</TableHeader>
                  <TableHeader>Tipe</TableHeader>
                  <TableHeader>Jawaban</TableHeader>
                  <TableHeader>Aksi</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {questions.map((q) => {
                  const meta = JSON.parse(q.meta || "{}");
                  return (
                    <TableRow key={q.id}>
                      <TableCell>{q.content}</TableCell>
                      <TableCell>{q.type}</TableCell>
                      <TableCell>
                        {q.type === "mcq"
                          ? meta.options?.[meta.answerIndex]
                          : meta.answer}
                      </TableCell>
                      <TableCell>
                        <ButtonGroup>
                          <Button onClick={() => editQuestion(q)}>Edit</Button>
                          <Button variant="danger" onClick={() => deleteQuestion(q.id)}>Hapus</Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableCard>
        </>
      )}
    </Container>
  );
}
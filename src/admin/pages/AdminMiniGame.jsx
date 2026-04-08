import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

// ================= STYLES =================
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Card = styled.div`
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px 4px;
  font-size: 14px;
  
  ${props => props.primary && `
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  `}
  
  ${props => props.danger && `
    background: linear-gradient(45deg, #ff6b6b, #ee5a52);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  `}
  
  ${props => props.success && `
    background: linear-gradient(45deg, #51cf66, #40c057);
    color: white;
    box-shadow: 0 4px 15px rgba(81, 207, 102, 0.4);
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  margin: 8px 0;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  margin: 8px 0;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  margin: 8px 0;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const GameTypeBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-left: 12px;
  
  ${props => props.type === 'mcq' && 'background: #ff6b6b;'}
  ${props => props.type === 'typing' && 'background: #51cf66;'}
  ${props => props.type === 'truefalse' && 'background: #339af0;'}
  ${props => props.type === 'dragdrop' && 'background: #f0932b;'}
`;

const LevelItem = styled.div`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const QuestionItem = styled.div`
  background: white;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  position: relative;
`;

const MateriButton = styled(Button)`
  display: block;
  width: 100%;
  text-align: left;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  color: #495057;
  border: 2px solid #dee2e6;
  
  &:hover {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border-color: #667eea;
  }
`;

// ================= COMPONENT =================
export default function AdminMiniGame() {
  const [materi, setMateri] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

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

  // Load materi
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

  // Level CRUD
  const submitLevel = async () => {
    if (editingLevel) {
      await apiPut(`/admin/minigame/level/${editingLevel.id}`, levelForm);
    } else {
      await apiPost(`/admin/minigame/${selectedMateri.slug}/levels`, levelForm);
    }
    setEditingLevel(null);
    setLevelForm({ title: "", levelNumber: "", totalQuestions: "", reward_xp: "", gameType: "mcq" });
    loadLevels(selectedMateri.slug);
  };

  const editLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      title: level.title,
      levelNumber: level.levelNumber,
      totalQuestions: level.totalQuestions,
      reward_xp: level.reward_xp,
      gameType: level.gameType,
    });
  };

  const deleteLevel = async (levelId) => {
    if (confirm("Yakin hapus level ini?")) {
      await apiDelete(`/admin/minigame/level/${levelId}`);
      loadLevels(selectedMateri.slug);
    }
  };

  // Question CRUD
  const submitQuestion = async () => {
    let meta = {};

    if (currentGameType === "mcq") {
      meta = { options: questionForm.options, answerIndex: Number(questionForm.answerIndex) };
    } else if (currentGameType === "typing") {
      meta = { answer: questionForm.answer }; // Jawaban code yang harus dilengkapi
    } else if (currentGameType === "truefalse") {
      meta = { statement: questionForm.content, answer: questionForm.answer === "true" }; // Flashcard style
    } else if (currentGameType === "dragdrop") {
      meta = { 
        items: questionForm.content.split('\n'), // Multiple items to match
        answers: questionForm.answer.split(',').map(a => a.trim()) // benar,salah,benar
      };
    }

    if (editingQuestion) {
      await apiPut(`/admin/minigame/question/${editingQuestion.id}`, {
        content: questionForm.content,
        type: currentGameType,
        meta,
      });
      setEditingQuestion(null);
    } else {
      await apiPost(`/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`, {
        content: questionForm.content,
        type: currentGameType,
        meta,
      });
    }

    setQuestionForm({
      content: "",
      options: ["", "", "", "", ""],
      answerIndex: 0,
      answer: "",
      statement: "",
    });
    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  };

  const editQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({ ...questionForm, content: question.content });
  };

  const deleteQuestion = async (questionId) => {
    if (confirm("Yakin hapus soal ini?")) {
      await apiDelete(`/admin/minigame/question/${questionId}`);
      loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
    }
  };

  return (
    <Container>
      <SectionTitle>🎮 Admin Mini Game</SectionTitle>

      {/* MATERI */}
      <Card>
        <SectionTitle>📚 Pilih Materi</SectionTitle>
        {materi.map((m) => (
          <MateriButton
            key={m.id}
            onClick={() => {
              setSelectedMateri(m);
              setSelectedLevel(null);
              setEditingLevel(null);
              loadLevels(m.slug);
            }}
          >
            📖 {m.title}
          </MateriButton>
        ))}
      </Card>

      {/* LEVEL */}
      {selectedMateri && (
        <Card>
          <SectionTitle>🎯 Kelola Level - {selectedMateri.title}</SectionTitle>
          
          {/* Form Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <Input
              placeholder="Judul Level"
              value={levelForm.title}
              onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
            />
            <Input
              placeholder="Nomor Level (1, 2, 3...)"
              value={levelForm.levelNumber}
              onChange={(e) => setLevelForm({ ...levelForm, levelNumber: e.target.value })}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <Input placeholder="Total Soal" value={levelForm.totalQuestions} onChange={(e) => setLevelForm({ ...levelForm, totalQuestions: e.target.value })} />
            <Input placeholder="Reward XP" value={levelForm.reward_xp} onChange={(e) => setLevelForm({ ...levelForm, reward_xp: e.target.value })} />
          </div>

          <Select
            value={levelForm.gameType}
            onChange={(e) => setLevelForm({ ...levelForm, gameType: e.target.value })}
          >
            <option value="mcq">📝 Multiple Choice</option>
            <option value="typing">💻 Code Completion</option>
            <option value="truefalse">📄 Flashcard T/F</option>
            <option value="dragdrop">🔗 Matching</option>
          </Select>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button primary onClick={submitLevel}>
              {editingLevel ? '✏️ Update' : '➕ Tambah'} Level
            </Button>
            {editingLevel && (
              <Button danger onClick={() => {
                setEditingLevel(null);
                setLevelForm({ title: "", levelNumber: "", totalQuestions: "", reward_xp: "", gameType: "mcq" });
              }}>
                ❌ Cancel
              </Button>
            )}
          </div>

          {/* List Levels */}
          <div style={{ marginTop: '24px' }}>
            {levels.map((l) => (
              <LevelItem key={l.id}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {l.title} 
                    <GameTypeBadge type={l.gameType}>{l.gameType.toUpperCase()}</GameTypeBadge>
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '14px' }}>
                    Level {l.levelNumber} | XP: {l.reward_xp} | Soal: {l.totalQuestions}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button success onClick={() => {
                    setSelectedLevel(l);
                    loadQuestions(selectedMateri.slug, l.levelNumber);
                  }}>
                    📝 Soal
                  </Button>
                  <Button primary onClick={() => editLevel(l)}>✏️ Edit</Button>
                  <Button danger onClick={() => deleteLevel(l.id)}>🗑️ Hapus</Button>
                </div>
              </LevelItem>
            ))}
          </div>
        </Card>
      )}

      {/* QUESTIONS */}
      {selectedLevel && (
        <Card>
          <SectionTitle>❓ Kelola Soal - {selectedLevel.title} ({selectedLevel.gameType.toUpperCase()})</SectionTitle>

          {/* Form Question */}
          <Textarea
            placeholder={
              currentGameType === "mcq" ? "Pertanyaan MCQ..." :
              currentGameType === "typing" ? "Kode awal (user melengkapi)...\ncontoh:\nfunction tambah(a, b) {\n  return ..." :
              currentGameType === "truefalse" ? "Pernyataan flashcard..." :
              "Item1\nItem2\nItem3 (pisah baris, drag ke jawaban)"
            }
            value={questionForm.content}
            onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
          />

          {/* MCQ Options */}
          {currentGameType === "mcq" && (
            <>
              {[0,1,2,3,4].map((i) => (
                <Input
                  key={i}
                  placeholder={`Opsi ${i + 1}`}
                  value={questionForm.options[i] || ""}
                  onChange={(e) => {
                    const opts = [...questionForm.options];
                    opts[i] = e.target.value;
                    setQuestionForm({ ...questionForm, options: opts });
                  }}
                />
              ))}
              <Input
                placeholder="Index Jawaban (0-4)"
                value={questionForm.answerIndex}
                onChange={(e) => setQuestionForm({ ...questionForm, answerIndex: e.target.value })}
              />
            </>
          )}

          {/* Typing Answer */}
          {currentGameType === "typing" && (
            <Input
              placeholder="Jawaban lengkap yang benar"
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            />
          )}

          {/* TrueFalse Answer */}
          {currentGameType === "truefalse" && (
            <Select
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            >
              <option value="true">✅ BENAR</option>
              <option value="false">❌ SALAH</option>
            </Select>
          )}

          {/* DragDrop Answers */}
          {currentGameType === "dragdrop" && (
            <Input
              placeholder="Urutan jawaban (benar,salah,benar)"
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            />
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button primary onClick={submitQuestion}>
              {editingQuestion ? '✏️ Update' : '➕ Tambah'} Soal
            </Button>
            {editingQuestion && (
              <Button danger onClick={() => {
                setEditingQuestion(null);
                setQuestionForm({ content: "", options: ["", "", "", "", ""], answerIndex: 0, answer: "", statement: "" });
              }}>
                ❌ Cancel
              </Button>
            )}
          </div>

          {/* List Questions */}
          <div style={{ marginTop: '24px' }}>
            {questions.map((q) => {
              const meta = JSON.parse(q.meta || "{}");
              return (
                <QuestionItem key={q.id}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                    {q.content.substring(0, 100)}{q.content.length > 100 ? '...' : ''}
                  </div>
                  
                  {/* Preview Jawaban */}
                  {q.type === "mcq" && (
                    <div style={{ color: '#28a745', fontSize: '14px' }}>
                      ✅ Jawaban: <strong>{meta.options?.[meta.answerIndex]}</strong>
                    </div>
                  )}
                  
                  {q.type === "typing" && (
                    <div style={{ color: '#28a745', fontSize: '14px' }}>
                      ✅ Jawaban: <code>{meta.answer}</code>
                    </div>
                  )}
                  
                  {q.type === "truefalse" && (
                    <div style={{ color: meta.answer ? '#28a745' : '#dc3545', fontSize: '14px' }}>
                      ✅ {meta.answer ? 'BENAR' : 'SALAH'}
                    </div>
                  )}
                  
                  {q.type === "dragdrop" && (
                    <div style={{ color: '#17a2b8', fontSize: '14px' }}>
                      🎯 Matching: {meta.answers?.join(' | ')}
                    </div>
                  )}
                  
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <Button primary size="small" onClick={() => editQuestion(q)}>✏️</Button>
                    <Button danger size="small" onClick={() => deleteQuestion(q.id)}>🗑️</Button>
                  </div>
                </QuestionItem>
              );
            })}
          </div>
        </Card>
      )}
    </Container>
  );
}
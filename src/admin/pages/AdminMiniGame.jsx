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
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px 4px 0 0;
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
  
  ${props => props.small && `
    padding: 6px 12px;
    font-size: 12px;
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
  box-sizing: border-box;
  
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
  min-height: 120px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
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
  padding: 20px;
  margin: 12px 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const MateriButton = styled(Button)`
  display: block;
  width: 100%;
  text-align: left;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  color: #495057;
  border: 2px solid #dee2e6;
  padding: 16px;
  font-size: 16px;
  margin-bottom: 8px;
  
  &:hover {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border-color: #667eea;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  font-size: 14px;
`;

// ================= COMPONENT =================
export default function AdminMiniGame() {
  const [materi, setMateri] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const [levelForm, setLevelForm] = useState({
    title: "",
    levelNumber: "",
    totalQuestions: "",
    reward_xp: "",
    gameType: "mcq",
    reward_badge_id: "",
  });

  const [questionForm, setQuestionForm] = useState({
    content: "",
    type: "mcq",
    options: ["", "", "", "", ""],
    answerIndex: 0,
    answer: "",
  });

  // Load materi dan badges
  useEffect(() => {
    loadMateri();
    loadBadges();
  }, []);

  const loadMateri = async () => {
    try {
      const res = await apiGet("/admin/minigame/materi");
      setMateri(res.data);
    } catch (error) {
      console.error("Error loading materi:", error);
    }
  };

  const loadBadges = async () => {
    try {
      const res = await apiGet("/admin/minigame/badges");
      setBadges(res.data);
    } catch (error) {
      console.error("Error loading badges:", error);
    }
  };

  const loadLevels = async (slug) => {
    try {
      const res = await apiGet(`/admin/minigame/${slug}/levels`);
      setLevels(res.data);
    } catch (error) {
      console.error("Error loading levels:", error);
    }
  };

 // 🔥 FIXED STRUCTURE - GANTI INI SAJA!
const loadQuestions = async (slug, levelNumber) => {
  try {
    setLoading(true);
    const res = await apiGet(`/admin/minigame/${slug}/levels/${levelNumber}`);
    
    console.log("🔍 res.data:", res.data);
    
    // ✅ FIXED: Langsung dari res.data (bukan res.data.data)
    const questions = res.data.questions || res.data.data?.questions || [];
    const levelData = res.data.level || res.data.data?.level || null;
    
    console.log("✅ questions:", questions.length);
    console.log("✅ level:", levelData);
    
    setQuestions(questions);
    setSelectedLevel(levelData);
  } catch (error) {
    console.error("❌ Error loading questions:", error);
  } finally {
    setLoading(false);
  }
};

  const currentGameType = selectedLevel?.gameType || "mcq";

  // Reset forms
  const resetLevelForm = () => {
    setLevelForm({
      title: "",
      levelNumber: "",
      totalQuestions: "",
      reward_xp: "",
      gameType: "mcq",
      reward_badge_id: "",
    });
    setEditingLevel(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      content: "",
      type: "mcq",
      options: ["", "", "", "", ""],
      answerIndex: 0,
      answer: "",
    });
    setEditingQuestion(null);
  };

  // Level CRUD
  const submitLevel = async () => {
    try {
      setLoading(true);
      if (editingLevel) {
        await apiPut(`/admin/minigame/level/${editingLevel.id}`, levelForm);
      } else {
        await apiPost(`/admin/minigame/${selectedMateri.slug}/levels`, levelForm);
      }
      resetLevelForm();
      loadLevels(selectedMateri.slug);
    } catch (error) {
      console.error("Error submitting level:", error);
      alert("Gagal menyimpan level!");
    } finally {
      setLoading(false);
    }
  };

  const editLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      title: level.title || "",
      levelNumber: level.levelNumber || "",
      totalQuestions: level.totalQuestions || "",
      reward_xp: level.reward_xp || "",
      gameType: level.gameType || "mcq",
      reward_badge_id: level.reward_badge_id || "",
    });
  };

  const deleteLevel = async (levelId) => {
    if (confirm("Yakin hapus level ini? Data soal juga akan hilang!")) {
      try {
        await apiDelete(`/admin/minigame/level/${levelId}`);
        loadLevels(selectedMateri.slug);
      } catch (error) {
        console.error("Error deleting level:", error);
        alert("Gagal menghapus level!");
      }
    }
  };

  // 🔥 FIXED: Question CRUD - True/False jangan di-convert ke boolean
  const submitQuestion = async () => {
  try {
    setLoading(true);
    let meta = {};

    // Generate meta berdasarkan game type
    if (currentGameType === "mcq") {
      meta = { 
        options: questionForm.options.filter(o => o.trim()), 
        answerIndex: Number(questionForm.answerIndex) 
      };
    } else if (currentGameType === "typing") {
      meta = { answer: questionForm.answer };
    } else if (currentGameType === "truefalse") {
      // 🔥 FIXED: Pastikan answer TIDAK KOSONG dan STRING
      const answerValue = questionForm.answer === "true" ? "true" : "false"; // Default false jika kosong
      meta = { 
        answer: answerValue, // Pastikan string "true"/"false"
        statement: questionForm.content // Backup statement
      };
    } else if (currentGameType === "dragdrop") {
      meta = { 
        answers: questionForm.answer.split(',').map(a => a.trim()).filter(a => a)
      };
    }

    console.log("🔥 SENDING META:", meta); // Debug

    const payload = {
      content: questionForm.content,
      type: currentGameType,
      meta,
    };

    if (editingQuestion) {
      await apiPut(`/admin/minigame/question/${editingQuestion.id}`, payload);
    } else {
      await apiPost(`/admin/minigame/${selectedMateri.slug}/levels/${selectedLevel.levelNumber}/question`, payload);
    }

    resetQuestionForm();
    loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
  } catch (error) {
    console.error("Error submitting question:", error);
    alert("Gagal menyimpan soal!");
  } finally {
    setLoading(false);
  }
};

  // 🔥 FIXED: editQuestion - handle string "true"/"false"
  const editQuestion = (question) => {
    setEditingQuestion(question);
    const meta = JSON.parse(question.meta || "{}");
    
    setQuestionForm({
      content: question.content || "",
      type: question.type || "mcq",
      options: meta.options || ["", "", "", "", ""],
      answerIndex: meta.answerIndex || 0,
      answer: meta.answer || "", // ✅ String "true"/"false"
    });
  };

  const deleteQuestion = async (questionId) => {
    if (confirm("Yakin hapus soal ini?")) {
      try {
        await apiDelete(`/admin/minigame/question/${questionId}`);
        loadQuestions(selectedMateri.slug, selectedLevel.levelNumber);
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Gagal menghapus soal!");
      }
    }
  };

  const renderQuestionForm = () => {
    return (
      <>
        <FormGroup>
          <Label>📝 Pertanyaan / Konten</Label>
          <Textarea
            placeholder={
              currentGameType === "mcq" ? "Pertanyaan pilihan ganda..." :
              currentGameType === "typing" ? "Kode awal yang harus dilengkapi...\nfunction tambah(a, b) {\n  // lengkapi" :
              currentGameType === "truefalse" ? "Pernyataan True/False..." :
              "Item1\nItem2\nItem3 (pisahkan dengan enter untuk dragdrop)"
            }
            value={questionForm.content}
            onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
          />
        </FormGroup>

        {currentGameType === "mcq" && (
          <>
            {questionForm.options.map((option, index) => (
              <FormGroup key={index}>
                <Label>Opsi {index + 1} {(index === Number(questionForm.answerIndex)) && "(✅ Jawaban)"}</Label>
                <Input
                  value={option}
                  onChange={(e) => {
                    const options = [...questionForm.options];
                    options[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options });
                  }}
                  placeholder={`Opsi ${index + 1}`}
                />
              </FormGroup>
            ))}
            <FormGroup>
              <Label>Index Jawaban (0-4)</Label>
              <Input
                type="number"
                min="0"
                max="4"
                value={questionForm.answerIndex}
                onChange={(e) => setQuestionForm({ ...questionForm, answerIndex: e.target.value })}
              />
            </FormGroup>
          </>
        )}

        {currentGameType === "typing" && (
          <FormGroup>
            <Label>💻 Jawaban Lengkap</Label>
            <Textarea
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
              placeholder="Jawaban lengkap yang benar..."
            />
          </FormGroup>
        )}

        {currentGameType === "truefalse" && (
          <FormGroup>
            <Label>Jawaban</Label>
            <Select
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            >
              <option value="true">✅ BENAR</option>
              <option value="false">❌ SALAH</option>
            </Select>
          </FormGroup>
        )}

        {currentGameType === "dragdrop" && (
          <FormGroup>
            <Label>🎯 Urutan Jawaban (pisah koma)</Label>
            <Input
              placeholder="benar,salah,benar,salah"
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            />
          </FormGroup>
        )}
      </>
    );
  };

  const renderQuestionPreview = (question) => {
    const meta = JSON.parse(question.meta || "{}");
    
    return (
      <div>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: '#2c3e50',
          whiteSpace: 'pre-wrap',
          fontSize: '15px'
        }}>
          {question.content}
        </div>
        
        {/* Preview Jawaban */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '12px', 
          borderRadius: '8px',
          fontSize: '14px',
          borderLeft: '4px solid #28a745'
        }}>
          {question.type === "mcq" && (
            <div>
              ✅ Jawaban: <strong style={{color: '#28a745'}}>{meta.options?.[meta.answerIndex]}</strong>
            </div>
          )}
          
          {question.type === "typing" && (
            <div>
              ✅ Jawaban: <code style={{background: '#e9ecef', padding: '2px 6px', borderRadius: '4px'}}>
                {meta.answer}
              </code>
            </div>
          )}
          
          {question.type === "truefalse" && (
            <div style={{color: meta.answer === "true" ? '#28a745' : '#dc3545'}}>
              ✅ {meta.answer === "true" ? 'BENAR' : 'SALAH'}
            </div>
          )}
          
          {question.type === "dragdrop" && (
            <div style={{color: '#17a2b8'}}>
              🎯 Jawaban: {meta.answers?.join(' | ')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container>
      <SectionTitle>🎮 Admin Mini Game</SectionTitle>

      {/* MATERI */}
      <Card>
        <SectionTitle>📚 Pilih Materi</SectionTitle>
        {materi.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '40px' }}>
            📭 Belum ada materi. Buat materi terlebih dahulu!
          </p>
        ) : (
          materi.map((m) => (
            <MateriButton
              key={m.id}
              onClick={() => {
                setSelectedMateri(m);
                setSelectedLevel(null);
                setQuestions([]);
                setEditingLevel(null);
                loadLevels(m.slug);
              }}
            >
              📖 {m.title}
            </MateriButton>
          ))
        )}
      </Card>

      {/* LEVEL */}
      {selectedMateri && (
        <Card>
          <SectionTitle>🎯 Kelola Level - {selectedMateri.title}</SectionTitle>
          
          {/* Form Level */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <FormGroup>
              <Label>📝 Judul Level</Label>
              <Input
                value={levelForm.title}
                onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                placeholder="Contoh: Dasar JavaScript"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>🔢 Nomor Level</Label>
              <Input
                type="number"
                value={levelForm.levelNumber}
                onChange={(e) => setLevelForm({ ...levelForm, levelNumber: e.target.value })}
                placeholder="1"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>📊 Total Soal</Label>
              <Input
                type="number"
                value={levelForm.totalQuestions}
                onChange={(e) => setLevelForm({ ...levelForm, totalQuestions: e.target.value })}
                placeholder="10"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>⭐ Reward XP</Label>
              <Input
                type="number"
                value={levelForm.reward_xp}
                onChange={(e) => setLevelForm({ ...levelForm, reward_xp: e.target.value })}
                placeholder="100"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>🎮 Tipe Game</Label>
            <Select
              value={levelForm.gameType}
              onChange={(e) => setLevelForm({ ...levelForm, gameType: e.target.value })}
            >
              <option value="mcq">📝 Multiple Choice</option>
              <option value="typing">💻 Code Completion</option>
              <option value="truefalse">📄 Flashcard T/F</option>
              <option value="dragdrop">🔗 Drag & Drop Matching</option>
            </Select>
          </FormGroup>

          {badges.length > 0 && (
            <FormGroup>
              <Label>🏆 Badge Reward (Opsional)</Label>
              <Select
                value={levelForm.reward_badge_id || ""}
                onChange={(e) => setLevelForm({ ...levelForm, reward_badge_id: e.target.value })}
              >
                <option value="">Tidak ada badge</option>
                {badges.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.badge_name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button 
              primary 
              onClick={submitLevel}
              disabled={loading || !levelForm.title || !levelForm.levelNumber}
            >
              {loading ? '⏳ Menyimpan...' : (editingLevel ? '✏️ Update' : '➕ Tambah')} Level
            </Button>
            {editingLevel && (
              <Button 
                danger 
                onClick={resetLevelForm}
                disabled={loading}
              >
                ❌ Cancel
              </Button>
            )}
          </div>

          {/* List Levels */}
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ marginBottom: '16px', color: '#495057' }}>📋 Daftar Level ({levels.length})</h4>
            {levels.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '40px' }}>
                Belum ada level. Tambahkan level pertama!
              </p>
            ) : (
              levels.map((l) => (
                <LevelItem key={l.id}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {l.title} 
                      <GameTypeBadge type={l.gameType}>{l.gameType.toUpperCase()}</GameTypeBadge>
                      {l.Badge && (
                        <span style={{ 
                          background: '#ffd700', 
                          color: '#000', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          marginLeft: '8px'
                        }}>
                          🏆 {l.Badge.badge_name}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Level {l.levelNumber} | XP: {l.reward_xp} | Soal: {l.totalQuestions}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      success 
                      onClick={() => {
                        setSelectedLevel(l);
                        loadQuestions(selectedMateri.slug, l.levelNumber);
                      }}
                    >
                      📝 {l.totalQuestions || 0} Soal
                    </Button>
                    <Button primary onClick={() => editLevel(l)}>✏️ Edit</Button>
                    <Button danger onClick={() => deleteLevel(l.id)}>🗑️ Hapus</Button>
                  </div>
                </LevelItem>
              ))
            )}
          </div>
        </Card>
      )}

      {/* QUESTIONS */}
      {selectedLevel && (
        <Card>
          <SectionTitle>
            ❓ Kelola Soal - {selectedLevel.title} 
            <GameTypeBadge type={currentGameType}>{currentGameType.toUpperCase()}</GameTypeBadge>
          </SectionTitle>

          {/* Form Tambah/Edit Soal */}
          <div style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '24px', marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>
              {editingQuestion ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}
            </h4>
            
            {renderQuestionForm()}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                primary 
                onClick={submitQuestion}
                disabled={loading || !questionForm.content.trim()}
              >
                {loading ? '⏳ Menyimpan...' : (editingQuestion ? '✏️ Update' : '➕ Tambah')} Soal
              </Button>
              {editingQuestion && (
                <Button 
                  danger 
                  onClick={resetQuestionForm}
                  disabled={loading}
                >
                  ❌ Cancel
                </Button>
              )}
            </div>
          </div>

          {/* List Questions */}
          <div>
            <h4 style={{ marginBottom: '16px', color: '#495057' }}>
              📋 Daftar Soal ({questions.length})
              {loading && <span style={{ marginLeft: '12px', color: '#6c757d' }}>⏳ Loading...</span>}
            </h4>
            
            {questions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                📭 Belum ada soal. Tambahkan soal pertama!
              </div>
            ) : (
              questions.map((q) => (
                <QuestionItem key={q.id}>
                  {renderQuestionPreview(q)}
                  
                  <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    display: 'flex', 
                    gap: '8px' 
                  }}>
                    <Button 
                      primary 
                      small 
                      onClick={() => editQuestion(q)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button 
                      danger 
                      small 
                      onClick={() => deleteQuestion(q.id)}
                    >
                      🗑️ Hapus
                    </Button>
                  </div>
                </QuestionItem>
              ))
            )}
          </div>
        </Card>
      )}
    </Container>
  );
}
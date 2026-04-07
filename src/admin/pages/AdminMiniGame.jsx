// pages/admin/GameEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';

const EditorContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid #e5e7eb;
`;

const LevelList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const LevelCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  border-left: 5px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }
`;

const QuestionForm = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  margin-bottom: 25px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  cursor: pointer;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  margin-bottom: 10px;

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(59,130,246,0.4);
    }
  `}

  ${props => props.variant === 'danger' && `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(239,68,68,0.4);
    }
  `}

  ${props => props.variant === 'success' && `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(16,185,129,0.4);
    }
  `}
`;

const QuestionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const QuestionCard = styled.div`
  background: #f9fafb;
  padding: 20px;
  border-radius: 15px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'};
`;

export default function GameEditor() {
  const { materiId } = useParams();
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    type: 'mcq',
    content: '',
    meta: {},
    points: 10,
    order: 0
  });

  useEffect(() => {
    loadLevels();
  }, [materiId]);

  const loadLevels = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/game-levels`);
      setLevels(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestions = async (levelId) => {
    try {
      const res = await apiGet(`/admin/game/level/${levelId}/questions`);
      setQuestions(res.questions || []);
      const levelRes = await apiGet(`/admin/game/level/${levelId}`);
      setCurrentLevel(levelRes.level);
      setSelectedQuestion(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevelSelect = (level) => {
    loadQuestions(level.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMetaChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value
      }
    }));
  };

  const handleAddQuestion = async () => {
    try {
      await apiPost(`/admin/game/${currentLevel.id}/question`, formData);
      loadQuestions(currentLevel.id);
      setFormData({ type: 'mcq', content: '', meta: {}, points: 10, order: 0 });
    } catch (err) {
      alert('Gagal menambah soal');
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      await apiPut(`/admin/game/question/${selectedQuestion.id}`, formData);
      loadQuestions(currentLevel.id);
      setSelectedQuestion(null);
      setFormData({ type: 'mcq', content: '', meta: {}, points: 10, order: 0 });
    } catch (err) {
      alert('Gagal update soal');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      await apiDelete(`/admin/game/question/${questionId}`);
      loadQuestions(currentLevel.id);
    } catch (err) {
      alert('Gagal hapus soal');
    }
  };

  const gameTypeFields = {
    mcq: [
      { key: 'options', label: 'Opsi (pisahkan dengan koma)', type: 'text' },
      { key: 'answerIndex', label: 'Indeks Jawaban (0,1,2...)', type: 'number' }
    ],
    truefalse: [
      { key: 'isTrue', label: 'Benar?', type: 'boolean' }
    ],
    flashcard: [
      { key: 'cards', label: 'Kartu (JSON array)', type: 'text' }
    ],
    typing: [
      { key: 'answer', label: 'Jawaban Benar', type: 'text' }
    ],
    sort: [
      { key: 'items', label: 'Items (JSON array)', type: 'text' },
      { key: 'correctOrder', label: 'Urutan Benar (JSON array)', type: 'text' }
    ],
    memory: [
      { key: 'cardPair', label: 'Pasangan Kartu', type: 'text' },
      { key: 'options', label: 'Opsi (JSON array)', type: 'text' }
    ]
  };

  useEffect(() => {
    if (selectedQuestion) {
      setFormData({
        type: selectedQuestion.type,
        content: selectedQuestion.content,
        meta: selectedQuestion.meta || {},
        points: selectedQuestion.points,
        order: selectedQuestion.order
      });
    }
  }, [selectedQuestion]);

  return (
    <EditorContainer>
      <Header>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#1f2937' }}>
          🎮 Editor Mini Game
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Kelola level dan soal game</p>
      </Header>

      <LevelList>
        {levels.map(level => (
          <LevelCard 
            key={level.id}
            active={currentLevel?.id === level.id}
            onClick={() => handleLevelSelect(level)}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
              Level {level.levelNumber}
            </h3>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px' }}>
              {level.title}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: currentLevel?.id === level.id ? '#3b82f6' : '#6b7280',
              fontWeight: '600'
            }}>
              {level.type.toUpperCase()} • {level.totalQuestions || 0} soal
            </div>
          </LevelCard>
        ))}
      </LevelList>

      {currentLevel && (
        <>
          <QuestionForm>
            <h3 style={{ marginBottom: '25px', color: '#1f2937' }}>
              {selectedQuestion ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>Tipe Soal</Label>
                <Select 
                  name="type" 
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="truefalse">Benar/Salah</option>
                  <option value="dragdrop">Drag & Drop</option>
                  <option value="flashcard">Flashcard</option>
                  <option value="typing">Typing</option>
                  <option value="sort">Sorting</option>
                  <option value="memory">Memory Match</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Poin</Label>
                <Input 
                  type="number" 
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Isi Soal</Label>
              <TextArea 
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Tulis pertanyaan atau instruksi soal..."
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {gameTypeFields[formData.type]?.map(field => (
                <FormGroup key={field.key}>
                  <Label>{field.label}</Label>
                  {field.type === 'boolean' ? (
                    <Select
                      value={formData.meta[field.key] || 'true'}
                      onChange={(e) => handleMetaChange(field.key, e.target.value === 'true')}
                    >
                      <option value="true">Benar</option>
                      <option value="false">Salah</option>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData.meta[field.key] || ''}
                      onChange={(e) => handleMetaChange(field.key, 
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )}
                      placeholder={field.placeholder || `Masukkan ${field.key}...`}
                    />
                  )}
                </FormGroup>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              {selectedQuestion ? (
                <>
                  <Button variant="primary" onClick={handleEditQuestion}>
                    💾 Update Soal
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      setSelectedQuestion(null);
                      setFormData({ type: 'mcq', content: '', meta: {}, points: 10, order: 0 });
                    }}
                  >
                    ❌ Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="success" onClick={handleAddQuestion}>
                    ➕ Tambah Soal
                  </Button>
                  <Button variant="primary" onClick={() => {}}>
                    📋 Preview
                  </Button>
                </>
              )}
            </div>
          </QuestionForm>

          <QuestionsList>
            <h3 style={{ gridColumn: '1 / -1', marginBottom: '20px', color: '#1f2937' }}>
              📋 Daftar Soal ({questions.length})
            </h3>
            
            {questions.map(question => (
              <QuestionCard 
                key={question.id}
                selected={selectedQuestion?.id === question.id}
                onClick={() => setSelectedQuestion(question)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1f2937', marginBottom: '5px' }}>
                      {question.type.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {question.points} poin • Urutan #{question.order + 1}
                    </div>
                  </div>
                  <Button 
                    variant="danger" 
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(question.id);
                    }}
                  >
                    🗑️
                  </Button>
                </div>
                
                <div style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.5', 
                  color: '#374151',
                  marginBottom: '15px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '10px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  {question.content.substring(0, 100)}{question.content.length > 100 ? '...' : ''}
                </div>
                
                <details style={{ fontSize: '0.85rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#6b7280', marginBottom: '8px' }}>
                    Meta Data
                  </summary>
                  <pre style={{ 
                    background: '#f3f4f6', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem',
                    maxHeight: '100px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(question.meta, null, 2)}
                  </pre>
                </details>
              </QuestionCard>
            ))}
          </QuestionsList>
        </>
      )}
    </EditorContainer>
  );
}
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import api from "../api/axiosClient";
import Layout from "../components/Layout";
import MiniLessonModal from "../components/MiniLessonModal";
import ClueProgress from "../components/ClueProgress";

export default function DiscussionRoom() {
  const { materiId, roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= STATE ================= */
  const [miniContent, setMiniContent] = useState("");
  const [showMini, setShowMini] = useState(false);
  const [pseudocode, setPseudocode] = useState("");
  const [clues, setClues] = useState([]);
  const [usedClues, setUsedClues] = useState([]);
  const [userXp, setUserXp] = useState(0);
  const clueMax = 3;

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [conditions, setConditions] = useState([]);
  const [elseInstruction, setElseInstruction] = "";

  const [performanceScore, setPerformanceScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // VALIDASI STATE
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // ================= LOAD SUBMISSION STATUS =================
  const loadSubmissionStatus = async () => {
    try {
      const res = await api.get(`/discussion/submission/status/${roomId}`);
      setIsSubmitted(res.data.submitted); 
    } catch (err) {
      console.error("Error loading submission status:", err);
    }
  };

  // ================= LOAD PERFORMANCE =================
  const loadPerformance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/discussion/room/${roomId}/performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformanceScore(res.data.score);
    } catch (err) {
      console.error("Error load performance:", err);
    }
  };

  // ================= LOAD WORKSPACE (LOAD SEKALI SAJA SAAT AWAL) =================
  const loadWorkspace = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/workspace/${roomId}`);
      const data = res?.data?.data || {};

      // ✅ LOAD SEKALI SAJA - tidak overwrite saat user ngetik
      setPseudocode(data.pseudocode || "");
      
      let loadedFlowchart = { conditions: [], elseInstruction: "" };
      if (data.flowchart) {
        try {
          loadedFlowchart = typeof data.flowchart === "string"
            ? JSON.parse(data.flowchart)
            : data.flowchart;
        } catch (e) {
          console.error("Error parsing flowchart:", e);
        }
      }
      setConditions(Array.isArray(loadedFlowchart.conditions) ? loadedFlowchart.conditions : []);
      setElseInstruction(loadedFlowchart.elseInstruction || "");
    } catch (err) {
      console.error("Error loading workspace:", err);
    }
  }, [roomId]);

  // ✅ LOAD SEKALI SAJA - HAPUS POLLING
  useEffect(() => {
    if (!roomId) return;
    loadWorkspace(); // Load sekali saat mount
  }, [roomId, loadWorkspace]);

// ================= LOAD USER XP =================
useEffect(() => {
  if (!materiId || !user?.id) return;
  
  api.get(`/materi/${materiId}`)
    .then(res => {
      const progress = res.data.data.progress;
      // ✅ FIXED: undefined bukan kosong
      if (progress && progress.xp !== undefined) {
        setUserXp(progress.xp);
      } else {
        // Fallback ke endpoint lain
        return api.get(`/discussion/user-xp/${materiId}`)
          .then(res => setUserXp(res.data.xp || 0))
          .catch(() => setUserXp(0));
      }
    })
    .catch(err => {
      console.error("Error load materi progress:", err);
      // Fallback
      api.get(`/discussion/user-xp/${materiId}`)
        .then(res => setUserXp(res.data.xp || 0))
        .catch(() => setUserXp(0));
    });
}, [materiId, user?.id]);

  // ================= MINI LESSON =================
  useEffect(() => {
    if (!materiId) return;
    api.get(`/discussion/mini/${materiId}`)
      .then(res => setMiniContent(res.data?.data?.content || "Mini lesson tidak tersedia"))
      .catch(() => setMiniContent("Mini lesson tidak tersedia"));
  }, [materiId]);

  // ================= LOAD CLUES & USED CLUES =================
  useEffect(() => {
    if (!materiId) return;
    api.get(`/discussion/clue/${materiId}`)
      .then(res => res.data.status && setClues(res.data.data || []))
      .catch(err => console.error("ERROR load clues:", err));
  }, [materiId]);

  const loadUsedClues = async () => {
    const res = await api.get(`/discussion/clue/used/${roomId}`);
    setUsedClues(res.data.data || []);
  };

  useEffect(() => {
    if (!roomId) return;
    loadUsedClues();
  }, [roomId]);

  // ================= REQUEST CLUE =================
  const requestClue = async () => {
    if (usedClues.length >= clueMax) return;

    const nextClue = clues[usedClues.length];
    if (!nextClue) return;

    const isXpEnough = userXp >= nextClue.cost;
    const result = await Swal.fire({
      title: "Ambil Clue?",
      html: `
        <p>XP <b>SEMUA anggota</b> akan berkurang <b>${nextClue.cost}</b></p>
        ${!isXpEnough ? '<p style="color: red;">⚠️ XP mungkin tidak cukup!</p>' : ''}
      `,
      icon: isXpEnough ? "warning" : "error",
      showCancelButton: true,
      confirmButtonText: "Ya, Ambil",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/discussion/room/${roomId}/clue/${nextClue.id}/use`);
      loadUsedClues();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal membuka clue", "error");
    }
  };

  // ================= FLOWCHART FUNCTIONS (MANUAL SAVE ONLY) =================
  const addCondition = () => {
    if (isSubmitted) return;
    const next = conditions.length + 1;
    const newConditions = [
      ...conditions,
      { condition: `Kondisi ${next}`, yes: `Instruksi ${next}` }
    ];
    setConditions(newConditions);
  };

  const updateCondition = (index, field, value) => {
    if (isSubmitted) return;
    const updated = [...conditions];
    updated[index][field] = value;
    setConditions(updated);
  };

  const updateElseInstruction = (value) => {
    if (isSubmitted) return;
    setElseInstruction(value);
  };

  // ================= TASKS =================
  useEffect(() => {
    if (!roomId) return;
    const loadTasks = async () => {
      try {
        const res = await api.get(`/discussion/task/${roomId}`);
        const taskMap = res.data.data;
        const defaultTasks = [
          { id: 1, text: "Identifikasi masalah dari video", done: false },
          { id: 2, text: "Tentukan data yang diperlukan", done: false },
          { id: 3, text: "Susun pseudocode", done: false },
          { id: 4, text: "Buat flowchart", done: false },
          { id: 5, text: "Implementasi program C", done: false },
        ];
        const updatedTasks = defaultTasks.map(task => ({
          ...task,
          done: taskMap[task.id] || false,
        }));
        setTasks(updatedTasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setTasks([
          { id: 1, text: "Identifikasi masalah dari video", done: false },
          { id: 2, text: "Tentukan data yang diperlukan", done: false },
          { id: 3, text: "Susun pseudocode", done: false },
          { id: 4, text: "Buat flowchart", done: false },
          { id: 5, text: "Implementasi program C", done: false },
        ]);
      } finally {
        setTasksLoading(false);
      }
    };
    loadTasks();
  }, [roomId]);

  const toggleTask = async (taskId, currentDone) => {
    try {
      await api.put(`/discussion/task/${roomId}/${taskId}`, { done: !currentDone });
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, done: !currentDone } : task
      ));
    } catch {
      Swal.fire("Error", "Gagal update task", "error");
    }
  };

  // ================= MANUAL SAVE ONLY =================
  const forceSavePseudocode = async () => {
    if (isSubmitted) return;
    try {
      await api.post(`/discussion/workspace/pseudocode/${roomId}/save`, { pseudocode });
      Swal.fire("✅", "Pseudocode tersimpan!", "success");
    } catch (err) {
      Swal.fire("❌", "Gagal simpan pseudocode", "error");
    }
  };

  const forceSaveFlowchart = async () => {
    if (isSubmitted) return;
    try {
      await api.post(`/discussion/workspace/flowchart/${roomId}/save`, {
        flowchart: { conditions, elseInstruction }
      });
      Swal.fire("✅", "Flowchart tersimpan!", "success");
    } catch (err) {
      Swal.fire("❌", "Gagal simpan flowchart", "error");
    }
  };

  // ================= VALIDASI SEBELUM UPLOAD =================
  const validateBeforeUpload = async () => {
    const allDone = tasks.every(task => task.done);
    if (!allDone) {
      Swal.fire({
        icon: "warning",
        title: "📋 Task Belum Selesai!",
        text: "Centang semua task sebelum cek jawaban.",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await api.post(`/discussion/workspace/${roomId}/validate`);
      setValidationResult(response.data);
      
      if (response.data.valid) {
        const result = await Swal.fire({
          icon: "success",
          title: "🎉 SELAMAT! Jawaban BENAR!",
          html: `
            <div style="text-align: left;">
              <p><strong>✅ Pseudocode:</strong> Cocok 100%</p>
              <p><strong>✅ Flowchart:</strong> Struktur & konten cocok</p>
            </div>
          `,
          confirmButtonText: "🚀 Upload Jawaban",
          confirmButtonColor: "#10b981"
        });
        
        if (result.isConfirmed) {
          navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`);
        }
      } else {
        const details = response.data.details;
        let errorHtml = `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>${details.pseudocodeMatch ? '✅' : '❌'} Pseudocode:</strong> 
              ${details.pseudocodeMatch ? 'Cocok' : 'Belum sesuai'}
            </p>
            <p><strong>${details.flowchartMatch ? '✅' : '❌'} Flowchart:</strong> 
              ${details.flowchartMatch ? 'Cocok' : 'Struktur belum sesuai'}
            </p>
        `;

        if (!details.pseudocodeMatch) {
          errorHtml += `
            <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 6px; font-size: 12px;">
              <strong>Perbandingan:</strong><br>
              <strong>Jawaban Benar:</strong> ${details.pseudocode.official?.substring(0, 50)}...<br>
              <strong>Anda:</strong> ${details.pseudocode.student?.substring(0, 50)}...
            </div>
          `;
        }

        errorHtml += `
            <hr style="margin: 15px 0;">
            <p style="font-weight: 600; color: #059669;">💡 <strong>Tips:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
              <li>Periksa ejaan & urutan instruksi</li>
              <li>Pastikan jumlah kondisi sama</li>
              <li>Simpan ulang setelah perbaiki</li>
              <li>Klik "Cek Jawaban" lagi</li>
            </ul>
          </div>
        `;

        Swal.fire({
          icon: "error",
          title: "⚠️ Jawaban Belum Benar",
          html: errorHtml,
          confirmButtonText: "🔄 Perbaiki & Cek Lagi",
          confirmButtonColor: "#3b82f6"
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error saat validasi";
      Swal.fire({
        icon: "error",
        title: "❌ Validasi Gagal",
        text: message,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStars = (score) => {
    if (score >= 80) return "⭐⭐⭐⭐⭐";
    if (score >= 60) return "⭐⭐⭐⭐";
    if (score >= 40) return "⭐⭐⭐";
    if (score >= 20) return "⭐⭐";
    return "⭐";
  };

  // ================= RENDER FLOWCHART =================
  const renderFlowchart = () => {
    const height = 160 + conditions.length * 180 + (elseInstruction ? 120 : 0);

    return (
      <svg
        width="170%"
        height={height}
        viewBox={`160 0 640 ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#000" />
          </marker>
        </defs>

        {/* START */}
        <ellipse
          cx="300"
          cy="80"
          rx="70"
          ry="30"
          fill="#fff"
          stroke="#333"
          strokeWidth="2"
        />
        <text x="300" y="85" textAnchor="middle" fontSize="12" fontWeight="bold">
          Mulai
        </text>

        {conditions.map((item, index) => {
          const y = 180 + index * 180;

          return (
            <g key={index}>
              {/* Garis dari atas */}
              <line
                x1="300"
                y1={index === 0 ? 110 : y - 100}
                x2="300"
                y2={y - 40}
                stroke="#333"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />

              {/* Diamond */}
              <polygon
                points={`300,${y - 40} 380,${y} 300,${y + 40} 220,${y}`}
                fill="#fff"
                stroke="#333"
                strokeWidth="2"
              />

              {/* KONDISI INPUT */}
              <foreignObject x="240" y={y - 20} width="120" height="40">
                <input
                  value={item.condition}
                  onChange={(e) => updateCondition(index, "condition", e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontWeight: "bold",
                    fontSize: "11px",
                    color: "#333"
                  }}
                  disabled={isSubmitted}
                />
              </foreignObject>

              {/* YES */}
              <text x="395" y={y - 10} fontSize="12" fill="#333">Ya</text>

              {/* Garis ke kanan */}
              <line
                x1="380"
                y1={y}
                x2="580"
                y2={y}
                stroke="#333"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />

              {/* Process Box */}
              <rect
                x="580"
                y={y - 30}
                width="200"
                height="60"
                fill="#fff"
                stroke="#333"
                strokeWidth="2"
                rx="6"
              />

              {/* YES INPUT */}
              <foreignObject x="600" y={y - 20} width="160" height="40">
                <input
                  value={item.yes}
                  onChange={(e) => updateCondition(index, "yes", e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "11px"
                  }}
                  disabled={isSubmitted}
                />
              </foreignObject>

              {/* Garis turun dari process */}
              <line
                x1="680"
                y1={y + 30}
                x2="680"
                y2={height - 60}
                stroke="#333"
                strokeWidth="2"
              />

              {/* NO */}
              <text x="245" y={y + 60} fontSize="12" fill="#333">Tidak</text>

              {/* Garis ke bawah */}
              {index < conditions.length - 1 && (
                <line
                  x1="300"
                  y1={y + 40}
                  x2="300"
                  y2={y + 100}
                  stroke="#333"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              )}

              {/* ELSE */}
              {index === conditions.length - 1 && elseInstruction && (
                <>
                  <line
                    x1="300"
                    y1={y + 40}
                    x2="300"
                    y2={y + 100}
                    stroke="#333"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                  <rect x="200" y={y + 100} width="200" height="60" fill="#fff" stroke="#333" strokeWidth="2" rx="6"/>
                  <foreignObject x="220" y={y + 115} width="160" height="40">
                    <input
                      value={elseInstruction}
                      onChange={(e) => updateElseInstruction(e.target.value)}
                      style={{
                        width: "100%",
                        height: "100%",
                        textAlign: "center",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        fontSize: "11px"
                      }}
                      disabled={isSubmitted}
                    />
                  </foreignObject>
                </>
              )}
            </g>
          );
        })}

        {/* END */}
        <ellipse
          cx="680"
          cy={height - 30}
          rx="70"
          ry="30"
          fill="#fff"
          stroke="#333"
          strokeWidth="2"
        />
        <text x="680" y={height - 25} textAnchor="middle" fontSize="12" fontWeight="bold">
          Selesai
        </text>
      </svg>
    );
  };

  /* ================= UI RENDER ================= */
  return (
    <Layout>
      <Wrapper>
        <Header>
          <HeaderTop>
            <HeaderLeft>
              <Title>Materi {materiId}</Title>
              <Breadcrumb>
                Orientasi Masalah &gt; Ruang Diskusi &gt; Workspace
              </Breadcrumb>
            </HeaderLeft>
            <HeaderRight>
              <InfoButton onClick={() => setShowMini(true)}>i</InfoButton>
              <BackButton onClick={() => window.history.back()}>Kembali</BackButton>
            </HeaderRight>
          </HeaderTop>
          
          {performanceScore !== null && (
            <PerformanceBox>
              <div className="label">🎮 Team Performance</div>
              <div className="stars">{getStars(performanceScore)}</div>
              <ProgressWrapper>
                <ProgressBar>
                  <div style={{ width: `${performanceScore}%` }} />
                </ProgressBar>
                <span>{Math.round(performanceScore)}%</span>
              </ProgressWrapper>
            </PerformanceBox>
          )}
        </Header>

        <Container>
          {/* LEFT PANEL */}
          <LeftPanel>
            <Card>
              <ClueHeader>
                <span>🧩 Clue {usedClues.length}/{clueMax}</span>
                <button disabled={usedClues.length >= clueMax} onClick={requestClue}>
                  Ambil Clue
                </button>
              </ClueHeader>
              <ClueList>
                {Array.from({ length: clueMax }).map((_, index) => {
                  const unlocked = index < usedClues.length;
                  return (
                    <ClueItem key={index} unlocked={unlocked}>
                      {unlocked ? (
                        <>
                          <strong>Clue {index + 1}:</strong>
                          <div>{clues[index]?.content}</div>
                        </>
                      ) : (
                        <>🔒 Clue {index + 1}</>
                      )}
                    </ClueItem>
                  );
                })}
              </ClueList>
            </Card>

            <Card>
              <h4>📋 Task List</h4>
              <TaskList>
                {tasks.map(task => (
                  <TaskItem key={task.id} done={task.done}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id, task.done)}
                    />
                    <span>{task.text}</span>
                  </TaskItem>
                ))}
              </TaskList>
            </Card>

            {/* VALIDASI UPLOAD BUTTON */}
            <UploadButton
              onClick={validateBeforeUpload}
              disabled={isValidating || isSubmitted}
              style={{
                background: isValidating 
                  ? '#9ca3af' 
                  : isSubmitted 
                  ? '#6b7280' 
                  : '#10b981',
                cursor: (isValidating || isSubmitted) ? 'not-allowed' : 'pointer'
              }}
            >
              {isValidating 
                ? "🔍 Menvalidasi..." 
                : isSubmitted 
                ? "✅ Sudah Diupload" 
                : "✅ Cek Jawaban & Upload"
              }
            </UploadButton>
          </LeftPanel>

          {/* RIGHT PANEL */}
          <RightPanel>
            {/* PSEUDOCODE - MANUAL SAVE ONLY */}
            <Card>
              <h4>📝 Pseudocode 
                <span style={{fontSize: '12px', color: '#6b7280', marginLeft: '10px'}}>
                  💾 Simpan Manual
                </span>
              </h4>
              <textarea
                value={pseudocode}
                onChange={(e) => setPseudocode(e.target.value)}
                placeholder="Tulis pseudocode di sini... (Klik Save Manual)"
                disabled={isSubmitted}
              />
              <SaveButton 
                onClick={forceSavePseudocode}
                disabled={isSubmitted}
              >
                {isSubmitted ? "✅ Sudah Diupload" : "💾 SIMPAN PSEUDOCODE"}
              </SaveButton>
            </Card>

            {/* FLOWCHART - MANUAL SAVE ONLY */}
            <FlowchartCard>
              <h4>🔄 Flowchart 
                <span style={{fontSize: '12px', color: '#6b7280', marginLeft: '10px'}}>
                  💾 Simpan Manual
                </span>
              </h4>
              <p style={{ fontSize: '12px', color: '#777' }}>
                Edit langsung di flowchart. Klik Save Manual setelah selesai.
              </p>
              <div style={{ 
                height: '400px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px', 
                overflow: 'auto',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {renderFlowchart()}
              </div>

              <ButtonRow>
                <button 
                  onClick={addCondition}
                  disabled={isSubmitted}
                  style={{
                    padding: '12px 24px',
                    background: isSubmitted ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isSubmitted ? 'not-allowed' : 'pointer'
                  }}
                >
                  ➕ Tambah Kondisi
                </button>
                <button 
                  onClick={() => {
                    if (!elseInstruction && !isSubmitted) {
                      updateElseInstruction("Instruksi ELSE");
                    }
                  }}
                  disabled={isSubmitted || !!elseInstruction}
                  style={{
                    padding: '12px 24px',
                    background: isSubmitted || elseInstruction ? '#9ca3af' : '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (isSubmitted || !!elseInstruction) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {elseInstruction ? '✅ ELSE Ada' : '➕ Tambah ELSE'}
                </button>
              </ButtonRow>

              <SaveButton 
                onClick={forceSaveFlowchart}
                disabled={isSubmitted}
              >
                {isSubmitted ? "✅ Sudah Diupload" : "💾 SIMPAN FLOWCHART"}
              </SaveButton>
            </FlowchartCard>
          </RightPanel>
        </Container>

        <MiniLessonModal show={showMini} onClose={() => setShowMini(false)} content={miniContent} />
      </Wrapper>
    </Layout>
  );
}

// Styled Components
const Wrapper = styled.div`
  padding: 20px 40px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;   
  gap: 20px;                
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  z-index: 10;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Breadcrumb = styled.div`
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 8px;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: #3759c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;


  &:hover {
    background: #2a4a9c;
    transform: translateY(-2px);
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
`;

const InfoButton = styled.button`
  width: 40px;
  height: 40px;
  background: #4e8df5;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(87, 137, 245, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(87, 137, 245, 0.4);
  }
`;

const Container = styled.div`
  display: flex;
  gap: 40px;
  padding: 40px;
  min-height: 80vh;
`;

const LeftPanel = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const PerformanceBox = styled.div`
  width: 97%;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  font-size: 13px;

  .label {
    font-weight: 500;
    opacity: 0.9;
    white-space: nowrap;
  }

  .stars {
    font-size: 16px;
    white-space: nowrap;
  }
`;
const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 220px;

span {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  padding: 3px 8px;
  border-radius: 20px;
  min-width: 40px;
  text-align: center;
}
`;


const PerformanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h4 {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const ToggleSection = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
`;
const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #5f6fb841;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #5a67d8;
  }
`;
const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;

  div {
    height: 100%;
    background: white;
    border-radius: 10px;
    transition: width 0.4s ease;
  }
`;
const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-weight: 600;
    font-size: 20px;
  }

  textarea {
    width: 94%;
    height: 250px;
    margin-top: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 15px;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
`;

const FlowchartCard = styled.div`
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-weight: 600;
    font-size: 20px;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 13px;
    color: #7f8c8d;
  }
`;

const ClueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  span {
    font-weight: 600;
    color: #2c3e50;
    font-size: 16px;
  }

  button {
    background: #4e8df5;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(164, 154, 255, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 154, 158, 0.6);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
`;

const ClueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ClueItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "unlocked" 
})`
  padding: 15px;
  border-radius: 12px;
  background: ${({ unlocked }) =>
    unlocked ? "linear-gradient(135deg, #a8edea 0%, #b8aef0 100%)" : "linear-gradient(135deg, #d3cce3 0%, #e9e4f0 100%)"};
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  strong {
    color: #2c3e50;
  }

  div {
    margin-top: 5px;
    color: #34495e;
  }
`;

const ButtonRow = styled.div`
  margin-top: 25px;
  display: flex;
  gap: 20px;
  justify-content: center;

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    background: #2a8b46;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: #255031;
      transform: translateY(-2px);
    }
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: ${({ disabled }) => disabled ? "#ccc" : "#3759c7"};
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      `
        background: #2a4a9c;
        transform: translateY(-2px);
      `}
  }
`;


const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const TaskItem = styled.label.withConfig({
  shouldForwardProp: (prop) => prop !== "done"  
})`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateX(5px);
  }

  span {
    text-decoration: ${({ done }) => (done ? "line-through" : "none")};
    opacity: ${({ done }) => (done ? 0.6 : 1)};
    color: #2c3e50;
  }

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }
`;

const UploadButton = styled.button`
  padding: 14px 20px;
  background: #3759c7;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2a4a9c;
    transform: translateY(-2px);
  }
`;
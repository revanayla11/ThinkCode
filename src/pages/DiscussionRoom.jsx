import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import api from "../api/axiosClient";
import Layout from "../components/Layout";
import MiniLessonModal from "../components/MiniLessonModal";

export default function DiscussionRoom() {
  const { materiId, roomId } = useParams();
  const navigate = useNavigate();

  /* ================= CORE STATES ================= */
  const [miniContent, setMiniContent] = useState("");
  const [showMini, setShowMini] = useState(false);
  const [showCompilerGuide, setShowCompilerGuide] = useState(false);
  const [showRules, setShowRules] = useState(false); // ✅ NEW: Rules popup
  const [timeLeft, setTimeLeft] = useState(5400); // ✅ NEW: Timer
  const [timerActive, setTimerActive] = useState(false);
  
  // Template System
  const [templateData, setTemplateData] = useState({ template: "", blanks: [] });
  const [pseudocodeBlanks, setPseudocodeBlanks] = useState([]);
  const [pseudocode, setPseudocode] = useState("");
  
  // Flowchart
  const [conditions, setConditions] = useState([]);
  const [elseInstruction, setElseInstruction] = useState("");
  
  // Clues & Tasks
  const [clues, setClues] = useState([]);
  const [usedClues, setUsedClues] = useState([]);
  const [tasks, setTasks] = useState([]);
  const clueMax = 3;

  // Performance & Status
  const [performanceScore, setPerformanceScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  /* ================= TIMER FUNCTIONS ================= */
  // ✅ FIXED TIMER - Persistent across page navigation
  const loadTimerStatus = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/timer/${roomId}/check`);
      setTimeLeft(res.data.timeLeft);
      setTimerActive(res.data.timeLeft > 0 && !res.data.expired);
    } catch (err) {
      console.error("Load timer error:", err);
    }
  }, [roomId]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  /* ================= FIXED LOAD FUNCTIONS ================= */
  const loadSubmissionStatus = async () => {
    try {
      const res = await api.get(`/discussion/submission/status/${roomId}`);
      setIsSubmitted(res.data.submitted || false);
    } catch (err) {
      console.error("Load submission status error:", err);
    }
  };

  const loadPerformance = async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/performance`);
      setPerformanceScore(res.data.score || 0);
    } catch (err) {
      console.error("Load performance error:", err);
    }
  };

  const loadWorkspaceData = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/workspace-data`);
      const data = res.data.data || {};
      
      setPseudocode(data.pseudocode || "");
      
      const flowchart = data.flowchart || { conditions: [], elseInstruction: "" };
      setConditions(Array.isArray(flowchart.conditions) ? flowchart.conditions : []);
      setElseInstruction(flowchart.elseInstruction || "");
    } catch (err) {
      console.error("Load workspace error:", err);
    }
  }, [roomId]);

  const loadTasks = async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/tasks`);
      const taskMap = res.data.data || {};
      
      const dynamicTasks = [
        { id: 1, text: "📖 Baca Mini Lesson", done: !!taskMap[1] },
        { id: 2, text: "💬 Diskusi Problem", done: !!taskMap[2] },
        { id: 3, text: "✍️ Tulis Pseudocode", done: !!taskMap[3] },
        { id: 4, text: "🔄 Buat Flowchart", done: !!taskMap[4] },
        { id: 5, text: "✅ Validasi Jawaban", done: !!taskMap[5] }
      ];
      setTasks(dynamicTasks);
    } catch (err) {
      setTasks([
        { id: 1, text: "📖 Baca Mini Lesson", done: false },
        { id: 2, text: "💬 Diskusi Problem", done: false },
        { id: 3, text: "✍️ Tulis Pseudocode", done: false },
        { id: 4, text: "🔄 Buat Flowchart", done: false },
        { id: 5, text: "✅ Validasi Jawaban", done: false }
      ]);
    }
  };

  const loadClues = async () => {
    try {
      const cluesRes = await api.get(`/discussion/clues/${materiId}`);
      setClues(cluesRes.data.data || []);
      
      const usedRes = await api.get(`/discussion/clue/used/${roomId}`);
      setUsedClues(usedRes.data.data || []);
    } catch (err) {
      console.error("Load clues error:", err);
    }
  };

  const loadTemplateData = async () => {
    try {
      const res = await api.get(`/discussion/template/${roomId}`);
      const data = res.data.data;
      setTemplateData(data);
      setPseudocodeBlanks(Array(data.blanks?.length || 0).fill(""));
    } catch (err) {
      console.error("Load template error:", err);
      setTemplateData({
        template: "IF (___BLANK_0___) THEN\n    ___BLANK_1___\nELSE\n    ___BLANK_2___\nENDIF",
        blanks: [
          { hint: "kondisi seperti x > 0" },
          { hint: "print 'Positif'" },
          { hint: "print 'Negatif'" }
        ]
      });
      setPseudocodeBlanks(["", "", ""]);
    }
  };

  // ✅ FIXED INITIAL LOAD + RULES POPUP + TIMER
  useEffect(() => {
    if (!roomId || !materiId) return;
    
    Promise.all([
      loadSubmissionStatus(),
      loadPerformance(),
      loadWorkspaceData(),
      loadTasks(),
      loadClues(),
      loadTemplateData(),
      loadTimerStatus() // ✅ ADD TIMER
    ]).then(() => {
      // ✅ SHOW RULES POPUP ON FIRST LOAD
      const hasSeenRules = localStorage.getItem(`rules_${roomId}`);
      if (!hasSeenRules && !isSubmitted) {
        setTimeout(() => {
          setShowRules(true);
          localStorage.setItem(`rules_${roomId}`, 'true');
        }, 500);
      }
    }).catch(err => console.error("Initial load error:", err));
  }, [roomId, materiId, loadWorkspaceData, loadTimerStatus]);

  /* ================= TEMPLATE FUNCTIONS ================= */
  const updateBlank = (index, value) => {
    const newBlanks = [...pseudocodeBlanks];
    newBlanks[index] = value;
    setPseudocodeBlanks(newBlanks);
    setPseudocode(renderFilledTemplate());
  };

  const renderFilledTemplate = () => {
    let filled = templateData.template || "";
    templateData.blanks?.forEach((_, i) => {
      const placeholder = `___BLANK_${i}___`;
      filled = filled.replaceAll(placeholder, pseudocodeBlanks[i] || `[BLANK ${i+1}]`);
    });
    return filled;
  };

  /* ================= FLOWCHART FUNCTIONS ================= */
  const addCondition = () => {
    if (isSubmitted) return;
    const newConditions = [...conditions, {
      condition: "",
      yes: "",
      no: ""
    }];
    setConditions(newConditions);
  };

  const updateCondition = (index, field, value) => {
    if (isSubmitted) return;
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const deleteCondition = (index) => {
    if (isSubmitted) return;
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  /* ================= TASK FUNCTIONS ================= */
  const toggleTask = async (taskId, currentDone) => {
    try {
      await api.post(`/discussion/room/${roomId}/task/${taskId}/toggle`, { 
        done: !currentDone 
      });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, done: !currentDone } : task
      ));
      loadPerformance();
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  /* ================= FIXED CLUE FUNCTIONS ================= */
  const requestClue = async () => {
    if (usedClues.length >= clueMax) {
      Swal.fire("Maksimal!", "Sudah pakai 3 clue", "info");
      return;
    }

    const nextClueIndex = usedClues.length;
    const nextClue = clues[nextClueIndex];
    if (!nextClue) {
      Swal.fire("Clue habis!", "Tidak ada clue lagi", "info");
      return;
    }

    // ✅ FIXED: Jangan tampilkan clue dulu, konfirmasi aja
    const result = await Swal.fire({
      title: "🧩 Ambil Clue?",
      html: `
        <div style="text-align: left;">
          <strong>Clue ${nextClueIndex + 1}</strong><br><br>
          <strong>Biaya:</strong> ${nextClue.cost} XP per anggota<br>
          <em>(Clue akan ditampilkan setelah konfirmasi)</em>
        </div>
      `,
      icon: "question", // ✅ FIXED: Valid icon
      showCancelButton: true,
      confirmButtonText: "💰 Bayar & Ambil",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/discussion/clue/use/${roomId}/${nextClue.id}`);
        loadClues();
        loadPerformance();
        Swal.fire("✅", "Clue berhasil diambil!", "success");
      } catch (err) {
        Swal.fire("❌", err.response?.data?.message || "Gagal ambil clue", "error");
      }
    }
  };

  /* ================= SAVE FUNCTIONS ================= */
  const savePseudocode = async () => {
    try {
      await api.post(`/discussion/room/${roomId}/pseudocode`, { pseudocode });
      Swal.fire("✅", "Pseudocode tersimpan!", "success");
      loadPerformance();
    } catch (err) {
      Swal.fire("❌", "Gagal simpan", "error");
    }
  };

  const saveFlowchart = async () => {
    try {
      await api.post(`/discussion/room/${roomId}/flowchart`, { 
        flowchart: { conditions, elseInstruction } 
      });
      Swal.fire("✅", "Flowchart tersimpan!", "success");
      loadPerformance();
    } catch (err) {
      Swal.fire("❌", "Gagal simpan", "error");
    }
  };

  /* ================= FLOWCHART RENDER ================= */
  const renderFlowchart = () => {
    const height = Math.max(400, 200 + conditions.length * 120);
    return (
      <svg width="100%" height={height} viewBox={`0 0 900 ${height}`}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>
        
        <ellipse cx="100" cy="50" rx="60" ry="30" fill="#10b981" stroke="white" strokeWidth="3"/>
        <text x="100" y="55" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">START</text>
        
        {conditions.map((item, index) => {
          const yBase = 100 + index * 120;
          return (
            <g key={index}>
              <polygon 
                points={`300,${yBase},360,${yBase+30},300,${yBase+60},240,${yBase+30}`} 
                fill="#3b82f6" stroke="white" strokeWidth="3"
              />
              <foreignObject x="220" y={yBase+10} width="160" height="50">
                <input 
                  type="text" 
                  value={item.condition || ""} 
                  onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                  placeholder="Kondisi IF..."
                  style={{
                    width: '100%', padding: '5px', borderRadius: '5px', 
                    border: '1px solid #ccc', fontSize: '12px'
                  }}
                  disabled={isSubmitted}
                />
              </foreignObject>
              
              <rect x="380" y={yBase+10} width="140" height="40" rx="8" fill="#10b981" stroke="white" strokeWidth="2"/>
              <foreignObject x="385" y={yBase+20} width="130" height="30">
                <input 
                  type="text" 
                  value={item.yes || ""} 
                  onChange={(e) => updateCondition(index, 'yes', e.target.value)}
                  placeholder="YES action"
                  style={{width: '100%', padding: '3px', fontSize: '11px'}}
                  disabled={isSubmitted}
                />
              </foreignObject>
              
              <rect x="200" y={yBase+70} width="140" height="40" rx="8" fill="#ef4444" stroke="white" strokeWidth="2"/>
              <foreignObject x="205" y={yBase+80} width="130" height="30">
                <input 
                  type="text" 
                  value={item.no || ""} 
                  onChange={(e) => updateCondition(index, 'no', e.target.value)}
                  placeholder="NO action"
                  style={{width: '100%', padding: '3px', fontSize: '11px'}}
                  disabled={isSubmitted}
                />
              </foreignObject>
              
              <path d={`M160 ${index === 0 ? 50 : yBase-40} L240 ${yBase-40}`} stroke="#333" strokeWidth="3" markerEnd="url(#arrowhead)"/>
              <path d={`M360 ${yBase+30} L380 ${yBase+25}`} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <path d={`M360 ${yBase+40} L320 ${yBase+60}`} stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            </g>
          );
        })}
        
        <ellipse cx="500" cy={height - 50} rx="60" ry="30" fill="#8b5cf6" stroke="white" strokeWidth="3"/>
        <text x="500" y={height - 45} textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">END</text>
      </svg>
    );
  };

  /* ================= VALIDATE ================= */
  const validateBeforeUpload = async () => {
    setIsValidating(true);
    try {
      const res = await api.post(`/discussion/room/${roomId}/validate`);
      setValidationResult(res.data);
      
      if (res.data.valid) {
        Swal.fire({
          title: "🎉 BENAR!",
          text: "Siap upload C code!",
          icon: "success",
          confirmButtonText: "🚀 UPLOAD"
        }).then(result => {
          if (result.isConfirmed) {
            navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`);
          }
        });
      } else {
        Swal.fire({
          title: "⚠️ Perlu Perbaikan",
          html: `
            <div style="text-align: left;">
              <strong>Pseudocode:</strong> ${res.data.details.pseudocodeMatch ? '✅' : '❌'}<br>
              <strong>Flowchart:</strong> ${res.data.details.flowchartMatch ? '✅' : '❌'}<br>
              <strong>Score:</strong> ${res.data.score}%
            </div>
          `,
          icon: "warning"
        });
      }
    } catch (err) {
      Swal.fire("Error", "Validasi gagal", "error");
    } finally {
      setIsValidating(false);
    }
  };

  /* ================= FIXED COMPILER GUIDE MODAL ================= */
  const CompilerGuideModal = () => {
    if (!showCompilerGuide) return null;
    
    // ✅ FIXED: Return promise properly, use valid icon
    Swal.fire({
      title: "💻 C Compiler Guide",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <ol style="line-height: 1.8;">
            <li><strong>Buat</strong> pseudocode & flowchart logic</li>
            <li><strong>Ubahlah atau buatkan dalam </strong> kode C </li>
          </ol>
          <ol start="3" style="line-height: 1.8;">
            <li><strong>Test</strong> di <a href="https://www.onlinegdb.com/" target="_blank" style="color: #3b82f6;">OnlineGDB</a></li>
            <li><strong>Download</strong> .c atau salin kode yang sudah dibuat lalu Upload!</li>
          </ol>
        </div>
      `,
      icon: "info", // ✅ FIXED: Valid icon
      confirmButtonText: "✅ Paham!",
      width: "700px"
    }).then(() => {
      setShowCompilerGuide(false); // ✅ FIXED: Close properly
    });
    
    return null;
  };

  /* ================= RULES POPUP ================= */
  // ✅ NEW: Rules popup
  const RulesPopup = () => {
    if (!showRules) return null;

    return Swal.fire({
      title: "📜 ROOM RULES",
      html: `
        <div style="text-align: left; font-size: 15px; line-height: 1.7;">
          <h4>🎯 Tujuan:</h4>
          <ul>
            <li>Selesaikan <strong>5 Quest</strong> secara berurutan</li>
            <li>Cek jawaban dan upload C code</li>
            <li>Target: <strong>90%+ score</strong> untuk MASTER badge 🥇</li>
          </ul>
          
          <h4>⏰ Timer: <strong>${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}</strong></h4>
          <ul>
            <li>90 menit total</li>
            <li>Overtime = penalty XP</li>
          </ul>
          
          <h4>🧩 Clue System:</h4>
          <ul>
            <li>Maksimal <strong>3 clue</strong></li>
            <li>Biaya: <strong>50 XP per anggota</strong></li>
            <li>Clue = -10% score</li>
          </ul>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <strong>⚠️ Attempt terbatas: 10x pseudocode + 10x flowchart</strong>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "🚀 MULAI QUEST!",
      confirmButtonColor: "#10b981",
      width: "650px",
      backdrop: "rgba(0,0,0,0.7)"
    }).then(() => {
      setShowRules(false);
    });
  };

  /* ================= MAIN RENDER ================= */
  return (
    <Layout>
      <Wrapper>
        {/* TIMER DISPLAY ✅ NEW */}
        {timerActive && (
          <TimerBox>
            <TimerEmoji>⏰</TimerEmoji>
            <TimerText>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </TimerText>
          </TimerBox>
        )}

        {/* HEADER */}
        <Header>
          <HeaderTop>
            <HeaderLeft>
              <Title>🚀 Materi {materiId} - Room {roomId}</Title>
              <Breadcrumb>🎮 Challenges → 💬 Team Room → 🛠️ Workspace</Breadcrumb>
            </HeaderLeft>
            <HeaderRight>
              <InfoButton onClick={() => setShowMini(true)}>ℹ️ Mini Lesson</InfoButton>
              <CompilerBtn onClick={() => setShowCompilerGuide(true)}>💻 C Guide</CompilerBtn>
              <BackButton onClick={() => window.history.back()}>← Kembali</BackButton>
            </HeaderRight>
          </HeaderTop>
          
          {performanceScore !== null && (
            <PerformanceBox>
              <Emoji>{getPerformanceEmoji(performanceScore)}</Emoji>
              <Level>{getLevelName(performanceScore)}</Level>
              <Score>{Math.round(performanceScore)}%</Score>
              <ProgressBar>
                <ProgressFill style={{ width: `${Math.max(0, performanceScore)}%` }} />
              </ProgressBar>
            </PerformanceBox>
          )}
        </Header>

        <Container>
          {/* LEFT PANEL */}
          <LeftPanel>
            <ClueCard>
              <ClueHeader>🧩 CLUE SYSTEM ({usedClues.length}/{clueMax})</ClueHeader>
              <ClueStatus>
                {usedClues.length < clueMax ? (
                  <ClueButton onClick={requestClue}>✨ Request Clue #{usedClues.length + 1}</ClueButton>
                ) : (
                  <ClueMaxed>Sudah maksimal!</ClueMaxed>
                )}
              </ClueStatus>
              <ClueList>
                {Array.from({ length: clueMax }).map((_, i) => (
                  <ClueItem key={i} used={i < usedClues.length}>
                    {i < usedClues.length ? usedClues[i]?.clueText : `🔒 Clue ${i + 1}`}
                  </ClueItem>
                ))}
              </ClueList>
            </ClueCard>

            <TaskCard>
              <CardTitle>📋 QUEST LIST</CardTitle>
              {tasks.map(task => (
                <TaskItem key={task.id} done={task.done}>
                  <TaskCheckbox 
                    type="checkbox" 
                    checked={task.done} 
                    onChange={() => toggleTask(task.id, task.done)}
                  />
                  <TaskText>{task.text}</TaskText>
                </TaskItem>
              ))}
            </TaskCard>

            <ProveMasteryButton 
              onClick={validateBeforeUpload} 
              disabled={isValidating || isSubmitted}
            >
              {isValidating ? "🔍 VALIDATING..." : 
               isSubmitted ? "🎉 CERTIFIED!" : "✅ PROVE MASTERY"}
            </ProveMasteryButton>
          </LeftPanel>

          {/* RIGHT PANEL */}
          <RightPanel>
            <PseudocodeCard>
              <CardTitle>📝 Fill-in-Blank Pseudocode</CardTitle>
              <TemplatePreview>
                <pre>{renderFilledTemplate()}</pre>
              </TemplatePreview>
              
              <BlanksContainer>
                {templateData.blanks?.map((blank, index) => (
                  <BlankRow key={index}>
                    <BlankLabel>Blank {index + 1}: {blank.hint}</BlankLabel>
                    <InputGroup>
                      <BlankInput
                        value={pseudocodeBlanks[index] || ""}
                        onChange={(e) => updateBlank(index, e.target.value)}
                        placeholder={`Jawaban blank ${index + 1}...`}
                      />
                      <HintButton onClick={() => Swal.fire(`Hint: ${blank.hint}`, "", "info")}>
                        ❓
                      </HintButton>
                    </InputGroup>
                  </BlankRow>
                ))}
              </BlanksContainer>

              <SaveButton onClick={savePseudocode} disabled={isSubmitted}>
                💾 Save Pseudocode
              </SaveButton>
            </PseudocodeCard>

            <FlowchartCard>
              <CardTitle>🔄 Flowchart Builder</CardTitle>
              <FlowchartContainer>
                {renderFlowchart()}
              </FlowchartContainer>
              <FlowchartButtons>
                <FlowBtn onClick={addCondition} disabled={isSubmitted}>
                  ➕ Add Condition
                </FlowBtn>
                <FlowBtn onClick={saveFlowchart} disabled={isSubmitted}>
                  💾 Save Flowchart
                </FlowBtn>
              </FlowchartButtons>
            </FlowchartCard>
          </RightPanel>
        </Container>
      </Wrapper>

      {/* MODALS */}
      <MiniLessonModal show={showMini} onClose={() => setShowMini(false)} content={miniContent} />
      <CompilerGuideModal />
      <RulesPopup /> {/* ✅ NEW: Rules popup */}
    </Layout>
  );
}

/* ================= UTILITY FUNCTIONS ================= */
const getPerformanceEmoji = (score) => {
  if (score >= 90) return "🥇";
  if (score >= 75) return "🥈";
  if (score >= 60) return "🥉";
  return "📈";
};

const getLevelName = (score) => {
  if (score >= 90) return "MASTER";
  if (score >= 75) return "EXPERT";
  if (score >= 60) return "ADVANCED";
  return "LEARNER";
};

/* ================= NEW STYLED COMPONENTS ================= */
const TimerBox = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(239,68,68,0.4);
  z-index: 1000;
  font-weight: 800;
  font-size: 18px;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const TimerEmoji = styled.span`font-size: 24px; margin-right: 8px;`;
const TimerText = styled.span``;

/* ================= COMPLETE STYLED COMPONENTS ================= */
const Wrapper = styled.div`padding: 20px 40px; max-width: 1600px; margin: 0 auto;`;
const Header = styled.div`background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 25px; padding: 30px; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);`;
const HeaderTop = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;`;
const HeaderLeft = styled.div``;
const Title = styled.h1`margin: 0 0 5px 0; color: #1e293b; font-size: 28px; font-weight: 800;`;
const Breadcrumb = styled.div`color: #6b7280; font-size: 14px;`;
const HeaderRight = styled.div`display: flex; gap: 15px;`;
const InfoButton = styled.button`background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 15px; cursor: pointer; font-weight: 600; transition: all 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59,130,246,0.3); }`;
const CompilerBtn = styled(InfoButton)`background: #06b6d4; &:hover { box-shadow: 0 10px 20px rgba(6,182,212,0.3); }`;
const BackButton = styled(InfoButton)`background: #6b7280; &:hover { box-shadow: 0 10px 20px rgba(107,114,128,0.3); }`;

const PerformanceBox = styled.div`text-align: center; padding: 25px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 20px; border: 3px solid #10b981;`;
const Emoji = styled.div`font-size: 48px; margin-bottom: 10px;`;
const Level = styled.div`font-size: 20px; font-weight: 800; color: #059669; margin-bottom: 5px; text-transform: uppercase;`;
const Score = styled.div`font-size: 36px; font-weight: 900; color: #059669; margin-bottom: 15px;`;
const ProgressBar = styled.div`height: 12px; background: rgba(16,185,129,0.2); border-radius: 6px; overflow: hidden;`;
const ProgressFill = styled.div`height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; border-radius: 6px;`;

const Container = styled.div`display: grid; grid-template-columns: 420px 1fr; gap: 40px;`;
const LeftPanel = styled.div`display: flex; flex-direction: column; gap: 30px;`;
const RightPanel = styled.div`display: flex; flex-direction: column; gap: 30px;`;

const CardTitle = styled.h4`margin: 0 0 20px 0; color: #1e293b; font-weight: 800; font-size: 22px;`;

const ClueCard = styled.div`background: linear-gradient(135deg, #e0e7ff, #c7d2fe); padding: 25px; border-radius: 20px; border: 3px solid #6366f1;`;
const ClueHeader = styled.div`font-size: 18px; font-weight: 700; margin-bottom: 20px; text-align: center;`;
const ClueStatus = styled.div`margin-bottom: 20px; text-align: center;`;
const ClueButton = styled.button`width: 100%; padding: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(139,92,246,0.4); }`;
const ClueMaxed = styled.div`padding: 12px; background: #fee2e2; color: #dc2626; border-radius: 12px; font-weight: 600;`;
const ClueList = styled.div`display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto;`;
const ClueItem = styled.div`padding: 12px; background: ${props => props.used ? '#c7d2fe' : '#f8fafc'}; border-radius: 10px; font-size: 13px; border-left: 4px solid ${props => props.used ? '#6366f1' : '#d1d5db'};`;

const TaskCard = styled.div`background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 25px; border-radius: 20px; border: 3px solid #10b981;`;
const TaskItem = styled.label`display: flex; align-items: center; gap: 15px; padding: 18px; margin-bottom: 12px; background: ${props => props.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.8)'}; border-radius: 15px; border: 2px solid ${props => props.done ? '#10b981' : '#d1d5db'}; cursor: pointer; transition: all 0.3s; &:hover { transform: translateX(5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }`;
const TaskCheckbox = styled.input`width: 22px; height: 22px; accent-color: #10b981; transform: scale(1.2); cursor: pointer;`;
const TaskText = styled.span`font-weight: 600; color: ${props => props.done ? '#059669' : '#374151'};`;

const ProveMasteryButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;
  padding: 25px; border-radius: 20px; font-size: 20px; font-weight: 800; cursor: pointer;
  box-shadow: 0 15px 35px rgba(139,92,246,0.3); transition: all 0.3s ease;
  &:hover:not(:disabled) { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(139,92,246,0.5); }
  &:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
`;

const PseudocodeCard = styled.div`background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 25px; border-radius: 20px; border: 3px solid #0ea5e9;`;
const TemplatePreview = styled.div`background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px dashed #bfdbfe; max-height: 220px; overflow: auto; pre {margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; }`;
const BlanksContainer = styled.div`display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;`;
const BlankRow = styled.div``;
const BlankLabel = styled.div`margin-bottom: 8px; color: #374151; font-weight: 600; font-size: 14px;`;
const InputGroup = styled.div`display: flex; gap: 12px; align-items: center;`;
const BlankInput = styled.input`flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 14px; transition: all 0.3s; &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }`;
const HintButton = styled.button`background: #f59e0b; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 18px; cursor: pointer; transition: all 0.3s; &:hover { background: #d97706; transform: scale(1.1); }`;
const SaveButton = styled.button`width: 100%; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 15px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 15px; transition: all 0.3s; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.4); } &:disabled { background: #6b7280; cursor: not-allowed; }`;

const FlowchartCard = styled.div`background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 20px; border: 3px solid #f59e0b;`;
const FlowchartContainer = styled.div`height: 450px; border: 3px solid #f59e0b; border-radius: 15px; overflow: hidden; background: linear-gradient(135deg, #fffbf0, #fef7d6); margin-bottom: 20px; display: flex; justify-content: center; align-items: center;`;
const FlowchartButtons = styled.div`display: flex; gap: 12px;`;
const FlowBtn = styled.button`flex: 1; padding: 12px 20px; border: none; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.4); } &:disabled { background: #d1d5db; cursor: not-allowed; opacity: 0.6; }`;
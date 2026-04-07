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

  // ✅ FIXED WORKSPACE LOAD - Gabung pseudocode + flowchart
  const loadWorkspaceData = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/workspace-data`);
      const data = res.data.data || {};
      
      // Template pseudocode
      setPseudocode(data.pseudocode || "");
      
      // Flowchart
      const flowchart = data.flowchart || { conditions: [], elseInstruction: "" };
      setConditions(Array.isArray(flowchart.conditions) ? flowchart.conditions : []);
      setElseInstruction(flowchart.elseInstruction || "");
    } catch (err) {
      console.error("Load workspace error:", err);
    }
  }, [roomId]);

  // ✅ FIXED TASKS - Dynamic text
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
      // Fallback tasks
      setTasks([
        { id: 1, text: "📖 Baca Mini Lesson", done: false },
        { id: 2, text: "💬 Diskusi Problem", done: false },
        { id: 3, text: "✍️ Tulis Pseudocode", done: false },
        { id: 4, text: "🔄 Buat Flowchart", done: false },
        { id: 5, text: "✅ Validasi Jawaban", done: false }
      ]);
    }
  };

  // ✅ FIXED CLUES
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

  // ✅ TEMPLATE SYSTEM
  const loadTemplateData = async () => {
    try {
      const res = await api.get(`/discussion/template/${roomId}`);
      const data = res.data.data;
      setTemplateData(data);
      setPseudocodeBlanks(Array(data.blanks?.length || 0).fill(""));
    } catch (err) {
      console.error("Load template error:", err);
      // Default template
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

  // ✅ INITIAL LOAD
  useEffect(() => {
    if (!roomId || !materiId) return;
    
    Promise.all([
      loadSubmissionStatus(),
      loadPerformance(),
      loadWorkspaceData(),
      loadTasks(),
      loadClues(),
      loadTemplateData()
    ]).catch(err => console.error("Initial load error:", err));
  }, [roomId, materiId, loadWorkspaceData]);

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
      loadPerformance(); // Refresh performance
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  /* ================= CLUE FUNCTIONS ================= */
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

    const result = await Swal.fire({
      title: "🧩 Ambil Clue?",
      html: `
        <div style="text-align: left;">
          <strong>Clue ${nextClueIndex + 1}:</strong><br>
          <em>${nextClue.content}</em><br><br>
          <strong>Biaya:</strong> ${nextClue.cost} XP per anggota
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ambil Clue",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/discussion/clue/use/${roomId}/${nextClue.id}`);
        loadClues(); // Reload clues & used clues
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

  /* ================= FIXED FLOWCHART RENDER ================= */
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
        
        {/* START */}
        <ellipse cx="100" cy="50" rx="60" ry="30" fill="#10b981" stroke="white" strokeWidth="3"/>
        <text x="100" y="55" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">START</text>
        
        {/* CONDITIONS */}
        {conditions.map((item, index) => {
          const yBase = 100 + index * 120;
          return (
            <g key={index}>
              {/* Diamond Decision */}
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
              
              {/* YES Path */}
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
              
              {/* NO Path */}
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
              
              {/* Arrows */}
              <path d={`M160 ${index === 0 ? 50 : yBase-40} L240 ${yBase-40}`} stroke="#333" strokeWidth="3" markerEnd="url(#arrowhead)"/>
              <path d={`M360 ${yBase+30} L380 ${yBase+25}`} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <path d={`M360 ${yBase+40} L320 ${yBase+60}`} stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            </g>
          );
        })}
        
        {/* END */}
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

  /* ================= COMPILER GUIDE MODAL ================= */
  const CompilerGuideModal = () => {
    if (!showCompilerGuide) return null;
    
    return Swal.fire({
      title: "💻 C Compiler Guide",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <ol style="line-height: 1.8;">
            <li><strong>Copy</strong> pseudocode & flowchart logic</li>
            <li><strong>Translate</strong> ke C code:</li>
          </ol>
          <pre style="background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 8px; font-size: 12px; max-height: 250px; overflow: auto; white-space: pre-wrap;">
#include <stdio.h>
int main() {
    int angka;
    scanf("%d", &angka);
    
    if (angka > 0) {
        printf("Angka %d adalah Positif\\n", angka);
    } else {
        printf("Angka %d adalah Negatif\\n", angka);
    }
    return 0;
}
          </pre>
          <ol start="3" style="line-height: 1.8;">
            <li><strong>Test</strong> di <a href="https://www.onlinegdb.com/" target="_blank" style="color: #3b82f6;">OnlineGDB</a></li>
            <li><strong>Download</strong> .c → Upload!</li>
          </ol>
        </div>
      `,
      icon: "code",
      confirmButtonText: "✅ Paham!",
      width: "700px"
    }).then(() => setShowCompilerGuide(false));
  };

  /* ================= MAIN RENDER ================= */
  return (
    <Layout>
      <Wrapper>
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
          
          {/* PERFORMANCE BAR - FIXED */}
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
            {/* CLUES */}
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

            {/* TASKS */}
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
            {/* PSEUDOCODE TEMPLATE - FIXED BLANKS */}
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

            {/* FLOWCHART - FIXED LAYOUT */}
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
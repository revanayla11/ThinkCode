import { useEffect, useState, useCallback, useRef } from "react";
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

  /* ================= CORE STATES ================= */
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
  const [elseInstruction, setElseInstruction] = useState("");
  const [performanceScore, setPerformanceScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  /* ================= GAMIFICATION STATES ================= */
  const [showRules, setShowRules] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [penaltyXP, setPenaltyXP] = useState(0);
  const [compilerGuide, setCompilerGuide] = useState(false);
  
  // Quest system
  const [currentQuest, setCurrentQuest] = useState(0);
  const quests = [
    { id: 0, title: "🧠 Identify Problem", xpReq: 0 },
    { id: 1, title: "📊 Gather Data", xpReq: 50 },
    { id: 2, title: "💻 Write Pseudo", xpReq: 100 },
    { id: 3, title: "🔄 Build Flow", xpReq: 150 },
    { id: 4, title: "🎮 Code It!", xpReq: 200 }
  ];

  // Fill-in-blank template
  const [templateData, setTemplateData] = useState({ template: "", blanks: [], expectedFull: "" });
  const [pseudocodeBlanks, setPseudocodeBlanks] = useState([]);

  const timerRef = useRef(null);

  /* ================= INIT LOAD ================= */
  useEffect(() => {
    if (!roomId) return;

    // Rules popup first
    if (showRules) showRulesPopup();

    // Load all data
    Promise.all([
      loadSubmissionStatus(),
      loadPerformance(),
      loadWorkspace(),
      loadUsedClues(),
      loadTemplateData(),
      loadTimerStatus()
    ]);
  }, [roomId]);

  /* ================= ALL FUNCTIONS IMPLEMENTED ================= */
  const loadSubmissionStatus = async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/status`);
      setIsSubmitted(res.data.submitted || false);
    } catch (err) {
      console.error("Load submission status error:", err);
    }
  };

  const loadPerformance = async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/performance`);
      setPerformanceScore(res.data.score || 0);
      setUserXp(res.data.xp || 0);
    } catch (err) {
      console.error("Load performance error:", err);
    }
  };

  const loadWorkspace = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/workspace`);
      setConditions(res.data.conditions || []);
      setTasks(res.data.tasks || []);
      setElseInstruction(res.data.elseInstruction || "");
    } catch (err) {
      console.error("Load workspace error:", err);
    }
  }, [roomId]);

  const loadUsedClues = async () => {
    try {
      const res = await api.get(`/discussion/room/${roomId}/clues`);
      setClues(res.data.clues || []);
      setUsedClues(res.data.used || []);
    } catch (err) {
      console.error("Load clues error:", err);
    }
  };

  const loadTemplateData = async () => {
    try {
      const res = await api.get(`/discussion/template/${roomId}`);
      setTemplateData(res.data.data);
      setPseudocodeBlanks(Array(res.data.data.blanks.length).fill(""));
    } catch (err) {
      console.error("Load template error:", err);
    }
  };

  const loadTimerStatus = async () => {
    try {
      const res = await api.get(`/discussion/timer/${roomId}/check`);
      setTimeLeft(Math.max(0, res.data.timeLeft));
      setPenaltyXP(res.data.penaltyXP || 0);
    } catch (err) {
      console.error("Load timer error:", err);
    }
  };

  /* ================= RULES POPUP ================= */
  const showRulesPopup = () => {
    Swal.fire({
      title: "🎮 MISSION BRIEFING",
      html: `
        <div style="text-align: left; font-size: 16px; line-height: 1.6;">
          <h3 style="color: #1e40af;">📋 MISSION RULES:</h3>
          <ul style="padding-left: 20px;">
            <li>⏰ <strong>60 MENIT TIMER</strong> - Overtime 5 menit = <strong>-10 XP</strong></li>
            <li>🧩 <strong>3 Clues MAX</strong> - Cost TEAM XP & -10% score/clue</li>
            <li>🔄 <strong>10 Attempts/skill</strong> - Practice = Learning cost</li>
            <li>✅ <strong>Prove Mastery</strong> - Auto validate vs official answer</li>
            <li>📝 <strong>Fill blanks</strong> + Build flowchart exactly</li>
          </ul>
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); 
                      padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #f59e0b;">
            <h4 style="margin-top: 0;">💻 C IMPLEMENTATION:</h4>
            <ol style="line-height: 1.8;">
              <li>✅ Copy pseudocode + flowchart</li>
              <li>🔄 Translate ke C code</li>
              <li>🧪 Test di <a href="https://www.onlinegdb.com/" target="_blank" style="color: #1e40af;">OnlineGDB</a></li>
              <li>📤 Download <code>.c</code> → Upload next page</li>
            </ol>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "🚀 START MISSION",
      confirmButtonColor: "#3b82f6",
      allowOutsideClick: false,
      allowEscapeKey: false,
      width: "600px"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setShowRules(false);
        await api.post(`/discussion/room/${roomId}/timer/start`);
        startTimerInterval();
      }
    });
  };

  /* ================= TIMER SYSTEM ================= */
  const startTimerInterval = () => {
    timerRef.current = setInterval(async () => {
      if (timeLeft <= 0) return;
      
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });

      // Check penalty every 30s
      if (timeLeft % 30 === 0) {
        try {
          const res = await api.get(`/discussion/timer/${roomId}/check`);
          setPenaltyXP(res.data.penaltyXP);
          if (res.data.overtimeMinutes > 0 && res.data.overtimeMinutes % 5 === 0) {
            Swal.fire({
              title: "⏰ OVERTIME!",
              text: `-${res.data.penaltyXP} XP penalty! (every 5min overtime)`,
              icon: "warning",
              timer: 2500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          console.error("Timer check error:", err);
        }
      }
    }, 1000);
  };

  /* ================= TEMPLATE SYSTEM ================= */
  const updateBlank = (index, value) => {
    const newBlanks = [...pseudocodeBlanks];
    newBlanks[index] = value;
    setPseudocodeBlanks(newBlanks);
    setPseudocode(renderFilledTemplate());
  };

  const renderFilledTemplate = () => {
    let filled = templateData.template;
    templateData.blanks.forEach((_, i) => {
      const placeholder = `___BLANK_${i}___`;
      filled = filled.replaceAll(placeholder, 
        pseudocodeBlanks[i] || `[BLANK ${i+1} - ${templateData.blanks[i]?.hint || ''}]`
      );
    });
    return filled;
  };

  const showBlankHint = (index, hint) => {
    Swal.fire({
      title: `💡 Hint for Blank ${index + 1}`,
      text: hint,
      icon: "lightbulb",
      timer: 4000,
      showConfirmButton: false
    });
  };

  /* ================= FLOWCHART SYSTEM ================= */
  const addCondition = () => {
    if (isSubmitted) return;
    const newConditions = [...conditions, {
      condition: `Kondisi ${conditions.length + 1}`,
      yes: `Instruksi ${conditions.length + 1}`,
      no: `Instruksi ${conditions.length + 1}`
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
    if (isSubmitted || index < 0 || index >= conditions.length) return;
    const newConditions = conditions.filter((_, i) => i !== index);
    const reindexed = newConditions.map((cond, i) => ({ 
      ...cond, 
      condition: `Kondisi ${i + 1}`, 
      yes: `Instruksi ${i + 1}`,
      no: `Instruksi ${i + 1}`
    }));
    setConditions(reindexed);
  };

  const toggleTask = async (taskId, currentDone) => {
    try {
      await api.post(`/discussion/room/${roomId}/task/${taskId}/toggle`, { done: !currentDone });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, done: !currentDone } : task
      ));
      setUserXp(prev => prev + 10); // Reward XP
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  const requestClue = async () => {
    if (usedClues.length >= clueMax || userXp < 50) return;
    try {
      const res = await api.post(`/discussion/room/${roomId}/clue`);
      setClues(prev => [...prev, res.data]);
      setUsedClues(prev => [...prev, res.data]);
      setUserXp(prev => prev - 20); // Clue cost
    } catch (err) {
      console.error("Request clue error:", err);
    }
  };

  const forceSavePseudocode = async () => {
    try {
      await api.post(`/discussion/room/${roomId}/pseudocode`, { 
        code: pseudocode,
        blanks: pseudocodeBlanks 
      });
      Swal.fire("💾 Saved!", "Pseudocode saved successfully!", "success");
    } catch (err) {
      console.error("Save pseudocode error:", err);
    }
  };

  const forceSaveFlowchart = async () => {
    try {
      await api.post(`/discussion/room/${roomId}/flowchart`, { 
        conditions, 
        elseInstruction 
      });
      Swal.fire("💾 Saved!", "Flowchart saved successfully!", "success");
    } catch (err) {
      console.error("Save flowchart error:", err);
    }
  };

  const validateBeforeUpload = async () => {
    setIsValidating(true);
    try {
      const payload = {
        pseudocode,
        conditions,
        elseInstruction,
        blanks: pseudocodeBlanks
      };
      const res = await api.post(`/discussion/room/${roomId}/validate`, payload);
      setValidationResult(res.data);
      setPerformanceScore(res.data.score);
      
      if (res.data.valid) {
        setIsSubmitted(true);
        setUserXp(prev => prev + 100); // Mastery bonus
      }
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setIsValidating(false);
    }
  };

  /* ================= RENDER FLOWCHART ================= */
  const renderFlowchart = () => {
    const height = 200 + conditions.length * 150 + (elseInstruction ? 100 : 0);
    return (
      <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
        {/* Start */}
        <ellipse cx="100" cy="50" rx="60" ry="30" fill="#10b981" stroke="white" strokeWidth="3"/>
        <text x="100" y="55" textAnchor="middle" fill="white" fontWeight="bold">START</text>
        
        {/* Conditions */}
        {conditions.map((item, index) => (
          <g key={index}>
            <polygon 
              points="300,${100 + index * 150},360,${130 + index * 150},300,${160 + index * 150},240,${130 + index * 150}" 
              fill="#3b82f6" stroke="white" strokeWidth="3"
            />
            <foreignObject x="200" y={90 + index * 150} width="200" height="80">
              <input 
                type="text" value={item.condition} 
                onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                style={{width: '100%', padding: '5px', borderRadius: '5px'}}
                disabled={isSubmitted}
              />
            </foreignObject>
            
            {/* YES branch */}
            <rect x="380" y={115 + index * 150} width="120" height="40" rx="10" fill="#10b981" stroke="white" strokeWidth="2"/>
            <foreignObject x="385" y={130 + index * 150} width="110" height="30">
              <input type="text" value={item.yes} onChange={(e) => updateCondition(index, 'yes', e.target.value)}
                style={{width: '100%', padding: '3px'}} disabled={isSubmitted} />
            </foreignObject>
            
            {/* NO branch */}
            <rect x="200" y={190 + index * 150} width="120" height="40" rx="10" fill="#ef4444" stroke="white" strokeWidth="2"/>
            <foreignObject x="205" y={205 + index * 150} width="110" height="30">
              <input type="text" value={item.no} onChange={(e) => updateCondition(index, 'no', e.target.value)}
                style={{width: '100%', padding: '3px'}} disabled={isSubmitted} />
            </foreignObject>
            
            {/* Delete Button */}
            {!isSubmitted && (
              <circle cx="750" cy={130 + index * 150} r="20" fill="#ef4444" stroke="white" strokeWidth="3"
                style={{cursor: 'pointer'}}
                onClick={() => deleteCondition(index)}
              />
            )}
            <text x="750" y={135 + index * 150} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">🗑️</text>
          </g>
        ))}
        
        {/* End */}
        <ellipse cx="400" cy={height - 50} rx="60" ry="30" fill="#8b5cf6" stroke="white" strokeWidth="3"/>
        <text x="400" y={height - 45} textAnchor="middle" fill="white" fontWeight="bold">END</text>
        
        {/* Arrows */}
        <path d="M160 50 L240 50" stroke="#333" strokeWidth="3" markerEnd="url(#arrowhead)"/>
        {conditions.map((_, index) => (
          <>
            <path d={`M360 ${130 + index * 150} L380 ${125 + index * 150}`} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <path d={`M360 ${140 + index * 150} L300 ${160 + index * 150}`} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)"/>
          </>
        ))}
      </svg>
    );
  };

  /* ================= UTILITY FUNCTIONS ================= */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /* ================= MODALS ================= */
  const CompilerGuideModal = ({ show, onClose }) => {
    if (!show) return null;
    Swal.fire({
      title: "💻 C Compiler Guide",
      html: `
        <div style="text-align: left;">
          <ol style="line-height: 1.8;">
            <li><strong>Copy</strong> pseudocode & flowchart</li>
            <li><strong>Translate</strong> ke C:</li>
          </ol>
          <pre style="background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 8px; font-size: 13px; max-height: 300px; overflow: auto;">
#include <stdio.h>
int main() {
    int angka;
    scanf("%d", &angka);
    
    if (angka > 0) {
        printf("Angka %d adalah Positif\\n", angka);
    } else if (angka < 0) {
        printf("Angka %d adalah Negatif\\n", angka);
    } else {
        printf("Angka %d adalah Nol\\n", angka);
    }
    return 0;
}
          </pre>
          <ol start="3" style="line-height: 1.8;">
            <li><strong>Test</strong> di <a href="https://www.onlinegdb.com/" target="_blank">OnlineGDB</a></li>
            <li><strong>Download</strong> .c file → Upload next page</li>
          </ol>
        </div>
      `,
      icon: "code",
      confirmButtonText: "Got it! 🚀",
      width: "700px"
    }).then(onClose);
  };

  const ValidationFeedbackModal = ({ show, feedback, onClose }) => {
    if (!show || !feedback) return null;
    
    const hints = feedback.details?.smartHints || [];
    
    Swal.fire({
      title: feedback.valid ? "🎉 MASTERY ACHIEVED!" : "⚠️ Keep Practicing!",
      html: `
        <div style="text-align: left;">
          ${!feedback.valid ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
              <strong>📍 Issues Found:</strong><br>
              ${hints.map(h => `• ${h}`).join('<br>')}
            </div>
          ` : ''}
          <div style="font-size: 14px;">
            <strong>Pseudocode:</strong> ${feedback.details?.pseudocodeMatch ? '✅' : '❌'}<br>
            <strong>Flowchart:</strong> ${feedback.details?.flowchartMatch ? '✅' : '❌'}<br>
            <strong>Score:</strong> ${feedback.score}%
          </div>
        </div>
      `,
      icon: feedback.valid ? "success" : "warning",
      confirmButtonText: feedback.valid ? "🚀 Upload C Code" : "🔄 Fix & Retry",
      showCancelButton: feedback.valid
    }).then(result => {
      if (result.isConfirmed && feedback.valid) {
        navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`);
      }
      onClose();
    });
  };

  /* ================= MAIN RENDER ================= */
  return (
    <GamifiedLayout>
      {/* 🔥 QUEST TRACKER */}
      <QuestTracker>
        <QuestHeader>⚔️ QUEST LOG</QuestHeader>
        {quests.map((quest, index) => (
          <QuestItem 
            key={quest.id}
            active={currentQuest === index}
            unlocked={userXp >= quest.xpReq}
            onClick={() => userXp >= quest.xpReq && setCurrentQuest(index)}
          >
            <QuestIcon unlocked={userXp >= quest.xpReq}>
              {userXp >= quest.xpReq ? '✅' : '🔒'}
            </QuestIcon>
            <div>
              <QuestTitle>{quest.title}</QuestTitle>
              <QuestXP>XP: {quest.xpReq}</QuestXP>
            </div>
          </QuestItem>
        ))}
      </QuestTracker>

      {/* 🔥 TIMER */}
      <TimerDisplay>
        <TimerIcon>⏰</TimerIcon>
        <TimerClock>{formatTime(timeLeft)}</TimerClock>
        {penaltyXP > 0 && <PenaltyBadge>-{penaltyXP} XP</PenaltyBadge>}
      </TimerDisplay>

      <Layout>
        <Wrapper>
          {/* Header */}
          <Header>
            <HeaderTop>
              <HeaderLeft>
                <Title>Materi {materiId}</Title>
                <Breadcrumb>🎮 Challenges → 💬 Team → 🚀 Workspace</Breadcrumb>
              </HeaderLeft>
              <HeaderRight>
                <InfoButton onClick={() => setShowMini(true)}>ℹ️</InfoButton>
                <BackButton onClick={() => window.history.back()}>← Base</BackButton>
              </HeaderRight>
            </HeaderTop>
            
            {/* Performance */}
            {performanceScore !== null && (
              <PerformanceBox>
                <Emoji>{getPerformanceEmoji(performanceScore)}</Emoji>
                <Level>{getLevelName(performanceScore)}</Level>
                <Score>{Math.round(performanceScore)}%</Score>
                <ProgressBar>
                  <ProgressFill style={{ width: `${performanceScore}%` }} />
                </ProgressBar>
              </PerformanceBox>
            )}
          </Header>

          <Container>
            {/* LEFT PANEL */}
            <LeftPanel>
              {/* CLUE SYSTEM */}
              <ClueCard locked={userXp < 50}>
                <ClueHeader>
                  🧩 CLUE SYSTEM {usedClues.length}/{clueMax} 
                  {userXp < 50 && <LockIcon>🔒 Quest 2</LockIcon>}
                </ClueHeader>
                {userXp < 50 ? (
                  <LockMessage>Complete Quest 2 (50 XP) to unlock!</LockMessage>
                ) : (
                  <>
                    <ClueButton 
                      onClick={requestClue} 
                      disabled={usedClues.length >= clueMax}
                    >
                      ✨ Use Clue #{usedClues.length + 1}
                    </ClueButton>
                    <ClueList>
                      {Array.from({ length: clueMax }).map((_, i) => (
                        <ClueItem key={i} unlocked={i < usedClues.length}>
                          {i < usedClues.length ? clues[i]?.content : `🔒 Clue ${i + 1}`}
                        </ClueItem>
                      ))}
                    </ClueList>
                  </>
                )}
              </ClueCard>

              {/* TASKS = QUESTS */}
              <TaskCard>
                <CardTitle>📋 QUEST LIST</CardTitle>
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
              </TaskCard>

              <ProveMasteryButton 
                onClick={validateBeforeUpload} 
                disabled={isValidating || isSubmitted}
              >
                {isValidating ? "🔍 VALIDATING..." : isSubmitted ? "🎉 CERTIFIED!" : "✅ PROVE MASTERY"}
              </ProveMasteryButton>
            </LeftPanel>

            {/* RIGHT PANEL */}
            <RightPanel>
              {/* FILL-IN-BLANK PSEUDOCODE */}
              <PseudocodeCard>
                <CardTitle>📝 {templateData.materiType?.toUpperCase() || "Fill-in-Blank"}</CardTitle>
                
                <TemplatePreview>
                  <pre>{renderFilledTemplate()}</pre>
                </TemplatePreview>

                <BlanksContainer>
                  {templateData.blanks.map((blank, index) => (
                    <BlankRow key={index}>
                      <BlankLabel>
                        <strong>Blank {index + 1}:</strong> {blank.hint}
                      </BlankLabel>
                      <InputGroup>
                        <input
                          value={pseudocodeBlanks[index] || ""}
                          onChange={(e) => updateBlank(index, e.target.value)}
                          placeholder={`Answer for blank ${index + 1}...`}
                          className="blank-input"
                        />
                        <HintButton onClick={() => showBlankHint(index, blank.hint)}>
                          ❓
                        </HintButton>
                      </InputGroup>
                    </BlankRow>
                  ))}
                </BlanksContainer>

                <PreviewSection>
                  <strong>✅ Complete Solution:</strong>
                  <pre>{pseudocode}</pre>
                  <SaveButton onClick={forceSavePseudocode} disabled={isSubmitted}>
                    💾 Save Pseudocode
                  </SaveButton>
                </PreviewSection>
              </PseudocodeCard>

              {/* FLOWCHART BUILDER */}
              <FlowchartCard>
                <CardTitle>🔄 Flowchart Builder</CardTitle>
                <FlowchartContainer>
                  {renderFlowchart()}
                </FlowchartContainer>
                <FlowchartButtons>
                  <button onClick={addCondition} disabled={isSubmitted}>
                    ➕ Add Condition
                  </button>
                  {conditions.length > 0 && (
                    <button onClick={() => deleteCondition(conditions.length - 1)} disabled={isSubmitted}>
                      🗑️ Delete Last
                    </button>
                  )}
                  <button onClick={forceSaveFlowchart} disabled={isSubmitted}>
                    💾 Save Flowchart
                  </button>
                </FlowchartButtons>
              </FlowchartCard>

              <CompilerButton onClick={() => setCompilerGuide(true)}>
                💻 C Compiler Guide
              </CompilerButton>
            </RightPanel>
          </Container>
        </Wrapper>
      </Layout>

      {/* Modals */}
      <MiniLessonModal show={showMini} onClose={() => setShowMini(false)} content={miniContent} />
      {compilerGuide && <CompilerGuideModal onClose={() => setCompilerGuide(false)} />}
      {validationResult && !validationResult?.valid && (
        <ValidationFeedbackModal 
          feedback={validationResult} 
          onClose={() => setValidationResult(null)}
        />
      )}
    </GamifiedLayout>
  );
}

/* ================= ALL STYLED COMPONENTS ================= */
const GamifiedLayout = styled.div`position: relative; padding-top: 140px;`;
const QuestTracker = styled.div`
  position: fixed; top: 20px; left: 20px; z-index: 1000;
  background: rgba(0,0,0,0.95); backdrop-filter: blur(20px);
  padding: 25px; border-radius: 20px; max-width: 300px; max-height: 80vh; overflow-y: auto;
  border: 2px solid #3b82f6; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;
const QuestHeader = styled.h3`margin: 0 0 20px 0; color: #3b82f6; font-size: 20px; text-align: center;`;
const QuestItem = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'active' && prop !== 'unlocked' })`
  display: flex; gap: 12px; padding: 15px; margin: 8px 0; border-radius: 12px;
  background: ${props => props.unlocked ? 
    props.active ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#1e40af' : '#6b7280'};
  cursor: ${props => props.unlocked ? 'pointer' : 'default'};
  color: white; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  &:hover { transform: ${props => props.unlocked ? 'translateX(5px) scale(1.02)' : 'none'}; }
`;
const QuestIcon = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'unlocked' })`
  font-size: 20px; min-width: 30px; text-align: center;
`;
const QuestTitle = styled.div`font-weight: 600; font-size: 14px;`;
const QuestXP = styled.div`font-size: 12px; opacity: 0.9;`;

const TimerDisplay = styled.div`
  position: fixed; top: 20px; right: 20px; z-index: 1000;
  background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px 30px;
  border-radius: 25px; color: white; text-align: center;
  box-shadow: 0 20px 40px rgba(239,68,68,0.4); min-width: 180px;
`;
const TimerIcon = styled.div`font-size: 24px; margin-bottom: 5px;`;
const TimerClock = styled.div`font-size: 32px; font-weight: 800; margin: 0 10px;`;
const PenaltyBadge = styled.div`background: rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-top: 10px;`;

const Wrapper = styled.div`padding: 20px 60px 40px; max-width: 1600px; margin: 0 auto;`;
const Header = styled.div`background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 25px; padding: 30px; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.3);`;
const HeaderTop = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;`;
const HeaderLeft = styled.div``;
const Title = styled.h1`margin: 0 0 5px 0; color: #1e293b; font-size: 28px;`;
const Breadcrumb = styled.div`color: #6b7280; font-size: 14px;`;
const HeaderRight = styled.div`display: flex; gap: 15px;`;
const InfoButton = styled.button`background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer; font-weight: 600;`;
const BackButton = styled.button`background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer; font-weight: 600;`;

const PerformanceBox = styled.div`text-align: center; padding: 25px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 20px; border: 3px solid #10b981;`;
const Emoji = styled.div`font-size: 48px; margin-bottom: 10px;`;
const Level = styled.div`font-size: 20px; font-weight: 800; color: #059669; margin-bottom: 5px;`;
const Score = styled.div`font-size: 36px; font-weight: 900; color: #059669; margin-bottom: 15px;`;
const ProgressBar = styled.div`height: 12px; background: rgba(16,185,129,0.2); border-radius: 6px; overflow: hidden;`;
const ProgressFill = styled.div`height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; border-radius: 6px;`;

const Container = styled.div`display: grid; grid-template-columns: 420px 1fr; gap: 40px;`;
const LeftPanel = styled.div`display: flex; flex-direction: column; gap: 30px; height: fit-content;`;
const RightPanel = styled.div`display: flex; flex-direction: column; gap: 30px;`;

const CardTitle = styled.h4`margin: 0 0 20px 0; color: #1e293b; font-weight: 800; font-size: 22px; display: flex; align-items: center; gap: 12px;`;

const ClueCard = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'locked' })`
  background: ${props => props.locked ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'};
  padding: 25px; border-radius: 20px; border: 3px solid ${props => props.locked ? '#d1d5db' : '#6366f1'};
  box-shadow: 0 20px 40px rgba(99,102,241,0.2);
`;
const ClueHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 18px; font-weight: 700;`;
const LockIcon = styled.span`font-size: 20px; animation: shake 0.5s infinite; @keyframes shake {0%,100%{transform:translateX(0);}25%{transform:translateX(-3px);}75%{transform:translateX(3px);}}`;
const LockMessage = styled.div`text-align: center; padding: 30px; color: #6b7280; font-size: 16px; font-weight: 600;`;
const ClueButton = styled.button`width: 100%; padding: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-bottom: 15px; &:disabled {background: #9ca3af; cursor: not-allowed;}`;
const ClueList = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const ClueItem = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'unlocked' })`
  padding: 12px; background: ${props => props.unlocked ? '#c7d2fe' : '#f3f4f6'}; border-radius: 10px; font-size: 14px;
`;

const TaskCard = styled.div`background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 25px; border-radius: 20px; border: 3px solid #10b981; box-shadow: 0 20px 40px rgba(16,185,129,0.2);`;
const TaskItem = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'done' })`
  display: flex; align-items: center; gap: 15px; padding: 20px; margin-bottom: 12px;
  background: ${props => props.done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.8)'};
  border-radius: 15px; border: 2px solid ${props => props.done ? '#059669' : '#d1d5db'};
  cursor: pointer; transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); color: white;
  &:hover:not([disabled]) { transform: translateX(8px) scale(1.02); box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
  input[type="checkbox"] { width: 22px; height: 22px; accent-color: white; transform: scale(1.2); cursor: pointer; }
`;

const ProveMasteryButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;
  padding: 25px; border-radius: 20px; font-size: 20px; font-weight: 800; cursor: pointer;
  box-shadow: 0 10px 30px rgba(139,92,246,0.3); transition: all 0.3s ease;
  &:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(139,92,246,0.5); }
  &:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
`;

const PseudocodeCard = styled.div`background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 25px; border-radius: 20px; border: 3px solid #0ea5e9; box-shadow: 0 20px 40px rgba(14,165,233,0.2);`;
const TemplatePreview = styled.div`background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px dashed #cbd5e1; max-height: 200px; overflow: auto; pre {margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;} `;
const BlanksContainer = styled.div`display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;`;
const BlankRow = styled.div``;
const BlankLabel = styled.div`margin-bottom: 8px; color: #374151; font-weight: 600;`;
const InputGroup = styled.div`display: flex; gap: 12px; align-items: center;`;
const HintButton = styled.button`background: #f59e0b; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 18px; cursor: pointer; transition: all 0.3s ease; &:hover { background: #d97706; transform: scale(1.1); }`;
const PreviewSection = styled.div`border-top: 2px solid #e2e8f0; padding-top: 20px;`;
const SaveButton = styled.button`
  width: 100%; padding: 15px 25px; background: linear-gradient(135deg, #10b981, #059669);
  color: white; border: none; border-radius: 15px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 15px;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(16,185,129,0.4); }
  &:disabled { background: #6b7280; cursor: not-allowed; }
`;

const FlowchartCard = styled.div`background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 20px; border: 3px solid #f59e0b; box-shadow: 0 20px 40px rgba(245,158,11,0.3);`;
const FlowchartContainer = styled.div`height: 450px; border: 2px solid #f59e0b; border-radius: 15px; overflow: auto; background: #fffbf0; display: flex; justify-content: center; align-items: center; margin-bottom: 20px;`;
const FlowchartButtons = styled.div`display: flex; gap: 15px; flex-wrap: wrap; button { padding: 12px 20px; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; &:hover:not(:disabled) { transform: translateY(-2px); } &:disabled { opacity: 0.5; cursor: not-allowed; } }`;

const CompilerButton = styled.button`
  background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none;
  padding: 20px 30px; border-radius: 20px; font-weight: 700; font-size: 18px; cursor: pointer;
  box-shadow: 0 10px 30px rgba(6,182,212,0.3); transition: all 0.3s ease;
  &:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(6,182,212,0.5); }
`;
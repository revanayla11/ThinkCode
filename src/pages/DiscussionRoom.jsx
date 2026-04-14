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
  const [miniLessonData, setMiniLessonData] = useState(null);
  const [showCompilerGuide, setShowCompilerGuide] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5400);
  const [timerActive, setTimerActive] = useState(false);
  
  // Template System
  const [templateData, setTemplateData] = useState({ template: "", blanks: [] });
  const [pseudocodeBlanks, setPseudocodeBlanks] = useState([]);
  const [pseudocode, setPseudocode] = useState("");
  const [pseudocodeSaved, setPseudocodeSaved] = useState(false);
  
  // Flowchart
  const [conditions, setConditions] = useState([]);
  const [elseInstruction, setElseInstruction] = useState("");
  const [showElse, setShowElse] = useState(false);
  
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
  const loadTimerStatus = useCallback(async () => {
    try {
      const res = await api.get(`/discussion/timer/${roomId}/check`);
      setTimeLeft(res.data.timeLeft);
      setTimerActive(res.data.timeLeft > 0 && !res.data.expired);
    } catch (err) {
      console.error("Load timer error:", err);
    }
  }, [roomId]);

    /* ================= TEMPLATE FUNCTIONS ================= */
  const updateBlank = (index, value) => {
    const newBlanks = [...pseudocodeBlanks];
    newBlanks[index] = value;
    setPseudocodeBlanks(newBlanks);

    // 🔥 GENERATE PSEUDOCODE dari template
    let filled = templateData.template || "";
    templateData.blanks?.forEach((_, i) => {
      filled = filled.replaceAll(
        `___BLANK_${i}___`,
        newBlanks[i] || `[BLANK ${i + 1}]`
      );
    });
    setPseudocode(filled);
  };

  // 🔥 INI YANG HILANG - TAMBAH INI!
// 🔥 CALLBACK VERSION - SELALU FRESH
const renderFilledTemplate = useCallback(() => {
  let filled = templateData.template || "";
  templateData.blanks?.forEach((_, i) => {
    const placeholder = `___BLANK_${i}___`;
    const value = pseudocodeBlanks[i] || "";
    filled = filled.replaceAll(placeholder, value || `[BLANK ${i+1}]`);
  });
  return filled;
}, [templateData.template, templateData.blanks, pseudocodeBlanks]);

// Update useEffect untuk auto-update pseudocode
useEffect(() => {
  const filled = renderFilledTemplate();
  setPseudocode(filled);
}, [pseudocodeBlanks, renderFilledTemplate]);

  /* ================= FLOWCHART FUNCTIONS ================= */
  const addCondition = () => {
    if (isSubmitted || conditions.length >= 5) return;
    const newConditions = [...conditions, { condition: "", yes: "", no: "" }];
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

  const toggleElse = () => {
    if (isSubmitted || conditions.length === 0) return;
    setShowElse(prev => !prev);
    if (!showElse) {
      setElseInstruction("");
    }
  };

  const updateElseInstruction = (value) => {
    if (isSubmitted) return;
    setElseInstruction(value);
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
      Swal.fire("Error", "Gagal update task", "error");
    }
  };

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

  /* ================= LOAD FUNCTIONS ================= */
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
      setPerformanceScore(res.data.score || 100); // ✅ START 100%
    } catch (err) {
      console.error("Load performance error:", err);
      setPerformanceScore(100); // ✅ DEFAULT 100%
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
          <strong>Clue ${nextClueIndex + 1}</strong><br><br>
          <strong>Biaya:</strong> ${nextClue.cost} XP per anggota<br>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "💰 Bayar & Ambil",
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

const loadWorkspaceData = useCallback(async () => {
  try {
    const res = await api.get(`/discussion/room/${roomId}/workspace-data`);
    const data = res.data.data || {};

    console.log("🔥 FULL WORKSPACE:", {
      pseudocode: data.pseudocode?.substring(0, 50) + "...",
      flowchartConditions: data.flowchart?.conditions?.length || 0,
      flowchartRaw: data.flowchart ? "OK" : "NULL",
      debug: data.debug
    });

    // 🔥 FORCE LOAD PSEUDOCODE (IGNORE BLANKS LOGIC)
    if (data.pseudocode) {
      setPseudocode(data.pseudocode);
      console.log("✅ PSEUDO LOADED");
    }

    // 🔥 FORCE LOAD FLOWCHART - SELALU!
    if (data.flowchart) {
      console.log("🔥 LOADING FLOWCHART:", data.flowchart);
      setConditions(Array.isArray(data.flowchart.conditions) ? data.flowchart.conditions : []);
      setElseInstruction(data.flowchart.elseInstruction || "");
      setShowElse(!!data.flowchart.showElse);
      console.log(`✅ FLOWCHART LOADED: ${data.flowchart.conditions?.length || 0} conditions`);
    }

  } catch (err) {
    console.error("❌ LOAD WORKSPACE ERROR:", err);
  }
}, [roomId]);

// ✅ FIXED loadTasks
const loadTasks = async () => {
  try {
    const res = await api.get(`/discussion/room/${roomId}/tasks`);
    const taskMap = res.data.data || {};
    
    // ✅ INIT TASKMAP DULU
    const initMap = {1: false, 2: false, 3: false, 4: false, 5: false};
    Object.assign(initMap, taskMap);
    
    const dynamicTasks = [
      { id: 1, text: "Diskusikan permasalahan yang ada pada video sebelumnya", done: !!initMap[1] },
      { id: 2, text: "Lengkapi LKPD", done: !!initMap[2] },
      { id: 3, text: "Lengkapi Pseudocode", done: !!initMap[3] },
      { id: 4, text: "Buat Flowchart", done: !!initMap[4] },
      { id: 5, text: "Buat kode c", done: !!initMap[5] }
    ];
    setTasks(dynamicTasks);
  } catch (err) {
    console.error("loadTasks error:", err);
    // ✅ FALLBACK EMPTY
    setTasks([
      { id: 1, text: "Diskusikan permasalahan yang ada pada video sebelumnya", done: false },
      { id: 2, text: "Lengkapi LKPD", done: false },
      { id: 3, text: "Lengkapi Pseudocode", done: false },
      { id: 4, text: "Buat Flowchart", done: false },
      { id: 5, text: "Buat kode c", done: false }
    ]);
  }
};
  const loadMiniLesson = useCallback(async () => {
  try {
    const res = await api.get(`/discussion/mini-lesson/${materiId}`);
    setMiniLessonData(res.data.data);
    setMiniContent(res.data.data?.content || "Loading...");
  } catch (err) {
    console.error("Load mini lesson error:", err);
    setMiniContent("Mini lesson tidak ditemukan 😢");
  }
}, [materiId]);

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

  

const loadTemplateData = useCallback(async () => {
  try {
    console.log("🔄 Loading template MATERI:", materiId);
    const res = await api.get(`/discussion/template-dynamic/${materiId}`); // ✅ DYNAMIC!
    
    console.log("✅ Template data:", {
      materiId: res.data.data.materiId,
      totalBlanks: res.data.data.totalBlanks,
      templatePreview: res.data.data.template.substring(0, 100) + "..."
    });
    
    setTemplateData(res.data.data);
    // ✅ INIT BLANKS sesuai jumlah dynamic
    setPseudocodeBlanks(Array(res.data.data.blanks?.length || 5).fill(""));
    
  } catch (err) {
    console.error("❌ Template load failed:", err);
    // Fallback tetap jalan dari API
  }
}, [materiId]);

  /* ================= SAVE FUNCTIONS ================= */
// Update savePseudocode
// ✅ CORRECT - Kirim template + blanks
// ✅ FULL FIXED savePseudocode
const savePseudocode = async () => {
  if (!pseudocode?.trim()) return Swal.fire("⚠️", "Isi pseudocode!", "warning");
  
  try {
    const res = await api.post(`/discussion/room/${roomId}/pseudocode`, { 
      template: templateData.template,
      answers: pseudocodeBlanks
    });
    
    Swal.fire({
      title: "✅ Saved!",
      text: res.data.message,
      icon: "success",
      timer: 2000
    });
    
    loadPerformance();
    
    // 🔥 MARK AS SAVED & FORCE UPDATE
    setPseudocodeSaved(true);
    setPseudocode(renderFilledTemplate()); // Pastikan pseudocode fresh
    
    console.log("✅ Pseudocode SAVED & MARKED");
    
  } catch (err) {
    Swal.fire("❌", err.response?.data?.message || "Gagal", "error");
  }
};

const saveFlowchart = async () => {
  if (conditions.length === 0) {
    return Swal.fire("⚠️", "Tambahkan minimal 1 kondisi!", "warning");
  }

  // 🔥 BUILD FULL FLOWCHART DATA
  const flowchartData = {
    conditions: conditions.map((cond, index) => ({
      condition: cond.condition?.trim() || '',
      yes: cond.yes?.trim() || '',
      no: cond.no?.trim() || ''
    })).filter(cond => cond.condition.length > 0), // Hapus kosong
    elseInstruction: elseInstruction?.trim() || '',
    showElse: showElse
  };

  // 🔥 VALIDASI FINAL
  if (flowchartData.conditions.length === 0) {
    return Swal.fire("⚠️", "Semua kondisi kosong!", "warning");
  }

  console.log("🚀 FLOWCHART TO SAVE:", JSON.stringify(flowchartData, null, 2));

  try {
    const res = await api.post(`/discussion/room/${roomId}/flowchart`, {
      flowchart: flowchartData
    });

    console.log("✅ SAVE SUCCESS:", res.data);
    
    Swal.fire({
      title: "✅ Flowchart Tersimpan!",
      html: `
        <div style="text-align: center;">
          <strong>${flowchartData.conditions.length} Kondisi</strong><br>
          <small>${res.data.data?.preservedPseudocode ? '✅ Pseudocode aman' : '⚠️ Pseudocode hilang'}</small>
        </div>
      `,
      icon: "success",
      timer: 2500,
      showConfirmButton: false
    });

    loadPerformance();
    loadWorkspaceData(); // Reload untuk sync

  } catch (err) {
    console.error("❌ SAVE ERROR:", err.response?.data);
    Swal.fire({
      title: "❌ Gagal Simpan",
      text: err.response?.data?.error || "Coba lagi",
      icon: "error"
    });
  }
};

// 🔥 DEBUG FUNCTION - TAMBAH INI
const debugFlowchart = async () => {
  try {
    const res = await api.post(`/discussion/room/${roomId}/validate`);
    console.log("🔍 FULL VALIDATION RESULT:", res.data);
    
    Swal.fire({
      title: "🔍 Debug Flowchart",
      html: `
        <div style="font-family: monospace; font-size: 12px;">
          <strong>Score:</strong> ${res.data.score}%<br><br>
          
          <strong>Pseudocode:</strong> ${res.data.details.pseudocodeSimilarity}%<br>
          <strong>Flowchart:</strong> ${res.data.details.flowchartScore}%<br><br>
          
          <strong>Details:</strong>
          <pre style="max-height: 200px; overflow: auto; background: #f8fafc; padding: 10px; border-radius: 8px;">
${JSON.stringify(res.data.details, null, 2)}
          </pre>
          
          <strong>Current Flowchart:</strong>
          <pre style="max-height: 150px; overflow: auto;">
${JSON.stringify({ conditions, elseInstruction, showElse }, null, 2)}
          </pre>
        </div>
      `,
      width: "700px",
      icon: "info"
    });
  } catch (err) {
    console.error("Debug error:", err.response?.data);
    Swal.fire("Debug Error", JSON.stringify(err.response?.data, null, 2), "error");
  }
};

// 🔥 TAMBAHKAN useEffect INI (SETELAH semua fungsi load)
useEffect(() => {
  const initData = async () => {
    console.log("🚀 Loading all data...");
    
    await loadTemplateData(); // Template dulu
    
    // Parallel load lainnya
    await Promise.all([
      loadTasks(),
      loadClues(),
      loadMiniLesson(),
      loadSubmissionStatus(),
      loadPerformance(),
      loadTimerStatus()
    ]);
    
    // Workspace TERAKHIR & SELECTIVE
    await loadWorkspaceData();
    
    console.log("✅ All data loaded!");
  };
  
  initData();
}, [roomId, materiId, loadTemplateData]); // ✅ Clean dependencies
  



  /* ================= FLOWCHART BUILDER - FULL VERSION WITH ELSE ================= */
  /* ================= FLOWCHART BUILDER - CLEAN & FIXED ELSE ================= */
const renderFlowchart = () => {
  // 🔥 GRID SYSTEM (KUNCI UTAMA BIAR RAPI)
  const centerX = 500;
  const leftX = 280;
  const rightX = 780;
  const endX = 780;

  const conditionHeight = 180;
  const elseHeight = showElse ? 200 : 0;
  const totalHeight = 300 + (conditions.length * conditionHeight) + elseHeight;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 1200 ${totalHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 z" fill="#374151" />
        </marker>

        <linearGradient id="startGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>

        <linearGradient id="yesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5"/>
          <stop offset="100%" stopColor="#a7f3d0"/>
        </linearGradient>

        <linearGradient id="noGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fee2e2"/>
          <stop offset="100%" stopColor="#fecaca"/>
        </linearGradient>
      </defs>

      {/* START */}
      <ellipse cx={centerX} cy="80" rx="85" ry="45"
        fill="url(#startGrad)" stroke="#059669" strokeWidth="4" />
      <text x={centerX} y="88" textAnchor="middle"
        fontWeight="bold" fontSize="20" fill="white">
        🟢 MULAI
      </text>

      {/* CONDITIONS */}
      {conditions.map((item, index) => {
        const startY = 200 + (index * conditionHeight);
        const prevEndY = index === 0 ? 125 : (200 + ((index - 1) * conditionHeight) + 180);

        return (
          <g key={index}>
            {/* LINE FROM PREV */}
            <line
              x1={centerX}
              y1={prevEndY}
              x2={centerX}
              y2={startY - 70}
              stroke="#374151"
              strokeWidth="4"
              markerEnd="url(#arrow)"
            />

            {/* DIAMOND */}
            <polygon
              points={`${centerX},${startY-70} ${centerX+105},${startY} ${centerX},${startY+70} ${centerX-105},${startY}`}
              fill="#dbeafe"
              stroke="#3b82f6"
              strokeWidth="5"
            />

            <text x={centerX} y={startY+5} textAnchor="middle"
              fontWeight="bold" fontSize="14" fill="#1e40af">
              IF ?
            </text>

            <foreignObject x={centerX-85} y={startY-25} width="170" height="50">
              <input
                value={item.condition}
                onChange={(e) => updateCondition(index, "condition", e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "3px solid #3b82f6",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
                disabled={isSubmitted}
              />
            </foreignObject>

            {/* YES */}
            <text x={centerX + 140} y={startY-5}
              fontWeight="bold" fill="#059669">YA</text>

            <line
              x1={centerX + 105}
              y1={startY}
              x2={rightX}
              y2={startY}
              stroke="#059669"
              strokeWidth="4"
              markerEnd="url(#arrow)"
            />

            <rect
              x={rightX}
              y={startY-50}
              width="200"
              height="100"
              rx="15"
              fill="url(#yesGrad)"
              stroke="#10b981"
              strokeWidth="4"
            />

            <foreignObject x={rightX+10} y={startY-20} width="180" height="60">
              <input
                value={item.yes}
                onChange={(e) => updateCondition(index, "yes", e.target.value)}
                style={{ width: "100%", height: "100%", border: "none" }}
                disabled={isSubmitted}
              />
            </foreignObject>

            {/* YES → END */}
            <line
              x1={rightX + 100}
              y1={startY + 50}
              x2={endX}
              y2={totalHeight - 80}
              stroke="#059669"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />

            {/* NO LABEL */}
            <text x={centerX - 30} y={startY + 90}
              fontWeight="bold" fill="#dc2626">
              TIDAK
            </text>
          </g>
        );
      })}

      {/* ELSE */}
      {conditions.length > 0 && showElse && (() => {
        const lastY = 200 + ((conditions.length - 1) * conditionHeight) + 70;
        const elseY = 200 + (conditions.length * conditionHeight);

        return (
          <g>
            {/* turun */}
            <line
              x1={centerX - 105}
              y1={lastY}
              x2={leftX}
              y2={elseY}
              stroke="#dc2626"
              strokeWidth="4"
              markerEnd="url(#arrow)"
            />

            {/* box */}
            <rect
              x={leftX - 120}
              y={elseY}
              width="240"
              height="110"
              rx="15"
              fill="url(#noGrad)"
              stroke="#dc2626"
              strokeWidth="4"
            />

            <text x={leftX} y={elseY + 25}
              textAnchor="middle"
              fontWeight="bold"
              fill="#dc2626">
              ELSE
            </text>

            <foreignObject x={leftX - 110} y={elseY + 40} width="220" height="60">
              <input
                value={elseInstruction}
                onChange={(e) => updateElseInstruction(e.target.value)}
                style={{ width: "100%", height: "100%", border: "none" }}
                disabled={isSubmitted}
              />
            </foreignObject>

            {/* ke END */}
            <line
              x1={leftX}
              y1={elseY + 110}
              x2={endX}
              y2={totalHeight - 80}
              stroke="#dc2626"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
          </g>
        );
      })()}

      {/* END */}
      <ellipse
        cx={endX}
        cy={totalHeight - 60}
        rx="85"
        ry="45"
        fill="url(#startGrad)"
        stroke="#059669"
        strokeWidth="4"
      />
      <text
        x={endX}
        y={totalHeight - 52}
        textAnchor="middle"
        fontWeight="bold"
        fontSize="20"
        fill="white"
      >
        SELESAI
      </text>
    </svg>
  );
};

  /* ================= VALIDATE ================= */
  /* ================= VALIDATE BEFORE UPLOAD - FULL VERSION ================= */
const validateBeforeUpload = async () => {
  if (isValidating) return; // Prevent double click
  
  setIsValidating(true);
  try {
    console.log("🔍 Starting validation...");
    
    const res = await api.post(`/discussion/room/${roomId}/validate`);
    setValidationResult(res.data);
    
    console.log("✅ VALIDATION RESULT:", res.data);
    
    const { valid, score, details } = res.data;
    
    // 🔥 SUCCESS (75%+) - DIRECT UPLOAD
    if (valid && score >= 75) {
      Swal.fire({
        title: "🎉 JAWABAN BENAR!",
        html: `
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 15px;">🥇 ${score}%</div>
            <div style="color: #059669; font-size: 16px; font-weight: 700;">
              ✅ Pseudocode: ${details.pseudocode.match ? 'BENAR' : '⚠️'}
            </div>
            <div style="color: #059669; font-size: 16px; font-weight: 700;">
              ✅ Flowchart: ${details.flowchart.match ? 'BENAR' : '⚠️'}
            </div>
            <hr style="margin: 20px 0;"/>
            <div style="background: #d1fae5; padding: 15px; border-radius: 12px; border-left: 5px solid #10b981;">
              <strong>🚀 Siap Upload C Code!</strong>
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "🚀 UPLOAD C CODE SEKARANG",
        confirmButtonColor: "#10b981",
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`);
        }
      });
    }
    
    // 🔥 WARNING (50-74%) - BERI SARAN
    else if (score >= 50) {
      Swal.fire({
        title: "⚠️ Hampir Jadi!",
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 28px; font-weight: 800; color: #f59e0b;">
                ${score}%
              </span>
              <div style="font-size: 14px; color: #6b7280;">Target: 75%+</div>
            </div>

            <hr/>

            <div style="margin-bottom: 15px;">
              <strong>📝 Pseudocode:</strong> 
              <span style="color: ${details.pseudocode.match ? '#10b981' : '#f59e0b'}; font-weight: 700;">
                ${details.pseudocode.match ? '✅ BENAR' : '⚠️ Perbaiki'}
              </span><br/>
              <small style="color: ${details.pseudocode.match ? '#059669' : '#d97706'}">
                ${details.pseudocode.feedback}
              </small>
            </div>

            <div style="margin-bottom: 15px;">
              <strong>🔄 Flowchart:</strong> 
              <span style="color: ${details.flowchart.match ? '#10b981' : '#f59e0b'}; font-weight: 700;">
                ${details.flowchart.match ? '✅ BENAR' : '⚠️ Perbaiki'}
              </span><br/>
              <small style="color: ${details.flowchart.match ? '#059669' : '#d97706'}">
                ${details.flowchart.feedback}
              </small>
            </div>

            <hr/>

            <div style="padding: 15px; background: #fef3c7; border-radius: 10px; border-left: 5px solid #f59e0b; margin-top: 10px;">
              <strong>💡 Tips Cepat:</strong><br/>
              - Cek <strong>keyword</strong>: deklarasi, read, IF, write, ENDIF<br/>
              - Kondisi: <code>> 0</code> atau <code>>= 70</code><br/>
              - Flowchart minimal <strong>1 kondisi</strong>
            </div>
          </div>
        `,
        icon: "warning",
        confirmButtonText: "🔄 Perbaiki Lagi",
        confirmButtonColor: "#3b82f6",
        width: "650px"
      });
    }
    
    // 🔥 LOW SCORE (<50%) - MOTIVASI + BASIC GUIDE
    else {
      Swal.fire({
        title: "📚 Mulai dari Dasar",
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 28px; font-weight: 800; color: #ef4444;">
                ${score}%
              </span>
              <div style="font-size: 14px; color: #6b7280;">Target: 75%+</div>
            </div>

            <div style="padding: 15px; background: #fef2f2; border-radius: 10px; border-left: 5px solid #f87171; margin-bottom: 15px;">
              <strong>🚨 Struktur Belum Lengkap</strong><br/>
              Pastikan ada:
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>DEKLARASI + nama variabel</li>
                <li>ALGORITMA</li>
                <li>read(variabel)</li>
                <li>IF (kondisi) THEN</li>
                <li>write("pesan")</li>
                <li>ENDIF</li>
              </ul>
            </div>

            <div style="padding: 15px; background: #ecfdf5; border-radius: 10px; border-left: 5px solid #10b981;">
              <strong>✅ Contoh Sederhana (Materi 1):</strong>
              <pre style="margin: 8px 0; font-size: 12px; background: #f0fdf4; padding: 10px; border-radius: 6px;">
DEKLARASI
    angka : integer

ALGORITMA
    read(angka)
    IF (angka > 0) THEN
        write("Angka ", angka, " adalah Positif")
    ENDIF
END
              </pre>
            </div>

            <div style="margin-top: 15px; text-align: center;">
              <strong>💪 Satu per satu ya! Kamu bisa! 🔥</strong>
            </div>
          </div>
        `,
        icon: "info",
        confirmButtonText: "✅ Paham, Mulai Lagi",
        confirmButtonColor: "#10b981",
        width: "700px"
      });
    }
    
  } catch (err) {
    console.error("❌ Validation error:", err);
    Swal.fire({
      title: "❌ Error",
      text: "Validasi gagal, coba lagi ya!",
      icon: "error"
    });
  } finally {
    setIsValidating(false);
  }
};

  /* ================= MODALS ================= */
  const CompilerGuideModal = () => {
    if (!showCompilerGuide) return null;
    
    Swal.fire({
      title: "💻 C Compiler Guide",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <ol style="line-height: 1.8;">
            <li><strong>Buat</strong> pseudocode & flowchart logic</li>
            <li><strong>Convert ke C code</strong></li>
            <li><strong>Test</strong> di <a href="https://www.onlinegdb.com/" target="_blank" style="color: #3b82f6;">OnlineGDB</a></li>
            <li><strong>Download/Salin</strong> kode c lalu Upload!</li>
          </ol>
        </div>
      `,
      icon: "info",
      confirmButtonText: "✅ Paham!",
      width: "700px"
    }).then(() => setShowCompilerGuide(false));
    return null;
  };

  const RulesPopup = () => {
    if (!showRules) return null;

    return Swal.fire({
      title: "📜 ROOM RULES",
      html: `
        <div style="text-align: left; font-size: 15px; line-height: 1.7;">
          <h4>🎯 Tujuan:</h4>
          <ul>
            <li>Selesaikan <strong>5 Quest</strong> secara berurutan</li>
            <li>Target: <strong>90%+ score</strong> untuk 🥇 MASTER</li>
          </ul>
          
          <h4>⏰ Timer: <strong>${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}</strong></h4>
          <ul><li>60 menit total</li><li>Overtime = penalty XP</li></ul>
          
          <h4>🧩 Clue: Max 3 (-10% score/clue)</h4>
          <h4>⚠️ Attempt: Max 10x pseudocode + 10x flowchart</h4>
        </div>
      `,
      icon: "info",
      confirmButtonText: "🚀 MULAI QUEST!",
      confirmButtonColor: "#10b981",
      width: "650px"
    }).then(() => setShowRules(false));
  };

  /* ================= MAIN RENDER ================= */
  return (
    <Layout>
      <Wrapper>
        {/* TIMER */}
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
               isSubmitted ? "🎉 CERTIFIED!" : "CEK JAWABAN & UPLOAD CODE"}
            </ProveMasteryButton>
            <DebugButton onClick={debugFlowchart}>
  🔍 DEBUG VALIDATION
</DebugButton>
<DebugButton onClick={async () => {
  console.log("🔥 MANUAL LOAD!");
  await loadWorkspaceData();
  console.log("Conditions state:", conditions);
  console.log("Else:", elseInstruction, showElse);
}}>
  🔍 FORCE LOAD WORKSPACE
</DebugButton>
          </LeftPanel>

          {/* RIGHT PANEL */}
          <RightPanel>
            <PseudocodeCard>
  <CardTitle>📝 Fill-in-Blank Pseudocode</CardTitle>
  
  {/* LOADING STATE */}
  {!templateData.template ? (
    <TemplatePreview>
      <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
        🔄 Loading template...
      </div>
    </TemplatePreview>
  ) : (
    <>
      <TemplatePreview>
        <pre>{renderFilledTemplate()}</pre>
      </TemplatePreview>
      
      <BlanksContainer>
        {templateData.blanks?.map((blank, index) => (
          <BlankRow key={index}>
            <BlankLabel>
              📝 Blank {index + 1}: 
            </BlankLabel>
            <InputGroup>
              <BlankInput
                value={pseudocodeBlanks[index] || ""}
                onChange={(e) => updateBlank(index, e.target.value)}
                placeholder={`isi disini || 'isi jawaban'}`}
              />
              <HintButton 
                onClick={() => Swal.fire(`💡 Blank ${index + 1}`, blank.hint, "info")}
              >
                ❓
              </HintButton>
            </InputGroup>
          </BlankRow>
        ))}
      </BlanksContainer>

      <SaveButton onClick={savePseudocode} disabled={isSubmitted || !pseudocode.trim()}>
        💾 Save Pseudocode ({pseudocodeBlanks.filter(b => b.trim()).length}/{templateData.blanks?.length || 5} blanks filled)
      </SaveButton>
    </>
  )}
</PseudocodeCard>

            <FlowchartCard>
              <CardTitle>🔄 Flowchart Builder</CardTitle>
              <FlowchartContainer>
                {renderFlowchart()}
              </FlowchartContainer>
              <FlowchartButtons>
                <FlowBtn onClick={addCondition} disabled={isSubmitted || conditions.length >= 5}>
                  ➕ Add IF ({conditions.length}/5)
                </FlowBtn>
                <FlowBtn onClick={toggleElse} disabled={isSubmitted || conditions.length === 0}>
                  {showElse ? "❌ Remove ELSE" : "➕ Add ELSE"}
                </FlowBtn>
                <FlowBtn onClick={saveFlowchart} disabled={isSubmitted || conditions.length === 0}>
                                    💾 Save Flowchart
                </FlowBtn>
              </FlowchartButtons>
            </FlowchartCard>
          </RightPanel>
        </Container>
      </Wrapper>

      {/* MODALS */}
      <MiniLessonModal 
  show={showMini} 
  onClose={() => setShowMini(false)} 
  content={miniLessonData?.content || miniContent}
  title={miniLessonData?.title || "Mini Lesson"}
/>
      <CompilerGuideModal />
      <RulesPopup />
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

/* ================= STYLED COMPONENTS ================= */
const TimerBox = styled.div`
  position: fixed; top: 20px; right: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white; padding: 15px 25px; border-radius: 25px;
  box-shadow: 0 10px 30px rgba(239,68,68,0.4);
  z-index: 1000; font-weight: 800; font-size: 18px;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const TimerEmoji = styled.span`font-size: 24px; margin-right: 8px;`;
const TimerText = styled.span``;

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

const PerformanceBox = styled.div`
  width: 97%; padding: 15px 20px; border-radius: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; gap: 20px;
  box-shadow: 0 10px 30px rgba(102,126,234,0.4);
`;

const Emoji = styled.div`font-size: 32px;`;
const Level = styled.div`font-size: 18px; font-weight: 800; color: #25233b; text-transform: uppercase;`;
const Score = styled.div`font-size: 32px; font-weight: 900; color: #25233b;`;
const ProgressBar = styled.div`flex: 1; height: 10px; background: rgba(255,255,255,0.3); border-radius: 10px; overflow: hidden; margin-left: 20px;`;
const ProgressFill = styled.div`height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; border-radius: 10px;`;

const Container = styled.div`display: grid; grid-template-columns: 420px 1fr; gap: 40px;`;
const LeftPanel = styled.div`display: flex; flex-direction: column; gap: 30px;`;
const RightPanel = styled.div`display: flex; flex-direction: column; gap: 30px;`;

const CardTitle = styled.h4`margin: 0 0 20px 0; color: #1e293b; font-weight: 800; font-size: 22px;`;

const ClueCard = styled.div`background: linear-gradient(135deg, #e0e7ff, #c7d2fe); padding: 25px; border-radius: 20px; border: 3px solid #6366f1;`;
const ClueHeader = styled.div`font-size: 18px; font-weight: 700; margin-bottom: 20px; text-align: center;`;
const ClueStatus = styled.div`margin-bottom: 20px; text-align: center;`;
const ClueButton = styled.button`width: 100%; padding: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(139,92,246,0.4); }`;
const ClueMaxed = styled.div`padding: 12px; background: #fee2e2; color: #dc2626; border-radius: 12px; font-weight: 600; text-align: center;`;
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
const TemplatePreview = styled.div`background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px dashed #bfdbfe; max-height: 250px; overflow: auto; pre {margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; font-family: 'Courier New', monospace; }`;
const BlanksContainer = styled.div`display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;`;
const BlankRow = styled.div``;
const BlankLabel = styled.div`margin-bottom: 8px; color: #374151; font-weight: 600; font-size: 14px;`;
const InputGroup = styled.div`display: flex; gap: 12px; align-items: center;`;
const BlankInput = styled.input`flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 14px; transition: all 0.3s; &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }`;
const HintButton = styled.button`background: #f59e0b; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 18px; cursor: pointer; transition: all 0.3s; &:hover { background: #d97706; transform: scale(1.1); }`;
const SaveButton = styled.button`width: 100%; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 15px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 15px; transition: all 0.3s; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.4); } &:disabled { background: #6b7280; cursor: not-allowed; }`;

const FlowchartCard = styled.div`background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 20px; border: 3px solid #f59e0b;`;
const FlowchartContainer = styled.div`
  height: 550px;
  border: 4px solid #f59e0b;
  border-radius: 20px;
  overflow: hidden; /* tetap */
  background: #fefce8;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const FlowchartButtons = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;
const FlowBtn = styled.button`flex: 1; padding: 14px 20px; border: none; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; min-width: 140px; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.4); } &:disabled { background: #d1d5db; cursor: not-allowed; opacity: 0.6; }`;
const DebugButton = styled.button`
  background: #ef4444; color: white; border: none;
  padding: 15px; border-radius: 15px; font-weight: 700;
  cursor: pointer; margin-top: 10px;
  &:hover { background: #dc2626; transform: translateY(-2px); }
`;
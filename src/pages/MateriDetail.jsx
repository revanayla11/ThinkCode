import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import api from "../api/axiosClient";
import MiniLessonModal from "../components/MiniLessonModal";
import Layout from "../components/Layout";

export default function MateriDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // States
  const [data, setData] = useState(null);
  const [showMini, setShowMini] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [materiXp, setMateriXp] = useState(0);
  const [userXp, setUserXp] = useState(0);
  const [videoDone, setVideoDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestMinimized, setIsQuestMinimized] = useState(false);
  const [miniContent, setMiniContent] = useState("");

  // 🆕 QUEST STEPS - 2 QUEST
  const questSteps = [
    { key: "watch_video", label: "🎬 Tonton Video Sampai Akhir", xp: 20, icon: "🎥", unlocked: true },
    { key: "open_mini_lesson", label: "📚 Buka Mini Lesson", xp: 25, icon: "📖", unlocked: true }
  ];

  // 🔥 LOAD DATA - Fix XP & Mini Content
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/materi/${id}`);
        const d = res.data?.data;
        
        if (d) {
          setData(d);
          
          // Parse completed steps
          const rawSteps = d.progress?.completedSections || [];
          const parsedSteps = Array.isArray(rawSteps) 
            ? rawSteps.map(s => s?.toString?.()?.trim()).filter(Boolean)
            : typeof rawSteps === 'string' 
              ? JSON.parse(rawSteps || "[]").map(s => s?.toString?.()?.trim()).filter(Boolean)
              : [];
          
          setCompletedSteps(parsedSteps);
          setMateriXp(d.progress?.materiXP || d.progress?.xp || 0);
          setUserXp(d.progress?.userXP || d.progress?.totalXP || 0); // ✅ XP AWAL
          setVideoDone(parsedSteps.includes("watch_video"));
          
          // Preload mini content
          setMiniContent(d.miniLesson?.content || "");
        }
      } catch (err) {
        console.error("Error loading materi:", err);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat",
          text: "Coba refresh halaman",
          timer: 2000,
          toast: true,
          position: "top-end"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ COMPLETE STEP - Fix deps & logic
  const completeStep = useCallback(async (stepKey) => {
    if (completedSteps.includes(stepKey) || isLoading) return;

    try {
      setIsLoading(true);
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      
      // Update states IMMEDIATE
      setCompletedSteps(res.data.data?.completedSteps || []);
      setMateriXp(res.data.data?.materiXP || 0);
      setUserXp(res.data.data?.userXP || 0);
      
      if (res.data.data?.xpGain > 0) {
        Swal.fire({
          icon: "success",
          title: `${questSteps.find(s => s.key === stepKey)?.icon} Level Up!`,
          text: `+${res.data.data.xpGain} XP\nTotal: ${res.data.data.userXP?.toLocaleString()} XP`,
          timer: 2500,
          toast: true,
          position: "top-end",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "white"
        });
      }
    } catch (err) {
      console.error("Complete step error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, completedSteps.length, isLoading, userXp]);

  // Video handlers - AUTO COMPLETE 85%
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleProgress = () => {
      if (!videoDone && video.duration > 0) {
        const progress = video.currentTime / video.duration;
        if (progress >= 0.85 && !completedSteps.includes("watch_video")) {
          completeStep("watch_video");
          setVideoDone(true);
        }
      }
    };

    const handleEnd = () => {
      if (!completedSteps.includes("watch_video")) {
        completeStep("watch_video");
        setVideoDone(true);
      }
    };

    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('ended', handleEnd);

    return () => {
      video.removeEventListener('timeupdate', handleProgress);
      video.removeEventListener('ended', handleEnd);
    };
  }, [videoDone, completedSteps, completeStep]);

  const handleOpenMini = () => {
    if (!completedSteps.includes("open_mini_lesson")) {
      completeStep("open_mini_lesson");
    }
    setShowMini(true);
  };

  const toggleQuestPanel = () => setIsQuestMinimized(!isQuestMinimized);

  if (isLoading) {
    return (
      <Layout>
        <LoadingScreen>
          <div>⚡ Memuat...</div>
        </LoadingScreen>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          Materi tidak ditemukan
        </div>
      </Layout>
    );
  }

  const progressCount = completedSteps.length;
  const allQuestsComplete = progressCount === 2;

  return (
    <Layout>
      <GameContainer>
        {/* XP Tracker - NO BIRU */}
        <XPTracker>
          <div>⚡ {userXp.toLocaleString()} XP</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            📚 {materiXp.toLocaleString()} Materi XP
          </div>
        </XPTracker>

        <ContentArea>
          <GameHeader>
            <GameTitle>{data.materi?.title}</GameTitle>
            <BackButton onClick={() => navigate(-1)}>
              ← Kembali
            </BackButton>
          </GameHeader>

          <VideoHero>
            {data.videoSection?.content ? (
              data.videoSection.content.includes("youtube") || data.videoSection.content.includes("youtu.be") ? (
                <iframe
                  src={data.videoSection.content}
                  title="Video"
                  allowFullScreen
                  style={{ borderRadius: '24px', width: '100%', height: '100%' }}
                />
              ) : (
                <StyledVideo
                  ref={videoRef}
                  src={data.videoSection.content}
                  controls
                  preload="metadata"
                  videoDone={videoDone}
                />
              )
            ) : (
              <VideoPlaceholder>Video belum tersedia!</VideoPlaceholder>
            )}
            
            <MiniLessonButton 
              onClick={handleOpenMini}
              disabled={isLoading}
            >
              {completedSteps.includes("open_mini_lesson") ? "✅" : "📖"} Mini Lesson
            </MiniLessonButton>
          </VideoHero>

{/* DISCUSSION BUTTON - UNLOCK SETELAH 2 QUEST */}
<DiscussionSection>
  {allQuestsComplete ? (
    <Link to={`/materi/${id}/discussion`} style={{ textDecoration: 'none' }}>
      <DiscussionButton>
        🚪 Masuk Diskusi Room
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
          +35 XP Bonus!
        </div>
      </DiscussionButton>
    </Link>
  ) : (
    <LockedDiscussion>
      🔒 Selesaikan 2 Quest dulu!
      <ProgressBar>
        <ProgressFill style={{ width: `${(progressCount / 2) * 100}%` }} />
        <ProgressText>{progressCount}/2</ProgressText>
      </ProgressBar>
    </LockedDiscussion>
  )}
</DiscussionSection>


          {/* ✅ SUCCESS BANNER */}
          {allQuestsComplete && (
            <SuccessBanner>
              🎉 <strong>Semua Quest Selesai!</strong>
              <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                Total: {materiXp.toLocaleString()} Materi XP ✨
              </div>
            </SuccessBanner>
          )}
        </ContentArea>

        {/* Quest Panel */}
        <QuestPanel isMinimized={isQuestMinimized}>
          <QuestHeader onClick={toggleQuestPanel}>
            <QuestIcon>🎮</QuestIcon>
            <span>QUESTS</span>
            {!isQuestMinimized && <MinimizeButton onClick={toggleQuestPanel}>−</MinimizeButton>}
          </QuestHeader>

          {!isQuestMinimized && (
            <>
              <XPBar>Progress: <strong>{progressCount}/2</strong></XPBar>
              <QuestList>
                {questSteps.map((step, index) => (
                  <QuestItem 
                    key={step.key}
                    completed={completedSteps.includes(step.key)}
                  >
                    <QuestNumber completed={completedSteps.includes(step.key)}>
                      {completedSteps.includes(step.key) ? "✅" : index + 1}
                    </QuestNumber>
                    <QuestContent>
                      <QuestTitle>{step.icon} {step.label}</QuestTitle>
                      <QuestReward>+{step.xp} XP</QuestReward>
                    </QuestContent>
                  </QuestItem>
                ))}
              </QuestList>
            </>
          )}
        </QuestPanel>

        {showMini && (
          <MiniLessonModal
            show={showMini}
            onClose={() => setShowMini(false)}
            content={miniContent} // ✅ Preloaded content - NO LOADING
          />
        )}
      </GameContainer>
    </Layout>
  );
}

/* ================= STYLES - NO BIRU, CLEAN ================= */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const GameContainer = styled.div`
  position: relative;
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #60a5fa;
  font-weight: 600;
`;

const XPTracker = styled.div`
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(15,23,42,0.95);
  backdrop-filter: blur(20px);
  padding: 16px 24px;
  border-radius: 20px;
  color: white;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  z-index: 1001;
  border: 1px solid rgba(255,255,255,0.1);
`;

const DiscussionSection = styled.div`
  max-width: 600px;
  margin: 40px auto 0;
`;

const DiscussionButton = styled.button`
  width: 100%;
  padding: 28px 40px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 20px 50px rgba(59,130,246,0.4);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 60px rgba(59,130,246,0.6);
  }
`;

const LockedDiscussion = styled.div`
  text-align: center;
  padding: 40px 30px;
  background: rgba(15,23,42,0.6);
  border-radius: 24px;
  border: 2px solid rgba(107,114,128,0.3);
  color: #94a3b8;
  font-size: 18px;
  font-weight: 700;
`;

const ProgressBar = styled.div`
  position: relative;
  height: 10px;
  width: 200px;
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
  margin: 20px auto 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 5px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
`;

const ContentArea = styled.div`
  max-width: 900px;
  margin: 0 auto 200px auto;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
  animation: ${slideIn} 0.8s ease-out;
`;

const GameTitle = styled.h1`
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const BackButton = styled.button`
  background: rgba(107,114,128,0.3);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(107,114,128,0.5);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  }
`;

const VideoHero = styled.div`
  position: relative;
  width: 100%;
  height: 520px;
  background: #000;
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 60px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 28px;
  
  ${({ videoDone }) => videoDone && `
    border: 4px solid #22c55e;
    box-shadow: 0 0 30px rgba(34,197,94,0.5);
  `}
`;

const VideoPlaceholder = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 20px;
  font-weight: 600;
`;

const MiniLessonButton = styled.button`
  position: absolute;
  left: 30px;
  bottom: 30px;
  padding: 16px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ec4899, #db2777);
  border: none;
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(236,72,153,0.4);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 45px rgba(236,72,153,0.6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessBanner = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 32px 40px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 24px;
  color: white;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 20px 50px rgba(34,197,94,0.4);
  animation: ${slideIn} 0.8s ease-out;
`;

const QuestPanel = styled.div`
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  background: rgba(15,23,42,0.95);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ isMinimized }) => isMinimized && `
    width: 90px;
    height: 90px;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `}
`;

const QuestHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #60a5fa;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 12px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);

  &:hover { color: #93c5fd; }
`;

const QuestIcon = styled.div` font-size: 24px; margin-right: 12px; `;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s;

  &:hover {
    background: rgba(239,68,68,0.2);
    transform: scale(1.2);
  }
`;

const XPBar = styled.div`
  padding: 16px 20px;
  background: rgba(34,197,94,0.2);
  border-radius: 16px;
  color: #22c55e;
  font-weight: 800;
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
  border: 1px solid rgba(34,197,94,0.3);
`;

const QuestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: ${({ completed }) => 
    completed ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.15)'
  };
  border-radius: 16px;
  border-left: 4px solid ${({ completed }) => 
    completed ? '#22c55e' : '#6366f1'
  };
  transition: all 0.3s;
`;

const QuestNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  background: ${({ completed }) => 
    completed ? '#22c55e' : 'rgba(255,255,255,0.15)'
  };
  color: ${({ completed }) => completed ? 'white' : '#94a3b8'};
  border: 2px solid ${({ completed }) => 
    completed ? '#22c55e' : 'rgba(255,255,255,0.2)'
  };
`;

const QuestContent = styled.div`
  flex: 1;
`;

const QuestTitle = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const QuestReward = styled.div`
  font-size: 12px;
  color: #93c5fd;
  font-weight: 800;
`;
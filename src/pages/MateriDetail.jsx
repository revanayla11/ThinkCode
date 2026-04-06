import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components"; 
import Swal from "sweetalert2";
import api from "../api/axiosClient";
import MiniLessonModal from "../components/MiniLessonModal";
import Layout from "../components/Layout";

export default function MateriDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showMini, setShowMini] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false); // 🆕 Side panel
  const [completedSteps, setCompletedSteps] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/materi/${id}`)
      .then(res => {
        setData(res.data?.data || null);
      })
      .catch(err => console.error(err));
  }, [id]);

  // 🆕 Auto show task panel
  useEffect(() => {
    if (data) {
      // Delay biar smooth
      const timer = setTimeout(() => setShowTaskPanel(true), 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  useEffect(() => {
    if (data?.progress) {
      setCompletedSteps(data.progress.completedSections || []);
      setXp(data.progress.xp || 0);
      setLevel(Math.floor((data.progress.xp || 0) / 100));
    }
  }, [data]);

  if (!data) {
    return <p style={{ padding: 30 }}>Memuat...</p>;
  }

  const videoSection = data.videoSection || data.sections?.find(s => s.type === "video" && s.content);

  // 🆕 Hanya 2 step awal
  const steps = [
    { key: "watch_video", label: "🎥 Tonton Video", reward: "+10 XP" },
    { key: "open_mini_lesson", label: "📘 Baca Mini Lesson", reward: "+15 XP" },
  ];

  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      
      setCompletedSteps(res.data.completedSteps);
      setXp(res.data.xp);
      setLevel(Math.floor(res.data.xp / 100));

      const xpMap = { watch_video: "🎥", open_mini_lesson: "📘" };
      const icon = xpMap[stepKey] || "⭐";
      
      Swal.fire({
        icon: "success",
        title: `+${res.data.xpGain || 10} XP ${icon}`,
        text: `${steps.find(s => s.key === stepKey).label} selesai!`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "linear-gradient(135deg, #d4edda, #c3e6cb)",
        color: "#155724"
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Coba lagi",
        timer: 2000,
        toast: true,
        position: "top-end"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => {
    completeStep("watch_video");
  };

  const handleOpenMini = () => {
    setShowMini(true);
    completeStep("open_mini_lesson");
  };

  const toggleTaskPanel = () => {
    setShowTaskPanel(!showTaskPanel);
  };

  const allStepsDone = completedSteps.length === steps.length;

  return (
    <Layout>
      <MainContainer>
        {/* MAIN CONTENT */}
        <ContentArea>
          <Header>
            <HeaderLeft>
              <Title>{data.materi?.title || data.materi?.title}</Title>
              <Breadcrumb>Orientasi Masalah</Breadcrumb>
            </HeaderLeft>
            <BackButton onClick={() => navigate(-1)}>
              ← Kembali
            </BackButton>
          </Header>

          {/* VIDEO */}
          <VideoWrapper>
            {videoSection ? (
              videoSection.content.includes("/uploads/") || videoSection.content.includes("http") ? (
                (() => {
                  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                  const videoSrc = videoSection.content.startsWith('http') 
                    ? videoSection.content 
                    : `${baseUrl}${videoSection.content}`;

                  return (
                    <video
                      src={videoSrc}
                      controls
                      preload="metadata"
                      onEnded={handleVideoEnd}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "16px",
                        background: "#000",
                        objectFit: "contain",
                      }}
                    />
                  );
                })()
              ) : (
                <iframe
                  title="video"
                  width="100%"
                  height="100%"
                  src={videoSection.content}
                  style={{ border: "none", borderRadius: "16px" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <VideoPlaceholder>Video belum tersedia</VideoPlaceholder>
            )}

            {/* 🆕 BUTTON I DIPINDAH KE KANAN BAWAH */}
            <InfoButton onClick={handleOpenMini} disabled={isLoading || completedSteps.includes("open_mini_lesson")}>
              📖
            </InfoButton>
          </VideoWrapper>

          {/* DISCUSSION BUTTON */}
          {allStepsDone && (
            <DiscussionButtonContainer>
              <Link to={`/materi/${id}/discussion`}>
                <DiscussionButton>
                  💬 Join Ruang Diskusi (Tersedia!)
                </DiscussionButton>
              </Link>
            </DiscussionButtonContainer>
          )}
        </ContentArea>

        {/* 🆕 GAMIFICATION SIDE PANEL */}
        <TaskPanel show={showTaskPanel}>
          <TaskHeader onClick={toggleTaskPanel}>
            <TaskIcon>🎮</TaskIcon>
            <span>MISI KERJA</span>
            <CloseIcon>×</CloseIcon>
          </TaskHeader>
          
          <TaskContent>
            <XPBar>
              ⭐ XP: <strong>{xp}</strong> | Level: <LevelBadge>Lv.{level}</LevelBadge>
            </XPBar>

            <ProgressBar>
              <ProgressFill progress={Math.round((completedSteps.length / steps.length) * 100)} />
            </ProgressBar>
            <ProgressText>
              {Math.round((completedSteps.length / steps.length) * 100)}% Selesai
            </ProgressText>

            <StepsList>
              {steps.map((step, index) => (
                <StepItem key={step.key} done={completedSteps.includes(step.key)} active={!completedSteps.includes(step.key) && completedSteps.length === index}>
                  <StepCircle done={completedSteps.includes(step.key)}>
                    {completedSteps.includes(step.key) ? "✔" : index + 1}
                  </StepCircle>
                  <StepContent>
                    <StepLabel>{step.label}</StepLabel>
                    <StepReward>{step.reward}</StepReward>
                  </StepContent>
                </StepItem>
              ))}
            </StepsList>

            {allStepsDone && (
              <CompleteBadge>
                🎉 Semua Misi Selesai!
              </CompleteBadge>
            )}
          </TaskContent>
        </TaskPanel>

        {/* MINI LESSON MODAL */}
        {showMini && (
          <MiniLessonModal
            show={showMini}
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Mini lesson tidak ditemukan."}
          />
        )}
      </MainContainer>
    </Layout>
  );
}

/* ================= ANIMATIONS ================= */
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

/* ================= STYLES ================= */
const MainContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const ContentArea = styled.div`
  flex: 1;
  max-width: 900px;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Breadcrumb = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(107, 114, 128, 0.4);
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #1f2937, #111827);
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const VideoPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 24px;
  font-weight: 600;
`;

// 🆕 BUTTON I DI KANAN BAWAH
const InfoButton = styled.button`
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #db2777);
  border: 3px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 12px 32px rgba(236, 72, 153, 0.6);
    border-color: rgba(255,255,255,0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// 🆕 SIDE TASK PANEL
const TaskPanel = styled.div`
  width: 360px;
  height: fit-content;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.2);
  overflow: hidden;
  animation: ${props => props.show ? slideInRight : slideOutRight} 0.4s ease;
  transform: ${props => props.show ? 'translateX(0)' : 'translateX(100%)'};
  position: sticky;
  top: 20px;

  @media (max-width: 1200px) {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 320px;
    max-height: 70vh;
    z-index: 1000;
  }
`;

const TaskHeader = styled.div`
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-weight: 700;
  font-size: 16px;

  &:hover {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
  }
`;

const TaskIcon = styled.div`
  font-size: 20px;
`;

const CloseIcon = styled.div`
  margin-left: auto;
  font-size: 20px;
  font-weight: 900;
  opacity: 0.8;
`;

const TaskContent = styled.div`
  padding: 24px;
`;

const XPBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  margin-bottom: 24px;
  font-weight: 700;
  font-size: 16px;
  color: #1e40af;
`;

const LevelBadge = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 10px;
  width: ${props => props.progress}%;
  transition: width 0.8s ease;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
`;

const ProgressText = styled.div`
  text-align: center;
  font-weight: 700;
  color: #1e40af;
  font-size: 14px;
  margin-bottom: 24px;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: ${props => props.done 
    ? "linear-gradient(135deg, #d4edda, #c3e6cb)" 
    : props.active 
    ? "linear-gradient(135deg, #fef3c7, #fde68a)" 
    : "#f8fafc"
  };
  border-radius: 20px;
  border: ${props => props.done ? "2px solid #10b981" : props.active ? "2px solid #f59e0b" : "1px solid #e2e8f0"};
  transition: all 0.3s ease;
  cursor: ${props => props.done || props.active ? "default" : "pointer"};

  &:hover {
    ${props => !props.done && !props.active && `
      background: #f1f5f9;
      transform: translateX(4px);
    `}
  }
`;

const StepCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  background: ${props => props.done 
    ? "#10b981" 
    : "#6b7280"
  };
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepLabel = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: ${props => props.done ? "#065f46" : "#374151"};
  margin-bottom: 4px;
`;

const StepReward = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #059669;
`;

const CompleteBadge = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  margin-top: 16px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
`;

const DiscussionButtonContainer = styled.div`
  margin-top: 40px;
`;

const DiscussionButton = styled.button`
  width: 100%;
  padding: 20px 32px;
  border-radius: 20px;
  border: none;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ec4899, #db2777);
  color: white;
  box-shadow: 0 12px 32px rgba(236, 72, 153, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(236, 72, 153, 0.6);
  }

  &:active {
    transform: translateY(-2px);
  }
`;
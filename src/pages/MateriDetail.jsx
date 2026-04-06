import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import api from "../api/axiosClient";
import MiniLessonModal from "../components/MiniLessonModal";
import Layout from "../components/Layout";

export default function MateriDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showMini, setShowMini] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [xp, setXp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestMinimized, setIsQuestMinimized] = useState(false); 
  const safeCompletedSteps = completedSteps || [];

  useEffect(() => {
    api.get(`/materi/${id}`)
      .then(res => setData(res.data?.data || null))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    if (data?.progress) {
      setCompletedSteps(data.progress.completedSteps || []);
      setXp(data.progress.userXP || 0);
    }
  }, [data]);

  useEffect(() => {
  console.log("DATA:", data);
  console.log("PROGRESS:", data?.progress);
  console.log("COMPLETED STEPS:", data?.progress?.completedSteps);
}, [data]);

  if (!data) return <div style={{ padding: 50, textAlign: 'center' }}>Memuat...</div>;

  const videoSection = data.videoSection || data.sections?.find(s => s.type === "video" && s.content);

  const steps = [
    { key: "watch_video", label: "Tonton video sampai selesai", reward: "+10 XP" },
    { key: "open_mini_lesson", label: "Baca Mini Lesson", reward: "+15 XP" },
  ];

  const completeStep = async (stepKey) => {
    if (safeCompletedSteps.includes(stepKey) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      
      setCompletedSteps(res.data.completedSteps || []);
      setXp(res.data.totalXP);

      const icon = stepKey === "watch_video" ? "🎥" : "📘";
      Swal.fire({
        icon: "success",
        title: `${icon} +${res.data.xpGain} XP!`,
        text: `Total XP: ${res.data.totalXP.toLocaleString()}`,
        timer: 2000,
        toast: true,
        position: "top-end",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "white"
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Coba lagi",
        timer: 2000,
        toast: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => completeStep("watch_video");
  const handleOpenMini = () => {
    setShowMini(true);
    completeStep("open_mini_lesson");
  };

  const allStepsDone = safeCompletedSteps.length === 2;
  const toggleQuest = () => setIsQuestMinimized(!isQuestMinimized);

  return (
    <Layout>
      <MainContainer>
        <ContentArea>
          <Header>
            <HeaderLeft>
              <Title>{data.materi?.title}</Title>
              <Breadcrumb>Orientasi Masalah</Breadcrumb>
            </HeaderLeft>
            <BackButton onClick={() => navigate(-1)}>← Kembali</BackButton>
          </Header>

          <VideoWrapper>
            {videoSection ? (
              videoSection.content.includes("http") || videoSection.content.includes("/uploads/") ? (
                <video
                  src={videoSection.content}
                  controls
                  preload="metadata"
                  onEnded={handleVideoEnd}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "20px",
                    background: "#000",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <iframe
                  title="video"
                  width="100%"
                  height="100%"
                  src={videoSection.content}
                  style={{ border: "none", borderRadius: "20px" }}
                  allowFullScreen
                />
              )
            ) : (
              <VideoPlaceholder>Video belum tersedia</VideoPlaceholder>
            )}
            
            {/* 🆕 BUTTON 📖 KIRI BAWAH - Agak bawah */}
            <InfoButton 
              onClick={handleOpenMini} 
              disabled={isLoading || safeCompletedSteps.includes("open_mini_lesson")}
            >
              📖
            </InfoButton>
          </VideoWrapper>

          {allStepsDone && (
            <DiscussionButtonContainer>
              <Link to={`/materi/${id}/discussion`}>
                <DiscussionButton>✅ QUEST SELESAI! 💬 Join Diskusi</DiscussionButton>
              </Link>
            </DiscussionButtonContainer>
          )}
        </ContentArea>

        {/* 🆕 QUEST TEXT ONLY - MINIMIZABLE */}
        <QuestPanel isMinimized={isQuestMinimized}>
          <QuestToggle onClick={toggleQuest}>
            {isQuestMinimized ? "📋" : "✨"} 
            <span>XP QUEST</span>
            {!isQuestMinimized && (
              <QuestMinimizeBtn onClick={toggleQuest}>−</QuestMinimizeBtn>
            )}
          </QuestToggle>
          
          {!isQuestMinimized && (
            <>
              <XPBar>
                Total XP: <strong>{xp.toLocaleString()}</strong>
              </XPBar>
              
              <QuestList>
                {steps.map((step, index) => (
                  <QuestItem 
                    key={step.key} 
                    done={safeCompletedSteps.includes(step.key)}
                  >
                    <QuestCheck done={safeCompletedSteps.includes(step.key)}>
                      {safeCompletedSteps.includes(step.key) ? "✔" : index + 1}
                    </QuestCheck>
                    <div>
                      <QuestText>{step.label}</QuestText>
                      <QuestReward>{step.reward}</QuestReward>
                    </div>
                  </QuestItem>
                ))}
              </QuestList>
            </>
          )}
        </QuestPanel>

        <XPTracker>{xp.toLocaleString()} XP</XPTracker>

        {showMini && (
          <MiniLessonModal
            show={showMini}
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Mini lesson kosong."}
          />
        )}
      </MainContainer>
    </Layout>
  );
}

/* ================= STYLES ================= */
const MainContainer = styled.div`
  position: relative;
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
`;

const ContentArea = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
`;

const Breadcrumb = styled.div`
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4b5563;
    transform: translateY(-2px);
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: #0f172a;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 60px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
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

const InfoButton = styled.button`
  position: absolute;
  left: 24px;        /* 🆕 KIRI */
  bottom: 40px;      /* 🆕 LEBIH BAWAH */
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #db2777);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(236,72,153,0.4);
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: scale(1.1) rotate(180deg);
    box-shadow: 0 16px 40px rgba(236,72,153,0.6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 🆕 QUEST TEXT ONLY - MINIMIZABLE
const QuestPanel = styled.div`
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  
  ${props => props.isMinimized && `
    width: 80px;
    height: 60px;
    padding: 16px 12px;
  `}

  @media (max-width: 768px) {
    right: 15px;
    width: 220px;
    ${props => props.isMinimized && `width: 70px;`}
  }
`;

const QuestToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.3s;

  &:hover {
    color: #93c5fd;
  }
`;

const QuestMinimizeBtn = styled.span`
  margin-left: auto;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.2);
    color: #ef4444;
  }
`;

const XPBar = styled.div`
  padding: 14px 16px;
  background: rgba(255,255,255,0.08);
  border-radius: 14px;
  color: #93c5fd;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
  margin: 16px 0 20px 0;
  border: 1px solid rgba(255,255,255,0.15);
`;

const QuestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QuestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  background: ${props => props.done ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.12)'};
  border-radius: 12px;
  border-left: 3px solid ${props => props.done ? '#22c55e' : '#6366f1'};
  transition: all 0.3s;
  cursor: default;

  &:hover {
    background: ${props => props.done ? 'rgba(34,197,94,0.25)' : 'rgba(99,102,241,0.2)'};
  }
`;

const QuestCheck = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11px;
  background: ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.15)'};
  color: ${props => props.done ? 'white' : 'transparent'};
  border: 2px solid ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.25)'};
`;

const QuestText = styled.div`
  flex: 1;
  color: white;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
`;

const QuestReward = styled.div`
  font-size: 11px;
  color: #93c5fd;
  font-weight: 700;
`;

const XPTracker = styled.div`
  position: fixed;
  top: 25px;
  right: 25px;
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  padding: 14px 20px;
  border-radius: 25px;
  color: white;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 12px 35px rgba(30,64,175,0.5);
  z-index: 1001;
  border: 1px solid rgba(96,165,250,0.3);
`;

const DiscussionButtonContainer = styled.div`
  margin-top: 40px;
`;

const DiscussionButton = styled.button`
  width: 100%;
  padding: 22px 40px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 15px 40px rgba(236,72,153,0.4);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(236,72,153,0.6);
  }
`;
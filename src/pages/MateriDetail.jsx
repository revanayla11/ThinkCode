import { useEffect, useState, useCallback } from "react";
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
  const [xp, setXp] = useState(0); // 🆕 USER TOTAL XP
  const [materiXp, setMateriXp] = useState(0); // 🆕 MATERI XP
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isQuestMinimized, setIsQuestMinimized] = useState(false);

  // 🆕 SINGLE SOURCE FETCH
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/materi/${id}`);
      const materiData = res.data?.data;
      setData(materiData);
      
      // 🆕 TRUST BACKEND DATA - NO FILTER
      if (materiData?.progress) {
        setCompletedSteps(materiData.progress.completedSections || []);
        setMateriXp(materiData.progress.xp || 0);
        setXp(materiData.progress.totalUserXP || materiData.progress.xp || 0);
      }
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data materi",
        timer: 2000,
        toast: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 🆕 LOAD ONCE ONLY
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🆕 FIXED COMPLETE STEP - NO DOUBLE CALL
  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey) || isLoading) {
      console.log(`✅ ${stepKey} already completed`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      
      setCompletedSteps(res.data.completedSteps || []);
      setMateriXp(res.data.materiXP || 0);
      setXp(res.data.totalXP || 0);

      const icon = stepKey === "watch_video" ? "🎥" : "📘";
      const xpGain = res.data.xpGain || 0;
      Swal.fire({
        icon: "success",
        title: `${icon} +${xpGain} XP!`,
        text: `Total XP: ${res.data.totalXP?.toLocaleString() || '0'}`,
        timer: 2000,
        toast: true,
        position: "top-end",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "white"
      });
    } catch (err) {
      console.error("Complete step error:", err);
      if (err.response?.status !== 400) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err.response?.data?.message || "Coba lagi",
          timer: 2000,
          toast: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 FIXED HANDLERS
  const handleVideoEnd = useCallback(() => {
    completeStep("watch_video");
  }, [completedSteps.length, isLoading]);

  const handleOpenMini = useCallback(() => {
    if (isLoading) return;
    setShowMini(true);
    completeStep("open_mini_lesson");
  }, [completedSteps.length, isLoading]);

  const hasWatchVideo = completedSteps.includes("watch_video");
  const hasMiniLesson = completedSteps.includes("open_mini_lesson");
  const allStepsDone = hasWatchVideo && hasMiniLesson;

  const toggleQuest = () => setIsQuestMinimized(!isQuestMinimized);

  console.log('📊 DEBUG:', {
    id,
    completedSteps,
    hasWatchVideo,
    hasMiniLesson,
    allStepsDone,
    materiXp,
    userXp: xp,
    progress: data?.progress
  });

  if (!isDataLoaded) {
    return (
      <Layout>
        <div style={{ padding: 50, textAlign: 'center', color: '#6b7280' }}>
          Memuat data...
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={{ padding: 50, textAlign: 'center', color: '#ef4444' }}>
          Materi tidak ditemukan
        </div>
      </Layout>
    );
  }

  const videoSection = data.videoSection || data.sections?.find(s => s.type === "video" && s.content);

  const steps = [
    { key: "watch_video", label: "Tonton video sampai selesai", reward: "+10 XP" },
    { key: "open_mini_lesson", label: "Baca Mini Lesson", reward: "+15 XP" },
  ];

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
            
            <InfoButton 
              onClick={handleOpenMini} 
              disabled={isLoading || hasMiniLesson}
            >
              📖
            </InfoButton>
          </VideoWrapper>

          <DiscussionSection>
            {allStepsDone ? (
              <DiscussionButtonContainer>
                <Link to={`/materi/${id}/discussion`}>
                  <DiscussionButton>✅ QUEST SELESAI! 💬 Join Diskusi</DiscussionButton>
                </Link>
              </DiscussionButtonContainer>
            ) : (
              <LockMessage>
                🔒 Selesaikan 2 quest untuk unlock diskusi
                <br />
                <small>
                  {hasWatchVideo ? '✅ Video' : '📺 Video'} | 
                  {hasMiniLesson ? ' ✅ Mini Lesson' : ' 📖 Mini Lesson'}
                </small>
              </LockMessage>
            )}
          </DiscussionSection>
        </ContentArea>

        <QuestPanel isMinimized={isQuestMinimized}>
          <QuestToggle onClick={toggleQuest}>
            {isQuestMinimized ? "📋" : "✨"} 
            <span>XP QUEST</span>
            {!isQuestMinimized && (
              <QuestMinimizeBtn onClick={toggleQuest}>−</QuestMinimizeBtn>
            )}
          </QuestToggle>
          
          {isQuestMinimized && (
            <QuestMinimizedText>QUEST</QuestMinimizedText>
          )}
          
          {!isQuestMinimized && (
            <>
              <XPBar>
                Materi: <strong>{materiXp.toLocaleString()}</strong> | Total: <strong>{xp.toLocaleString()}</strong>
              </XPBar>
              
              <QuestList>
                {steps.map((step, index) => {
                  const isDone = completedSteps.includes(step.key);
                  return (
                    <QuestItem key={step.key} done={isDone}>
                      <QuestCheck done={isDone}>
                        {isDone ? "✔" : index + 1}
                      </QuestCheck>
                      <div>
                        <QuestText>{step.label}</QuestText>
                        <QuestReward>{step.reward}</QuestReward>
                      </div>
                    </QuestItem>
                  );
                })}
              </QuestList>
              
              <ProgressFooter>
                Progress: {completedSteps.length}/2
                {allStepsDone && <span>✓ SELESAI!</span>}
              </ProgressFooter>
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

// STYLES (SAMA PERSIS - NO CHANGE)
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
  -webkit-text-fill-color: transparent;
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
  left: 24px;
  bottom: 40px;
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
  z-index: 10;

  &:hover:not(:disabled) {
    transform: scale(1.1) rotate(180deg);
    box-shadow: 0 16px 40px rgba(236,72,153,0.6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DiscussionSection = styled.div`
  margin-top: 40px;
`;

const DiscussionButtonContainer = styled.div`
  animation: slideIn 0.5s ease-out;
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

const LockMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 18px;
  font-weight: 600;
  padding: 40px 20px;
  background: rgba(107,114,128,0.1);
  border-radius: 16px;
  border: 1px solid rgba(107,114,128,0.2);

  small {
    display: block;
    font-size: 14px;
    margin-top: 8px;
    font-weight: 500;
  }
`;

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
    height: 80px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `}

  @media (max-width: 768px) {
    right: 15px;
    width: 220px;
    ${props => props.isMinimized && `width: 70px; height: 70px;`}
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
  justify-content: center;

  ${props => props.isMinimized && `
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  `}

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

const QuestMinimizedText = styled.div`
  color: #60a5fa;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: center;
  margin-top: 4px;
  opacity: 0.9;
`;

const XPBar = styled.div`
  padding: 14px 16px;
  background: rgba(255,255,255,0.08);
  border-radius: 14px;
  color: #93c5fd;
  font-weight: 700;
  font-size: 13px;
  text-align: center;
  margin: 16px 0 20px 0;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 12px;
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

const ProgressFooter = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #93c5fd;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    color: #22c55e;
    font-weight: 800;
  }
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

const slideIn = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
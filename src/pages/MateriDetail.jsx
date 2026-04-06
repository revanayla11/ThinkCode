import { useEffect, useState, useRef } from "react";
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
  const [completedSteps, setCompletedSteps] = useState([]);
  const [xp, setXp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestMinimized, setIsQuestMinimized] = useState(false); // 🆕 Minimize
  const questRef = useRef(null);

  useEffect(() => {
    api.get(`/materi/${id}`).then(res => setData(res.data?.data || null));
  }, [id]);

  useEffect(() => {
    if (data?.progress) {
      setCompletedSteps(data.progress.completedSections || []);
      setXp(data.progress.xp || 0);
    }
  }, [data]);

  if (!data) return <div style={{ padding: 50, textAlign: 'center' }}>Loading...</div>;

  const videoSection = data.videoSection || data.sections?.find(s => s.type === "video" && s.content);

  const steps = [
    { key: "watch_video", label: "Tonton Video", reward: "+10 XP" },
    { key: "open_mini_lesson", label: "Baca Mini Lesson", reward: "+15 XP" },
  ];

  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey) || isLoading) return;
    setIsLoading(true);

    try {
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      setCompletedSteps(res.data.completedSteps);
      setXp(res.data.totalXP); // 🆕 LIVE UPDATE dari DB

      const icon = stepKey === "watch_video" ? "🎥" : "📘";
      Swal.fire({
        icon: "success",
        title: `${icon} ${res.data.xpGain}XP!`,
        text: `Total: ${res.data.totalXP.toLocaleString()} XP`,
        timer: 1500,
        toast: true,
        position: "top-right"
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Coba lagi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => completeStep("watch_video");
  const handleOpenMini = () => {
    setShowMini(true);
    completeStep("open_mini_lesson");
  };

  const toggleQuest = () => setIsQuestMinimized(!isQuestMinimized);
  const allStepsDone = completedSteps.length === 2;

  return (
    <Layout>
      <Container>
        {/* HEADER */}
        <Header>
          <Title>{data.materi?.title}</Title>
          <BackButton onClick={() => navigate(-1)}>← Kembali</BackButton>
        </Header>

        {/* MAIN VIDEO + QUEST LAYOUT */}
        <VideoQuestContainer>
          {/* VIDEO */}
          <VideoSection>
            <VideoWrapper>
              {videoSection ? (
                videoSection.content.includes("http") ? (
                  <video
                    src={videoSection.content}
                    controls
                    preload="metadata"
                    onEnded={handleVideoEnd}
                    style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "contain", background: "#000" }}
                  />
                ) : (
                  <iframe
                    src={videoSection.content}
                    style={{ border: "none", borderRadius: "20px", width: "100%", height: "100%" }}
                    allowFullScreen
                  />
                )
              ) : (
                <VideoPlaceholder>Video Loading...</VideoPlaceholder>
              )}
              
              {/* 🆕 MINI LESSON BUTTON - RIGHT BOTTOM */}
              <MiniLessonBtn onClick={handleOpenMini} disabled={completedSteps.includes("open_mini_lesson") || isLoading}>
                📖 Mini Lesson
              </MiniLessonBtn>
            </VideoWrapper>
          </VideoSection>

          {/* 🆕 QUEST SIDE - NO BOX, OVERLAY */}
          <QuestOverlay ref={questRef}>
            <QuestToggle onClick={toggleQuest}>
              {isQuestMinimized ? '📋' : '✕'}
            </QuestToggle>
            
            {!isQuestMinimized && (
              <QuestContent>
                <QuestTitle>QUEST</QuestTitle>
                <XPLine>⭐ {xp.toLocaleString()} XP</XPLine>
                
                {/* STEPS */}
                <StepsContainer>
                  {steps.map((step, i) => (
                    <StepRow key={step.key} done={completedSteps.includes(step.key)}>
                      <StepNum done={completedSteps.includes(step.key)}>
                        {completedSteps.includes(step.key) ? '✔' : i + 1}
                      </StepNum>
                      <StepLabel>{step.label}</StepLabel>
                      <StepXP>{step.reward}</StepXP>
                    </StepRow>
                  ))}
                </StepsContainer>
              </QuestContent>
            )}
          </QuestOverlay>
        </VideoQuestContainer>

        {/* 🆕 JOIN DISCUSSION - BOTTOM ONLY IF COMPLETE */}
        {allStepsDone && (
          <JoinDiscussion>
            <Link to={`/materi/${id}/discussion`}>
              <JoinBtn>💬 JOIN DISKUSI ROOM</JoinBtn>
            </Link>
          </JoinDiscussion>
        )}

        {/* MODAL */}
        {showMini && (
          <MiniLessonModal
            show={showMini}
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Loading..."}
          />
        )}
      </Container>
    </Layout>
  );
}

/* ================= STYLES ================= */
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const BackButton = styled.button`
  background: #64748b;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s;

  &:hover {
    background: #475569;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(100,116,139,0.4);
  }
`;

// 🆕 VIDEO + QUEST FLEX
const VideoQuestContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;
  position: relative;
`;

const VideoSection = styled.div`
  flex: 1;
  max-width: 900px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 550px;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
`;

const VideoPlaceholder = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24px;
  font-weight: 700;
`;

// 🆕 MINI LESSON BUTTON
const MiniLessonBtn = styled.button`
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 16px 28px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(245,158,11,0.4);
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 25px 50px rgba(245,158,11,0.6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// 🆕 QUEST OVERLAY - NO BOX!
const QuestOverlay = styled.div`
  position: sticky;
  top: 20px;
  width: 280px;
  height: fit-content;
  z-index: 10;
`;

const QuestToggle = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(99,102,241,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(99,102,241,0.4);
  transition: all 0.3s;
  margin-bottom: 15px;

  &:hover {
    background: rgba(99,102,241,1);
    transform: scale(1.1);
  }
`;

const QuestContent = styled.div`
  background: rgba(15,23,42,0.95);
  backdrop-filter: blur(20px);
  padding: 25px;
  border-radius: 25px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const QuestTitle = styled.div`
  color: #60a5fa;
  font-size: 18px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 2px;
`;

const XPLine = styled.div`
  background: rgba(255,255,255,0.1);
  color: #93c5fd;
  padding: 12px 20px;
  border-radius: 15px;
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  margin-bottom: 25px;
  border: 1px solid rgba(255,255,255,0.15);
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 12px;
  background: ${props => props.done ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.15)'};
  border-radius: 18px;
  border-left: 5px solid ${props => props.done ? '#22c55e' : '#6366f1'};
  transition: all 0.3s;
`;

const StepNum = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  background: ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.2)'};
  color: ${props => props.done ? 'white' : 'transparent'};
  border: 3px solid ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.3)'};
`;

const StepLabel = styled.div`
  flex: 1;
  color: white;
  font-weight: 700;
  font-size: 15px;
`;

const StepXP = styled.div`
  color: #93c5fd;
  font-weight: 800;
  font-size: 13px;
`;

// 🆕 JOIN BUTTON
const JoinDiscussion = styled.div`
  text-align: center;
  margin-top: 60px;
  padding: 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 30px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
`;

const JoinBtn = styled.button`
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  border: none;
  padding: 24px 50px;
  border-radius: 50px;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 20px 50px rgba(236,72,153,0.4);
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 60px rgba(236,72,153,0.6);
  }
`;
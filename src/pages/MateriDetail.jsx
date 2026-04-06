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

  useEffect(() => {
    api.get(`/materi/${id}`).then(res => setData(res.data?.data || null));
  }, [id]);

  useEffect(() => {
    if (data?.progress) {
      setCompletedSteps(data.progress.completedSections || []);
      setXp(data.progress.xp || 0);
    }
  }, [data]);

  if (!data) return <Loading>Loading...</Loading>;

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
      setXp(res.data.totalXP);
      
      Swal.fire({
        icon: "success",
        title: `+${res.data.xpGain} XP!`,
        text: `Total: ${res.data.totalXP.toLocaleString()} XP`,
        timer: 2000,
        toast: true,
        position: "top-end"
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Coba lagi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => completeStep("watch_video");
  const handleOpenMini = () => {
    setShowMini(true);
    completeStep("open_mini_lesson");
  };

  const allStepsDone = completedSteps.length === 2;

  return (
    <Layout>
      <Container>
        <Header>
          <Title>{data.materi?.title}</Title>
          <BackButton onClick={() => navigate(-1)}>← Kembali</BackButton>
        </Header>

        <MainContent>
          {/* VIDEO KIRI */}
          <VideoSection>
            <VideoWrapper>
              {videoSection ? (
                videoSection.content.includes("http") ? (
                  <video
                    src={videoSection.content}
                    controls
                    onEnded={handleVideoEnd}
                    style={{ width: "100%", height: "100%", borderRadius: "20px" }}
                  />
                ) : (
                  <iframe
                    src={videoSection.content}
                    style={{ width: "100%", height: "100%", borderRadius: "20px" }}
                    allowFullScreen
                  />
                )
              ) : (
                <VideoPlaceholder>Tunggu video...</VideoPlaceholder>
              )}
              <MiniButton onClick={handleOpenMini} disabled={isLoading}>
                📖 Mini Lesson
              </MiniButton>
            </VideoWrapper>
          </VideoSection>

          {/* QUEST KANAN */}
          <QuestSection>
            <QuestHeader>
              <QuestIcon>⭐</QuestIcon>
              <div>QUEST</div>
            </QuestHeader>
            
            <XPContainer>
              <XPText>Total XP</XPText>
              <XPValue>{xp.toLocaleString()}</XPValue>
            </XPContainer>

            <QuestList>
              {steps.map((step, i) => (
                <QuestItem key={step.key} done={completedSteps.includes(step.key)}>
                  <QuestNumber done={completedSteps.includes(step.key)}>
                    {completedSteps.includes(step.key) ? "✓" : i + 1}
                  </QuestNumber>
                  <QuestInfo>
                    <QuestTitle>{step.label}</QuestTitle>
                    <QuestReward>{step.reward}</QuestReward>
                  </QuestInfo>
                </QuestItem>
              ))}
            </QuestList>

            {allStepsDone && (
              <QuestComplete>🎉 Semua Quest Selesai!</QuestComplete>
            )}
          </QuestSection>
        </MainContent>

        {/* BUTTON JOIN BAWAH - LOCKED sampai selesai */}
        <BottomButton>
          <JoinButton 
            disabled={!allStepsDone || isLoading}
            as={allStepsDone ? Link : "button"}
            to={allStepsDone ? `/materi/${id}/discussion` : "#"}
          >
            {allStepsDone ? "💬 JOIN DISKUSI" : "🔒 Selesaikan Quest Dulu"}
          </JoinButton>
        </BottomButton>

        {showMini && (
          <MiniLessonModal
            show={true}
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Loading..."}
          />
        )}
      </Container>
    </Layout>
  );
}

/* ==================== STYLES ==================== */
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  margin: 0;
`;

const BackButton = styled.button`
  background: #64748b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #475569; transform: translateY(-2px); }
`;

const MainContent = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
  @media (max-width: 1024px) { 
    flex-direction: column; 
    gap: 30px;
  }
`;

const VideoSection = styled.div`
  flex: 1;
  max-width: 800px;
`;

const VideoWrapper = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
`;

const VideoPlaceholder = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24px;
  font-weight: 600;
`;

const MiniButton = styled.button`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  background: linear-gradient(135deg, #ec4899, #db2777);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateX(-50%) translateY(-4px);
    box-shadow: 0 15px 35px rgba(236,72,153,0.4);
  }
`;

const QuestSection = styled.div`
  width: 320px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 24px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
`;

const QuestHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const QuestIcon = styled.div`
  font-size: 24px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  background-clip: text;
  font-weight: 800;
`;

const XPContainer = styled.div`
  text-align: center;
  margin-bottom: 28px;
  padding: 20px 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const XPText = styled.div`color: #94a3b8; font-size: 14px; font-weight: 600; margin-bottom: 8px;`;
const XPValue = styled.div`color: white; font-size: 28px; font-weight: 800;`;

const QuestList = styled.div`display: flex; flex-direction: column; gap: 18px;`;

const QuestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 14px;
  background: ${props => props.done ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'};
  border-radius: 16px;
  border-left: 4px solid ${props => props.done ? '#22c55e' : '#3b82f6'};
  transition: all 0.3s;
`;

const QuestNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  background: ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.2)'};
  color: ${props => props.done ? 'white' : '#94a3b8'};
  border: 2px solid ${props => props.done ? '#22c55e' : 'rgba(255,255,255,0.3)'};
`;

const QuestInfo = styled.div`flex: 1;`;
const QuestTitle = styled.div`color: white; font-weight: 700; font-size: 15px; margin-bottom: 4px;`;
const QuestReward = styled.div`color: #60a5fa; font-size: 13px; font-weight: 600;`;

const QuestComplete = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  text-align: center;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
`;

const BottomButton = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 24px 48px;
  border-radius: 24px;
  border: none;
  font-size: 20px;
  font-weight: 800;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled 
    ? '#64748b' 
    : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  };
  color: white;
  transition: all 0.3s;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 20px 45px rgba(236,72,153,0.4)'
  };

  &:hover:not(:disabled) {
    transform: translateY(-6px);
    box-shadow: 0 30px 60px rgba(236,72,153,0.6);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const Loading = styled.div`
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #64748b;
`;
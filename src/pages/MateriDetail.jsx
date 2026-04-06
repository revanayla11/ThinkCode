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

  const videoSection = data.sections?.find(
    s => s.type === "video" && s.content
  );

  const steps = [
    { key: "watch_video", label: "Tonton Video" },
    { key: "open_mini_lesson", label: "Buka Mini Lesson" },
    { key: "join_discussion", label: "Join Diskusi" },
    { key: "submit_answer", label: "Submit Jawaban" },
  ];

  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.post(`/materi/${id}/complete-step`, { step: stepKey });
      
      setCompletedSteps(res.data.completedSteps);
      setXp(res.data.xp);
      setLevel(Math.floor(res.data.xp / 100));

      // XP Mapping untuk icon
      const xpMap = { watch_video: "🎥", open_mini_lesson: "📘", join_discussion: "💬", submit_answer: "✅" };
      const icon = xpMap[stepKey] || "⭐";
      
      Swal.fire({
        icon: "success",
        title: `+${res.data.xp - (xp)} XP ${icon}`,
        text: `${steps.find(s => s.key === stepKey).label} selesai!`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan progress",
        text: err.response?.data?.error || "Coba lagi",
        timer: 2000
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

  const canJoinDiscussion = completedSteps.includes("watch_video");

  return (
    <Layout>
      <Wrapper>
        <Header>
          <HeaderLeft>
            <Title>{data.materi?.title}</Title>
            <Breadcrumb>Orientasi Masalah</Breadcrumb>
          </HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            Kembali
          </BackButton>
        </Header>

        <VideoWrapper>
          {videoSection ? (
            videoSection.content.includes("/uploads/") ? (
              (() => {
                const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                const videoSrc = videoSection.content.startsWith('https://') 
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
                      borderRadius: 12,
                      background: "#000",
                      objectFit: "contain",
                    }}
                  />
                );
              })()
            ) : (
              <iframe
                title="materi-video"
                width="100%"
                height="100%"
                src={videoSection.content}
                style={{ border: "none", borderRadius: 12 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <VideoPlaceholder>Video</VideoPlaceholder>
          )}

          <InfoButton onClick={handleOpenMini} disabled={isLoading}>
            i
          </InfoButton>
        </VideoWrapper>

        <GameBox>
          <XPBar>
            ⭐ XP: {xp} | Level: {level} 
            <LevelBadge>Lv.{level}</LevelBadge>
          </XPBar>

          <ProgressBox>
            {steps.map(step => (
              <StepItem key={step.key} done={completedSteps.includes(step.key)}>
                {completedSteps.includes(step.key) ? "✔" : "○"} {step.label}
              </StepItem>
            ))}
          </ProgressBox>

          <ProgressFooter>
            Progress: {Math.round((completedSteps.length / steps.length) * 100)}%
          </ProgressFooter>
        </GameBox>

        <DiscussionButtonContainer>
          <Link to={canJoinDiscussion ? `/materi/${id}/discussion` : "#"}>
            <DiscussionButton disabled={!canJoinDiscussion || isLoading}>
              {canJoinDiscussion ? "💬 Join Ruang Diskusi" : "🔒 Selesaikan video dulu"}
            </DiscussionButton>
          </Link>
        </DiscussionButtonContainer>

        {showMini && (
          <MiniLessonModal
            show={showMini}  
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Mini lesson tidak ditemukan."}
          />
        )}
      </Wrapper>
    </Layout>
  );
}

/* ================= STYLES ================= */
const Wrapper = styled.div`
  padding: 20px 40px;
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
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

const Title = styled.h2`
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 700;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #666;
`;

const BackButton = styled.button`
  background: #3759c7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #2e4bb6;
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  height: 450px;
  background: #1a1a1a;
  border-radius: 16px;
  position: relative;
  margin: 0 auto 30px;
`;

const VideoPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 24px;
`;

const InfoButton = styled.button`
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e8df5, #3b6fd8);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(78, 141, 245, 0.4);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(78, 141, 245, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GameBox = styled.div`
  max-width: 500px;
  margin: 0 auto 40px;
  padding: 25px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f5f9ff 0%, #e8f0fe 100%);
  box-shadow: 0 8px 32px rgba(78, 141, 245, 0.15);
  border: 1px solid rgba(78, 141, 245, 0.2);
`;

const XPBar = styled.div`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 20px;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LevelBadge = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const ProgressBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 15px;
`;

const StepItem = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.done ? 
    "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)" : 
    "#f8f9fa"
  };
  border: ${props => props.done ? "2px solid #28a745" : "1px solid #e9ecef"};
  font-weight: ${props => props.done ? "600" : "500"};
  color: ${props => props.done ? "#155724" : "#6c757d"};
  transition: all 0.2s;
`;

const ProgressFooter = styled.div`
  text-align: center;
  font-weight: 600;
  color: #1e40af;
  font-size: 16px;
`;

const DiscussionButtonContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const DiscussionButton = styled.button`
  width: 100%;
  padding: 16px 30px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  background: linear-gradient(135deg, #10b981, #059669);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
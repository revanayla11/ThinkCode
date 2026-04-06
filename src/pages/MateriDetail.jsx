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
  const [materiXp, setMateriXp] = useState(0);
  const [userXp, setUserXp] = useState(0);

  const [videoDone, setVideoDone] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    api.get(`/materi/${id}`)
      .then(res => {
        const d = res.data.data;
        setData(d);

        if (d.progress) {
          setCompletedSteps(d.progress.completedSections || []);
          setMateriXp(d.progress.xp || 0);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  const videoSection = data.videoSection;

  // ================= QUEST =================
  const steps = [
    { key: "watch_video", label: "Tonton video sampai selesai", reward: "+10 XP" },
    { key: "open_mini_lesson", label: "Baca Mini Lesson", reward: "+15 XP" },
  ];

  // ================= COMPLETE STEP =================
  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey)) return;

    try {
      const res = await api.post(`/materi/${id}/complete-step`, {
        step: stepKey
      });

      setCompletedSteps(res.data.completedSteps);
      setMateriXp(res.data.materiXP);
      setUserXp(res.data.totalXP);

      Swal.fire({
        icon: "success",
        title: `+${res.data.xpGain} XP`,
        text: `Total XP: ${res.data.totalXP}`,
        timer: 1500,
        toast: true,
        position: "top-end"
      });

    } catch (err) {
      console.error(err);
    }
  };

  // ================= VIDEO TRACK =================
  const handleVideoProgress = (e) => {
    const video = e.target;

    if (!videoDone && video.duration > 0) {
      const progress = video.currentTime / video.duration;

      if (progress > 0.9) {
        setVideoDone(true);
        completeStep("watch_video");
      }
    }
  };

  // ================= MINI LESSON =================
  const handleOpenMini = () => {
    setShowMini(true);
    completeStep("open_mini_lesson");
  };

  // ================= UNLOCK =================
  const isUnlocked =
    completedSteps.includes("watch_video") &&
    completedSteps.includes("open_mini_lesson");

  return (
    <Layout>
      <Container>

        {/* HEADER */}
        <Header>
          <h1>{data.materi.title}</h1>
          <button onClick={() => navigate(-1)}>← Kembali</button>
        </Header>

        {/* VIDEO */}
        <VideoWrapper>
          {videoSection ? (
            <video
              src={videoSection.content}
              controls
              onTimeUpdate={handleVideoProgress}
              style={{ width: "100%", borderRadius: "16px" }}
            />
          ) : (
            <p>Video belum tersedia</p>
          )}

          <MiniButton onClick={handleOpenMini}>
            📖
          </MiniButton>
        </VideoWrapper>

        {/* QUEST */}
        <QuestBox>
          <h3>🎯 Quest</h3>

          {steps.map((step) => (
            <QuestItem key={step.key}>
              <span>
                {completedSteps.includes(step.key) ? "✔" : "○"}
              </span>
              <div>
                <p>{step.label}</p>
                <small>{step.reward}</small>
              </div>
            </QuestItem>
          ))}

          <p>
            Progress: {completedSteps.length}/{steps.length}
          </p>
        </QuestBox>

        {/* DISKUSI */}
        <DiscussionBox>
          {isUnlocked ? (
            <Link to={`/materi/${id}/discussion`}>
              <button className="active">
                🔓 Masuk Diskusi Room
              </button>
            </Link>
          ) : (
            <p>🔒 Selesaikan semua quest dulu</p>
          )}
        </DiscussionBox>

        {/* XP */}
        <XPBox>
          <p>Total XP User: {userXp}</p>
          <p>XP Materi: {materiXp}</p>
        </XPBox>

        {/* MINI LESSON */}
        {showMini && (
          <MiniLessonModal
            show={showMini}
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Kosong"}
          />
        )}

      </Container>
    </Layout>
  );
}

//////////////////// STYLE ////////////////////

const Container = styled.div`
  max-width: 900px;
  margin: auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const VideoWrapper = styled.div`
  position: relative;
`;

const MiniButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 10px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
`;

const QuestBox = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #eee;
  border-radius: 10px;
`;

const QuestItem = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const DiscussionBox = styled.div`
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

  .active {
    background: green;
    color: white;
  }
`;

const XPBox = styled.div`
  margin-top: 20px;
  font-weight: bold;
`;
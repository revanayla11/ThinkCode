import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosClient";
import Swal from "sweetalert2";
import styled from "styled-components";

export default function MateriDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [materiXp, setMateriXp] = useState(0);
  const [userXp, setUserXp] = useState(0);
  const [videoDone, setVideoDone] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    api.get(`/materi/${id}`).then(res => {
      const d = res.data.data;
      setData(d);

      // 🔥 FIX parsing
      const steps = d.progress?.completedSections || [];

      setCompletedSteps(
        Array.isArray(steps)
          ? steps
          : JSON.parse(steps || "[]")
      );

      setMateriXp(d.progress?.xp || 0);
      setUserXp(d.userXP || 0);
    });
  }, [id]);

  if (!data) return <div>Loading...</div>;

  // ================= QUEST =================
  const steps = [
    { key: "watch_video", label: "Tonton video sampai selesai" },
    { key: "open_mini_lesson", label: "Baca Mini Lesson" },
  ];

  // ================= COMPLETE STEP =================
  const completeStep = async (stepKey) => {
    if (completedSteps.includes(stepKey)) return;

    const res = await api.post(`/materi/${id}/complete-step`, {
      step: stepKey
    });

    setCompletedSteps(res.data.completedSteps);
    setMateriXp(res.data.materiXP);
    setUserXp(res.data.totalXP);

    // 🔥 tidak tampil kalau 0
    if (res.data.xpGain > 0) {
      Swal.fire({
        icon: "success",
        title: `+${res.data.xpGain} XP`,
        timer: 1200,
        toast: true,
        position: "top-end"
      });
    }
  };

  // ================= VIDEO =================
  const handleVideo = (e) => {
    const v = e.target;

    if (!videoDone && v.duration > 0) {
      const progress = v.currentTime / v.duration;

      if (progress > 0.9) {
        setVideoDone(true);
        completeStep("watch_video");
      }
    }
  };

  // ================= MINI =================
  const openMini = () => {
    completeStep("open_mini_lesson");
  };

  // ================= UNLOCK =================
  const unlocked =
    completedSteps.includes("watch_video") &&
    completedSteps.includes("open_mini_lesson");

  return (
    <div style={{ padding: 20 }}>

      <h2>{data.materi.title}</h2>

      {/* VIDEO */}
      <video
        src={data.videoSection?.content}
        controls
        width="100%"
        onTimeUpdate={handleVideo}
      />

      <br /><br />

      <button onClick={openMini}>📖 Buka Mini Lesson</button>

      {/* QUEST */}
      <h3>🎯 Quest</h3>
      {steps.map(s => (
        <div key={s.key}>
          {completedSteps.includes(s.key) ? "✔" : "○"} {s.label}
        </div>
      ))}

      <p>Progress: {completedSteps.length}/2</p>

      {/* DISKUSI */}
      {unlocked ? (
        <Link to={`/materi/${id}/discussion`}>
          <button>🔓 Masuk Diskusi</button>
        </Link>
      ) : (
        <p>🔒 Selesaikan quest dulu</p>
      )}

      {/* XP */}
      <h4>Total XP: {userXp}</h4>
      <h4>XP Materi: {materiXp}</h4>

    </div>
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
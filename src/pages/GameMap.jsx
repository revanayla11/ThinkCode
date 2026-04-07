import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0 });

  useEffect(() => {
    Promise.all([
      apiGet("/game/map"),
      apiGet("/user/stats") // Asumsi ada endpoint ini
    ]).then(([mapRes, statsRes]) => {
      if (mapRes.status) {
        console.log("LEVELS:", mapRes.levels);
        console.log("PROGRESS:", mapRes.progress);
        setLevels(mapRes.levels);
        setProgress(mapRes.progress);
      }
      if (statsRes.status) {
        setUserStats(statsRes);
      }
    });
  }, []);

  // ... unlock logic sama seperti sebelumnya

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "⭐";
    return "✨";
  };

  return (
    <Layout>
      <div style={{ padding: 40, fontFamily: 'Roboto, sans-serif' }}>
        {/* USER STATS HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '25px 40px',
          borderRadius: '25px',
          marginBottom: '40px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '2rem' }}>
            {getStreakEmoji(userStats.streak)} Streak: {userStats.streak} hari
          </h2>
          <div style={{ fontSize: '1.3rem', opacity: 0.9 }}>
            XP: <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{userStats.xp}</span>
          </div>
        </div>

        {materiList.map((materi, mIdx) => (
          <div key={materi.materiId} style={{ marginBottom: 60 }}>
            <h3 style={{ textAlign: "center", color: '#1e293b', marginBottom: '30px' }}>
              {materi.materiName}
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              {materi.levels.map((lvl, lIdx) => {
                const unlocked = isUnlocked(mIdx, lIdx);
                const completed = isCompleted(lvl.id);
                return (
                  <Link key={lvl.id} to={`/game/play/${lvl.id}`}>
                    <div style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: completed 
                        ? "linear-gradient(135deg, #10b981, #059669)" 
                        : unlocked 
                        ? "#3b82f6" 
                        : "#999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: '1.4rem',
                      color: 'white',
                      boxShadow: completed 
                        ? '0 0 30px rgba(16, 185, 129, 0.6)' 
                        : unlocked 
                        ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                        : 'none',
                      transition: 'all 0.3s ease',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      transform: unlocked ? 'scale(1.05)' : 'scale(0.95)'
                    }}>
                      {completed ? '✅' : lvl.levelNumber}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
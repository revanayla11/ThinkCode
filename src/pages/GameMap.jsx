import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, hearts: 5 });

useEffect(() => {
  apiGet("/game/map")
    .then((res) => {
      console.log("GAME MAP DATA:", res);
      console.log("LEVELS:", res.levels); // 🔥 TAMBAH INI
      setLevels(res.levels || []);
      setProgress(res.progress || []);
      setUserStats(res.userStats || {});
    })
    .catch(err => console.error("Map load error:", err));
}, []);

  // ✅ FIXED: Unlock logic berdasarkan grouped data
  const isUnlocked = (mIdx, lIdx) => {
    // Hitung total levels SEBELUM materi ini
    const prevMateriLevels = levels.slice(0, mIdx)
      .reduce((sum, materi) => sum + (materi.levels?.length || 0), 0);
    
    // + level index di materi ini
    const totalPrevLevels = prevMateriLevels + lIdx;
    
    // Unlock jika progress cukup
    return progress.filter(p => p.completed).length >= totalPrevLevels;
  };

  const isCompleted = (levelId) => {
    return progress.some(p => p.levelId == levelId && p.completed);
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "⭐";
    return "✨";
  };

  const PathNode = ({ level, position, unlocked, completed, onClick }) => (
    <Link 
      to={unlocked ? `/game/play/${level.id}` : "#"}
      style={{ textDecoration: 'none' }}
    >
    <div 
      style={{
        position: 'absolute', // 🔥 INI YANG KURANG
        ...position,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: completed 
          ? "linear-gradient(135deg, #10b981, #059669)" 
          : unlocked 
          ? "linear-gradient(135deg, #f59e0b, #d97706)" 
          : "linear-gradient(135deg, #6b7280, #4b5563)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: '1.5rem',
        color: 'white',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        transform: unlocked ? 'scale(1.1)' : 'scale(0.9)',
        zIndex: 10
      }}
    >
        {completed ? '⭐' : level.levelNumber}
        {unlocked && !completed && (
          <div style={{
            position: 'absolute',
            top: -8, right: -8,
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(239,68,68,0.6)',
            animation: 'pulse 2s infinite'
          }}>
            🔥
          </div>
        )}
      </div>
    </Link>
  );

  // Loading state
  if (levels.length === 0) {
    return (
      <Layout>
        <div style={{ 
          padding: 100, 
          textAlign: 'center', 
          color: 'white', 
          fontSize: '1.8rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          🤠 Loading petualangan Sheriff...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        padding: 40, 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        {/* USER STATS HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '30px 40px',
          borderRadius: '30px',
          marginBottom: '50px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(16,185,129,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
            <div style={{ fontSize: '2.5rem' }}>
              {getStreakEmoji(userStats.streak)}
            </div>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '2.2rem' }}>
                Streak: {userStats.streak} hari
              </h2>
              <div style={{ fontSize: '1.4rem', opacity: 0.9 }}>
                ❤️ {userStats.hearts}/5 Hearts
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
            XP: <span style={{ fontSize: '2rem', textShadow: '0 0 20px rgba(255,255,255,0.8)' }}>{userStats.xp}</span>
          </div>
        </div>

        {/* WINDING MAP PATH */}
        <div style={{ 
          position: 'relative',
          maxWidth: 1000,
          margin: '0 auto',
          height: 'auto',
          minHeight: 800
        }}>
          {/* Background path SVG */}
          <svg style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 1, 
            opacity: 0.3 
          }}>
            <path d="M100 200 Q300 100 500 200 Q700 300 900 200 Q1100 300 1200 400" 
                  stroke="#fbbf24" strokeWidth="60" fill="none" strokeLinecap="round"/>
            <path d="M100 400 Q400 500 700 400 Q1000 500 1200 450" 
                  stroke="#f59e0b" strokeWidth="50" fill="none" strokeLinecap="round"/>
          </svg>

          {/* LEVEL NODES */}
          <div style={{ position: 'relative', padding: '50px 0' }}>
            {levels.map((materi, mIdx) => (
              <div key={materi.materiId} style={{ marginBottom: 100 }}>
                {/* MATERI TITLE */}
                <h3 style={{ 
                  textAlign: "center", 
                  color: 'white', 
                  marginBottom: '50px',
                  fontSize: '2.2rem',
                  textShadow: '0 0 20px rgba(255,255,255,0.8)',
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📚 {materi.materiName}
                </h3>
                
                {/* LEVEL CIRCLES - Zigzag */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  position: 'relative',
                  flexWrap: 'wrap',
                  gap: 25
                }}>
                  {materi.levels?.map((lvl, lIdx) => {
                    const unlocked = isUnlocked(mIdx, lIdx);
                    const completed = isCompleted(lvl.id);
                    const positions = [
                      { left: '5%', top: '20px' },
                      { left: '35%', top: '-15px' },
                      { left: '65%', top: '25px' },
                      { left: '20%', top: '55px' },
                      { left: '80%', top: '5px' }
                    ];
                    
                    return (
                      <PathNode
                        key={lvl.id}
                        level={lvl}
                        position={positions[lIdx % positions.length]}
                        unlocked={unlocked}
                        completed={completed}
                        onClick={() => {
                          if (unlocked) {
                            console.log("Nav to level:", lvl.id);
                          }
                        }}
                      />
                    );
                  }) || []}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </Layout>
  );
}
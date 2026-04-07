import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, hearts: 5 });

  useEffect(() => {
    Promise.all([
      apiGet("/game/map"),
      apiGet("/user/stats")
    ]).then(([mapRes, statsRes]) => {
      if (mapRes.status) {
        setLevels(mapRes.levels);
        setProgress(mapRes.progress);
      }
      if (statsRes.status) {
        setUserStats(statsRes);
      }
    });
  }, []);

  const isUnlocked = (mIdx, lIdx) => {
    // Logic unlock: sequential + winding path
    const totalPrevLevels = mIdx * 5 + lIdx;
    return progress.filter(p => p.completed).length >= totalPrevLevels;
  };

  const isCompleted = (levelId) => {
    return progress.some(p => p.levelId === levelId && p.completed);
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "⭐";
    return "✨";
  };

  const PathNode = ({ level, position, unlocked, completed, onClick }) => (
    <div 
      style={{
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
        boxShadow: completed 
          ? '0 0 30px rgba(16, 185, 129, 0.6)' 
          : unlocked 
          ? '0 0 25px rgba(245, 158, 11, 0.7)' 
          : '0 8px 25px rgba(0,0,0,0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        transform: unlocked ? 'scale(1.1) rotate(5deg)' : 'scale(0.9)',
        position: 'relative',
        zIndex: 10
      }}
      onClick={onClick}
    >
      {completed ? '⭐' : level.levelNumber}
      {unlocked && (
        <div style={{
          position: 'absolute',
          top: -10, right: -10,
          width: 30, height: 30,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          animation: 'pulse 2s infinite'
        }}>
          🔥
        </div>
      )}
    </div>
  );

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
          height: 800
        }}>
          {/* Background path illustration */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.3 }}>
            <path d="M100 200 Q300 100 500 200 Q700 300 900 200 Q1100 300 1200 400" 
                  stroke="#fbbf24" strokeWidth="60" fill="none" strokeLinecap="round"/>
            <path d="M100 400 Q400 500 700 400 Q1000 500 1200 450" 
                  stroke="#f59e0b" strokeWidth="50" fill="none" strokeLinecap="round"/>
          </svg>

          {/* LEVEL NODES - Winding pattern */}
          <div style={{ position: 'relative', height: '100%' }}>
            {levels.map((materi, mIdx) => (
              <div key={materi.materiId} style={{ marginBottom: 80 }}>
                <h3 style={{ 
                  textAlign: "center", 
                  color: 'white', 
                  marginBottom: '40px',
                  fontSize: '2rem',
                  textShadow: '0 0 20px rgba(255,255,255,0.5)'
                }}>
                  {materi.materiName}
                </h3>
                
                {/* Zigzag level positions */}
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  {materi.levels.map((lvl, lIdx) => {
                    const unlocked = isUnlocked(mIdx, lIdx);
                    const completed = isCompleted(lvl.id);
                    const positions = [
                      { left: '10%', top: '20px' },
                      { left: '40%', top: '-10px' },
                      { left: '70%', top: '30px' },
                      { left: '25%', top: '60px' },
                      { left: '85%', top: '0px' }
                    ];
                    
                    return (
                      <PathNode
                        key={lvl.id}
                        level={lvl}
                        position={positions[lIdx]}
                        unlocked={unlocked}
                        completed={completed}
                        onClick={() => unlocked && window.location.href = `/game/play/${lvl.id}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
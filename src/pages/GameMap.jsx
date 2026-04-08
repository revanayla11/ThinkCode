import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, hearts: 5 });
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedLevel, setLockedLevel] = useState(null);

  useEffect(() => {
    apiGet("/game/map")
      .then((res) => {
        if (res.status) {
          setLevels(res.levels || []);
          setProgress(res.progress || []);
          setUserStats(res.userStats || {});
        }
      })
      .catch(console.error);
  }, []);

// 🔥 FIXED isUnlocked - Proper sequential unlock
// 🔥 FIXED isUnlocked - Sequential unlock
const isUnlocked = (mIdx, lIdx) => {
  // Level 1-1 always unlocked
  if (mIdx === 0 && lIdx === 0) return true;
  
  // Count COMPLETED levels (80%+) BEFORE this one
  let completedBefore = 0;
  levels.slice(0, mIdx).forEach(materi => {
    materi.levels.forEach(level => {
      const progressItem = progress.find(p => p.levelId == level.id);
      if (progressItem?.completed && progressItem.score >= 80) {
        completedBefore++;
      }
    });
  });
  
  // Add levels in same materi before this
  for (let i = 0; i < lIdx; i++) {
    const level = levels[mIdx].levels[i];
    const progressItem = progress.find(p => p.levelId == level.id);
    if (progressItem?.completed && progressItem.score >= 80) {
      completedBefore++;
    }
  }

  console.log(`🔓 ${mIdx}-${lIdx}: need ${completedBefore + 1}, have ${completedBefore}`);
  return true; // 🔥 TEMP: Unlock all for testing
};

// 🔥 AUTO REFRESH after 2s
useEffect(() => {
  const timer = setTimeout(() => {
    if (progress.length > 0) {
      console.log("🔄 Auto refresh map...");
      window.location.reload();
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [progress.length]);

// 🔥 DEBUG useEffect
useEffect(() => {
  apiGet("/game/map")
    .then((res) => {
      if (res.status) {
        console.log("🗺️ FULL RESPONSE:", res);
        console.log("📊 PROGRESS DETAIL:", res.progress);
        setLevels(res.levels || []);
        setProgress(res.progress || []);
        setUserStats(res.userStats || {});
      }
    })
    .catch(err => console.error("Map error:", err));
}, []);

  const isCompleted = (levelId) =>
    progress.some(p => p.levelId == levelId && p.completed && p.score >= 80);

  const getThemeIcon = (mIdx) => {
    const themes = ["✈️", "🚀", "⚡", "🌟", "🔥", "💎"];
    return themes[mIdx % themes.length];
  };

  const getStreakEmoji = (streak) => (streak >= 7 ? "🔥" : streak >= 3 ? "⭐⭐" : "⭐");

  // Flatten levels untuk positioning
  const flatLevels = levels.flatMap((m, mIdx) =>
    m.levels.map((lvl, lIdx) => ({
      ...lvl,
      materiIndex: mIdx,
      levelIndex: lIdx,
    }))
  );

  // Zig-zag positioning
  const getNodePosition = (index) => {
    const baseY = index * 120;
    const pattern = [
      { x: 300, offsetY: 0 },
      { x: 500, offsetY: 40 },
      { x: 700, offsetY: 0 },
    ];
    const p = pattern[index % 3];
    return { x: p.x, y: baseY + p.offsetY };
  };

  // 🔥 LEVEL NODE dengan LOCKED POPUP
  const LevelNode = ({ level, unlocked, completed, themeIcon }) => (
    <>
      <Link
        to={unlocked ? `/game/play/${level.id}` : "#"}
        style={{ textDecoration: "none" }}
        onClick={(e) => {
          if (!unlocked) {
            e.preventDefault();
            setLockedLevel(level);
            setShowLockedModal(true);
          }
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: completed
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : unlocked
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "linear-gradient(135deg, #9ca3af, #6b7280)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            boxShadow: unlocked
              ? "0 15px 35px rgba(245, 158, 11, 0.4)"
              : completed
              ? "0 15px 35px rgba(34, 197, 94, 0.4)"
              : "0 5px 15px rgba(0,0,0,0.2)",
            transform: unlocked ? "scale(1.05)" : "scale(0.95)",
            transition: "all 0.3s ease",
            cursor: unlocked ? "pointer" : "not-allowed",
            opacity: unlocked || completed ? 1 : 0.6,
            border: unlocked ? "3px solid rgba(255,255,255,0.3)" : "none"
          }}
          onMouseEnter={(e) => {
            if (unlocked || completed) {
              e.target.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = unlocked ? "scale(1.05)" : "scale(0.95)";
          }}
        >
          <div style={{ fontSize: "1.8rem", marginBottom: 2 }}>{themeIcon}</div>
          <div style={{ fontSize: "1rem", fontWeight: 800 }}>{level.levelNumber}</div>
        </div>
      </Link>
    </>
  );

  if (levels.length === 0) {
    return (
      <Layout>
        <div style={{ 
          padding: 100, 
          textAlign: "center", 
          color: "white", 
          fontSize: "1.8rem" 
        }}>
          🎮 Loading game map...
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div style={{ padding: "20px", minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
          {/* 🔥 HEADER */}
          <div
            style={{
              position: "sticky",
              top: 20,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: "24px 32px",
              borderRadius: "24px",
              marginBottom: "40px",
              textAlign: "center",
              zIndex: 100,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            <div style={{ 
              fontSize: "1.6rem", 
              fontWeight: "bold", 
              background: "linear-gradient(135deg, #1e293b, #334155)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px"
            }}>
              {getStreakEmoji(userStats.streak)} Streak: {userStats.streak}
            </div>
            <div style={{ 
              color: "#ef4444", 
              fontSize: "1.3rem", 
              fontWeight: "600",
              marginBottom: "12px"
            }}>
              ❤️ {userStats.hearts}/5 Hearts
            </div>
            <div style={{ 
              fontSize: "2rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #10b981, #059669)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {userStats.xp.toLocaleString()} XP
            </div>
          </div>

          {/* MAP CONTAINER */}
          <div style={{ 
            position: "relative", 
            height: flatLevels.length * 130 + 300,
            maxWidth: "1000px",
            margin: "0 auto"
          }}>
            {/* PATH LINES */}
            <svg
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              {flatLevels.map((_, i) => {
                if (i === flatLevels.length - 1) return null;
                const curr = getNodePosition(i);
                const next = getNodePosition(i + 1);
                return (
                  <path
                    key={i}
                    d={`M ${curr.x} ${curr.y} 
                        Q ${(curr.x + next.x) / 2} ${(curr.y + next.y) / 2} 
                        ${next.x} ${next.y}`}
                    stroke="#60a5fa"
                    strokeWidth="20"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                );
              })}
            </svg>

            {/* 🔥 LEVEL NODES */}
            {flatLevels.map((lvl, i) => {
              const pos = getNodePosition(i);
              const unlocked = isUnlocked(lvl.materiIndex, lvl.levelIndex);
              const completed = isCompleted(lvl.id);
              const themeIcon = getThemeIcon(lvl.materiIndex);

              return (
                <div
                  key={lvl.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <LevelNode
                    level={lvl}
                    unlocked={unlocked}
                    completed={completed}
                    themeIcon={themeIcon}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Layout>

      {/* 🔥 GLOBAL LOCKED MODAL */}
      {showLockedModal && lockedLevel && (
        <div style={{
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '3rem 2.5rem',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔒</div>
            <h2 style={{ 
              color: '#1e293b', 
              margin: '0 0 1rem 0', 
              fontSize: '2rem',
              fontWeight: '800'
            }}>
              Level {lockedLevel.levelNumber} Terkunci
            </h2>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Selesaikan level sebelumnya dengan <strong>skor 80% atau lebih</strong> 
              untuk membuka akses ke level ini!
            </p>
            <div style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
              height: '8px',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: '#10b981',
                height: '8px',
                borderRadius: '4px',
                width: '80%'
              }}></div>
            </div>
            <p style={{ 
              color: '#059669', 
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              🎯 Target: 80%+ | 💎 Reward: {lockedLevel.reward_xp} XP
            </p>
            <button 
              onClick={() => {
                setShowLockedModal(false);
                setLockedLevel(null);
              }}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: '1.5rem',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
              }}
            >
              Kembali ke Map
            </button>
          </div>
        </div>
      )}
    </>
  );
}
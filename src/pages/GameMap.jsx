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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = () => {
    setIsLoading(true);
    apiGet("/game/map")
      .then((res) => {
        if (res.status) {
          console.log("✅ Loaded:", {
            levels: res.levels?.length || 0,
            levelsCount: res.levels?.flatMap(m => m.levels)?.length || 0,
            progress: res.progress?.length || 0
          });
          
          setLevels(res.levels || []);
          setProgress(res.progress || []);
          setUserStats(res.userStats || {});
          
          // 🔥 DEBUG LOG
          console.log("🔍 DEBUG MAP DATA:", {
            levels: res.levels?.slice(0, 2), // first 2 materi
            progress: res.progress?.slice(0, 5) // first 5 progress
          });
        }
      })
      .catch(err => console.error("❌ Load error:", err))
      .finally(() => setIsLoading(false));
  };

  // 🔥 FIXED UNLOCK LOGIC - 100% WORK!
  const isUnlocked = (mIdx, lIdx) => {
    // Level 1 selalu buka
    if (mIdx === 0 && lIdx === 0) return true;

    // Dalam materi: cek level sebelumnya pernah main
    if (lIdx > 0) {
      const prevLevel = levels[mIdx]?.levels?.[lIdx - 1];
      if (!prevLevel) return false;
      
      const unlocked = progress.some(p => String(p.levelId) === String(prevLevel.id));
      console.log(`🔍 Materi${mIdx+1} Level${lIdx+1}: prev=${prevLevel.id}, unlocked=${unlocked}`);
      return unlocked;
    }

    // Antar materi: semua level materi sebelumnya pernah main
    const prevMateri = levels[mIdx - 1];
    if (!prevMateri?.levels) return false;

    const unlocked = prevMateri.levels.every(lvl =>
      progress.some(p => String(p.levelId) === String(lvl.id))
    );
    
    console.log(`🔍 Materi${mIdx+1}: prevMateri=${prevMateri.materiId}, unlocked=${unlocked}`);
    return unlocked;
  };

  const isCompleted = (levelId) =>
    progress.some(p => 
      String(p.levelId) === String(levelId) && p.completed === true
    );

  const getThemeIcon = (mIdx) => {
    const themes = ["✈️", "🚀", "⚡", "🌟", "🔥", "💎"];
    return themes[mIdx % themes.length];
  };

  const getStreakEmoji = (streak) => 
    streak >= 7 ? "🔥" : streak >= 3 ? "⭐⭐" : "⭐";

  // Auto refresh
  useEffect(() => {
    let interval;
    if (progress.length > 0 && levels.length > 0) {
      interval = setInterval(loadMapData, 4000);
    }
    return () => interval && clearInterval(interval);
  }, [progress.length, levels.length]);

  // 🔥 FIXED: FLAT LEVELS MAPPING
  const flatLevels = levels.flatMap((materi, mIdx) =>
    materi.levels.map((lvl, lIdx) => ({
      ...lvl,
      materiIndex: mIdx,
      levelIndex: lIdx,
    }))
  );

  const getNodePosition = (index) => {
    const baseY = index * 120;
    const pattern = [{ x: 300, offsetY: 0 }, { x: 500, offsetY: 40 }, { x: 700, offsetY: 0 }];
    const p = pattern[index % 3];
    return { x: p.x, y: baseY + p.offsetY };
  };

  const LevelNode = ({ level, unlocked, completed, themeIcon }) => (
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
          width: 80, height: 80, borderRadius: "50%",
          background: completed
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : unlocked
            ? "linear-gradient(135deg, #f59e0b, #d97706)"
            : "linear-gradient(135deg, #9ca3af, #6b7280)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: "bold",
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
        onMouseEnter={(e) => unlocked && (e.target.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => {
          e.target.style.transform = unlocked ? "scale(1.05)" : "scale(0.95)";
        }}
      >
        <div style={{ fontSize: "1.8rem", marginBottom: 2 }}>{themeIcon}</div>
        <div style={{ fontSize: "1rem", fontWeight: 800 }}>{level.levelNumber}</div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <Layout>
        <div style={{ padding: 100, textAlign: "center", color: "white", fontSize: "1.8rem" }}>
          🎮 Loading game map...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        {/* HEADER */}
        <div style={{
          position: "sticky", top: 20, background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)", padding: "24px 32px", borderRadius: "24px",
          marginBottom: "20px", textAlign: "center", zIndex: 100,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ margin: 0, color: "#1f2937", fontSize: "2.5rem" }}>MINI GAME MAP</h1>
          
          <div style={{ 
            marginTop: "15px", 
            paddingTop: "15px", 
            borderTop: "1px solid #e5e7eb",
            display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap"
          }}>
            <button onClick={loadMapData} style={{
              padding: "8px 20px", background: "#3b82f6", color: "white",
              border: "none", borderRadius: "12px", cursor: "pointer",
              fontWeight: "600"
            }}>
              🔄 Refresh
            </button>
            <button onClick={() => {
              console.log("🔍 DEBUG FULL DATA:", { levels, progress, flatLevels });
              console.log("📊 Unlock status:", flatLevels.map(lvl => ({
                id: lvl.id,
                unlocked: isUnlocked(lvl.materiIndex, lvl.levelIndex),
                completed: isCompleted(lvl.id)
              })));
            }} style={{
              padding: "8px 20px", background: "#8b5cf6", color: "white",
              border: "none", borderRadius: "12px", cursor: "pointer",
              fontWeight: "600", fontSize: "0.9rem"
            }}>
              Debug Log
            </button>
          </div>
          
          <div style={{ marginTop: "10px", fontSize: "0.9rem", color: "#6b7280" }}>
            Progress: {progress.length}/{flatLevels.length} levels | 
            XP: {userStats.xp} | Hearts: {userStats.hearts} {getStreakEmoji(userStats.streak)}
          </div>
        </div>

        {/* MAP */}
        <div style={{ 
          position: "relative", 
          height: Math.max(flatLevels.length * 130 + 300, 600),
          maxWidth: "1000px", margin: "0 auto"
        }}>
          <svg style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
            {flatLevels.map((_, i) => {
              if (i === flatLevels.length - 1) return null;
              const curr = getNodePosition(i);
              const next = getNodePosition(i + 1);
              return (
                <path
                  key={i}
                  d={`M ${curr.x} ${curr.y} Q ${(curr.x + next.x) / 2} ${(curr.y + next.y) / 2} ${next.x} ${next.y}`}
                  stroke="#60a5fa" strokeWidth="20" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
                />
              );
            })}
          </svg>

          {flatLevels.map((lvl, i) => {
            const pos = getNodePosition(i);
            const unlocked = isUnlocked(lvl.materiIndex, lvl.levelIndex);
            const completed = isCompleted(lvl.id);
            const themeIcon = getThemeIcon(lvl.materiIndex);

            return (
              <div key={lvl.id} style={{
                position: "absolute", left: pos.x, top: pos.y,
                transform: "translate(-50%, -50%)", zIndex: 10
              }}>
                <LevelNode level={lvl} unlocked={unlocked} completed={completed} themeIcon={themeIcon} />
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {showLockedModal && lockedLevel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '3rem 2.5rem', borderRadius: '24px', textAlign: 'center',
            maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔒</div>
            <h2 style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '800' }}>
              Level {lockedLevel.levelNumber} Terkunci
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Mainkan <strong>level sebelumnya</strong> dulu untuk membuka!
            </p>
            <button onClick={() => {
              setShowLockedModal(false);
              setLockedLevel(null);
            }} style={{
              padding: '14px 32px', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '16px', fontSize: '1.1rem',
              fontWeight: '700', cursor: 'pointer'
            }}>
              Kembali
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
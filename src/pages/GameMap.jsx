import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, hearts: 5 });

  useEffect(() => {
    apiGet("/game/map").then((res) => {
      if (res.status) {
        setLevels(res.levels || []);
        setProgress(res.progress || []);
        setUserStats(res.userStats || {});
      }
    }).catch(console.error);
  }, []);

  const isUnlocked = (mIdx, lIdx) => {
    const prevMateriLevels = levels.slice(0, mIdx)
      .reduce((sum, m) => sum + (m.levels?.length || 0), 0);
    return progress.filter(p => p.completed).length >= prevMateriLevels + lIdx;
  };

  const isCompleted = (levelId) => progress.some(p => p.levelId == levelId && p.completed);

  const getStreakEmoji = (streak) => streak >= 7 ? "🔥" : "⭐";

  const LevelNode = ({ level, unlocked, completed, position }) => (
    <Link to={unlocked ? `/game/play/${level.id}` : "#"} style={{textDecoration: 'none'}}>
      <div style={{
        ...position,
        width: 70,
        height: 70,
        borderRadius: '50%',
        background: completed ? '#10b981' : unlocked ? '#f59e0b' : '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: unlocked ? 'scale(1.1)' : 'scale(1)',
        position: 'relative',
        zIndex: 20
      }}>
        {completed ? '⭐' : level.levelNumber}
      </div>
    </Link>
  );

  if (levels.length === 0) return (
    <Layout>
      <div style={{padding: 100, textAlign: 'center', color: 'white', fontSize: '1.8rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        Loading map...
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {/* STICKY HEADER - MINIMAL */}
        <div style={{
          position: 'sticky',
          top: 20,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          padding: '25px 30px',
          borderRadius: '25px',
          marginBottom: '40px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
          zIndex: 100,
          textAlign: 'center'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10}}>
            <span style={{fontSize: '2rem'}}>{getStreakEmoji(userStats.streak)}</span>
            <div>
              <div style={{fontSize: '1.4rem', fontWeight: '700'}}>Streak: {userStats.streak}</div>
              <div style={{fontSize: '1rem', color: '#6b7280'}}>❤️ {userStats.hearts}/5</div>
            </div>
          </div>
          <div style={{fontSize: '1.6rem', fontWeight: '700', color: '#1f2937'}}>
            {userStats.xp} XP
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div style={{maxWidth: '900px', margin: '0 auto', position: 'relative'}}>
          {/* ✅ PATH YANG NEMPAL & SMOOTH */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }} viewBox="0 0 900 1200">
            {levels.map((materi, mIdx) => {
              const startY = mIdx * 250;
              return (
                <g key={materi.materiId}>
                  {/* PATH KE MATERI */}
                  {mIdx > 0 && (
                    <path 
                      d={`M 450 ${startY - 100} Q 450 ${startY - 50} 450 ${startY}`} 
                      stroke="#f59e0b" 
                      strokeWidth="20" 
                      fill="none" 
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  )}
                  
                  {/* PATH ANTARA LEVELS */}
                  {materi.levels.map((_, lIdx) => {
                    const levelY = startY + 80 + (lIdx % 2 === 0 ? 0 : 60);
                    const nextLevelY = startY + 80 + ((lIdx + 1) % 2 === 0 ? 0 : 60);
                    return (
                      <path 
                        key={lIdx}
                        d={`M 300 ${levelY} Q 450 ${levelY + 30} 600 ${nextLevelY}`} 
                        stroke="#fbbf24" 
                        strokeWidth="16" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                    );
                  })}
                  
                  {/* PATH KE MATERI BERIKUTNYA */}
                  <path 
                    d={`M 450 ${startY + 200} Q 450 ${startY + 250} 450 ${startY + 300}`} 
                    stroke="#f59e0b" 
                    strokeWidth="20" 
                    fill="none" 
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </g>
              );
            })}
          </svg>

          {/* LEVEL NODES */}
          <div style={{position: 'relative', padding: '50px 20px'}}>
            {levels.map((materi, mIdx) => {
              const startY = mIdx * 250;
              
              return (
                <div key={materi.materiId} style={{marginBottom: '200px'}}>
                  {/* MATERI TITLE - MINIMAL */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '60px',
                    position: 'relative',
                    zIndex: 10
                  }}>
                    <h3 style={{
                      fontSize: '1.8rem',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: 0,
                      fontWeight: '700',
                      textShadow: 'none'
                    }}>
                      {materi.materiName}
                    </h3>
                  </div>
                  
                  {/* LEVEL CIRCLES - POSISI SMOOTH */}
                  <div style={{display: 'flex', justifyContent: 'center', gap: '80px'}}>
                    {materi.levels?.map((lvl, lIdx) => {
                      const unlocked = isUnlocked(mIdx, lIdx);
                      const completed = isCompleted(lvl.id);
                      const isEven = lIdx % 2 === 0;
                      
                      return (
                        <LevelNode
                          key={lvl.id}
                          level={lvl}
                          unlocked={unlocked}
                          completed={completed}
                          position={{
                            position: 'relative',
                            zIndex: 20,
                            top: isEven ? '0px' : '30px'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
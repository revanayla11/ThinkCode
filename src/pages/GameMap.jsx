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

  const getThemeIcon = (mIdx) => {
    const themes = ['✈️', '🚀', '⚡'];
    return themes[mIdx % themes.length];
  };

  const LevelNode = ({ level, unlocked, completed, position, themeIcon }) => (
    <Link to={unlocked ? `/game/play/${level.id}?theme=${encodeURIComponent(themeIcon)}` : "#"} style={{textDecoration: 'none'}}>
      <div style={{
        ...position,
        width: 75,
        height: 75,
        borderRadius: '50%',
        background: completed ? '#10b981' : unlocked ? '#f59e0b' : '#6b7280',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: unlocked ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{fontSize: '1.8rem', marginBottom: 2}}>{themeIcon}</div>
        <div>{level.levelNumber}</div>
      </div>
    </Link>
  );

  if (levels.length === 0) return (
    <Layout>
      <div style={{padding: 100, textAlign: 'center', color: 'white', fontSize: '1.8rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        Loading adventure map...
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
        {/* STICKY HEADER */}
        <div style={{
          position: 'sticky',
          top: 20,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          padding: '25px 35px',
          borderRadius: '25px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          zIndex: 100,
          textAlign: 'center'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10}}>
            <span style={{fontSize: '2.2rem'}}>{getStreakEmoji(userStats.streak)}</span>
            <div>
              <div style={{fontSize: '1.5rem', fontWeight: '800'}}>Streak: {userStats.streak}</div>
              <div style={{fontSize: '1.1rem', color: '#6b7280'}}>❤️ {userStats.hearts}/5</div>
            </div>
          </div>
          <div style={{fontSize: '1.8rem', fontWeight: '800', color: '#1f2937'}}>
            {userStats.xp.toLocaleString()} XP
          </div>
        </div>

        {/* MAP */}
        <div style={{maxWidth: '1000px', margin: '0 auto', position: 'relative', minHeight: '1200px'}}>
          {/* ✅ PATH NEMPAL SEMUA LEVEL */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }} viewBox="0 0 1000 2000">
            {levels.map((materi, mIdx) => {
              const startY = mIdx * 320;
              const themeIcon = getThemeIcon(mIdx);
              
              return (
                <g key={materi.materiId}>
                  {/* PATH KE MATERI */}
                  {mIdx > 0 && (
                    <path 
                      d={`M 500 ${startY - 140} Q 500 ${startY - 70} 500 ${startY}`} 
                      stroke="#3b82f6" 
                      strokeWidth="28" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  )}
                  
                  {/* PATH ANTARA LEVELS - 3 KOLOM */}
                  {materi.levels.map((_, lIdx) => {
                    const positions = [
                      {x: 300, y: startY + 100 + (lIdx * 50)},
                      {x: 500, y: startY + 80 + (lIdx * 50)},
                      {x: 700, y: startY + 120 + (lIdx * 50)}
                    ];
                    const curr = positions[lIdx % 3];
                    const nextIdx = (lIdx + 1) % 3;
                    const next = positions[nextIdx];
                    
                    return (
                      <path 
                        key={`path-${mIdx}-${lIdx}`}
                        d={`M ${curr.x} ${curr.y} Q 500 ${curr.y + 30} ${next.x} ${next.y}`} 
                        stroke="#f59e0b" 
                        strokeWidth="20" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.6"
                      />
                    );
                  })}
                  
                  {/* PATH KE MATERI BERIKUTNYA */}
                  <path 
                    d={`M 500 ${startY + 260} Q 500 ${startY + 320} 500 ${startY + 380}`} 
                    stroke="#3b82f6" 
                    strokeWidth="28" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>

          {/* LEVEL NODES */}
          <div style={{position: 'relative', padding: '60px 20px'}}>
            {levels.map((materi, mIdx) => {
              const startY = mIdx * 320;
              const themeIcon = getThemeIcon(mIdx);
              
              return (
                <div key={materi.materiId} style={{marginBottom: '280px'}}>
                  {/* MATERI TITLE */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '80px',
                    position: 'relative',
                    zIndex: 10
                  }}>
                    <h3 style={{
                      fontSize: '2rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: 0,
                      fontWeight: '800'
                    }}>
                      {themeIcon} {materi.materiName}
                    </h3>
                  </div>
                  
                  {/* LEVEL CIRCLES - 3 KOLOM */}
                  <div style={{display: 'flex', justifyContent: 'center', gap: '60px'}}>
                    {materi.levels?.map((lvl, lIdx) => {
                      const unlocked = isUnlocked(mIdx, lIdx);
                      const completed = isCompleted(lvl.id);
                      const positions = [
                        {left: '-100px', top: '0px'},
                        {left: '0px', top: '-20px'},
                        {left: '100px', top: '0px'}
                      ];
                      const pos = positions[lIdx % 3];
                      
                      return (
                        <LevelNode
                          key={lvl.id}
                          level={lvl}
                          unlocked={unlocked}
                          completed={completed}
                          position={pos}
                          themeIcon={themeIcon}
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
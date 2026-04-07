import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  console.log("🚀 GameMap COMPONENT MOUNTED!");
  
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, hearts: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 useEffect RUNNING!");
    
    setLoading(true);
    apiGet("/game/map")
      .then((res) => {
        console.log("📡 FULL API RESPONSE:", res);
        console.log("📊 LEVELS:", res.levels);
        console.log("📈 PROGRESS:", res.progress);
        console.log("⭐ USERSTATS:", res.userStats);
        
        if (res.status) {
          setLevels(res.levels || []);
          setProgress(res.progress || []);
          setUserStats(res.userStats || {});
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("💥 API ERROR:", err);
        setLoading(false);
      });
  }, []);

  console.log("🎨 RENDER - levels.length:", levels.length);

  if (loading) {
    return (
      <Layout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '2rem'
        }}>
          ⏳ Loading levels...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 40, color: 'white' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 40 }}>
          DEBUG MODE - Levels: {levels.length}
        </h1>
        
        {/* DEBUG INFO */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: 20, 
          borderRadius: 10, 
          marginBottom: 30,
          fontSize: '14px'
        }}>
          <strong>DEBUG INFO:</strong><br/>
          Levels count: {levels.length}<br/>
          Progress count: {progress.length}<br/>
          Hearts: {userStats.hearts}<br/>
          First level: {levels[0]?.materiName || 'NONE'}
        </div>

        {/* SIMPLE TEST RENDER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {levels.map((materi, mIdx) => (
            <div key={materi.materiId || mIdx} style={{ 
              border: '2px solid #fbbf24', 
              borderRadius: 20, 
              padding: 30,
              background: 'rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: 20 }}>
                📚 {materi.materiName || `Materi ${mIdx + 1}`}
              </h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {materi.levels?.map((lvl) => (
                  <div key={lvl.id} style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.4rem',
                    boxShadow: '0 10px 30px rgba(245,158,11,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    {lvl.levelNumber}
                  </div>
                )) || <p>No levels</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
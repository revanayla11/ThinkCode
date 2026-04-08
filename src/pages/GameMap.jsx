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
        if (res.status) {
          setLevels(res.levels || []);
          setProgress(res.progress || []);
          setUserStats(res.userStats || {});
        }
      })
      .catch(console.error);
  }, []);

  // ========================
  // LOGIC
  // ========================
  const isUnlocked = (mIdx, lIdx) => {
    const prevMateriLevels = levels
      .slice(0, mIdx)
      .reduce((sum, m) => sum + (m.levels?.length || 0), 0);

    return (
      progress.filter((p) => p.completed).length >=
      prevMateriLevels + lIdx
    );
  };

  const isCompleted = (levelId) =>
    progress.some((p) => p.levelId == levelId && p.completed);

  const getThemeIcon = (mIdx) => {
    const themes = ["✈️", "🚀", "⚡"];
    return themes[mIdx % themes.length];
  };

  const getStreakEmoji = (streak) => (streak >= 7 ? "🔥" : "⭐");

  // ========================
  // FLATTEN LEVELS (BIAR JADI 1 JALUR)
  // ========================
  const flatLevels = levels.flatMap((m, mIdx) =>
    m.levels.map((lvl, lIdx) => ({
      ...lvl,
      materiIndex: mIdx,
      levelIndex: lIdx,
    }))
  );

  // ========================
  // POSITION SYSTEM (ZIG-ZAG)
  // ========================
  const getNodePosition = (index) => {
    const baseY = index * 120;

    const pattern = [
      { x: 300, offsetY: 0 },
      { x: 500, offsetY: 40 },
      { x: 700, offsetY: 0 },
    ];

    const p = pattern[index % 3];

    return {
      x: p.x,
      y: baseY + p.offsetY,
    };
  };

  // ========================
  // LEVEL NODE COMPONENT
  // ========================
  const LevelNode = ({ level, unlocked, completed, themeIcon }) => (
    <Link
      to={unlocked ? `/game/play/${level.id}` : "#"}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: completed
            ? "#22c55e"
            : unlocked
            ? "#f59e0b"
            : "#9ca3af",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          boxShadow: unlocked
            ? "0 10px 25px rgba(0,0,0,0.25)"
            : "none",
          transform: unlocked ? "scale(1.1)" : "scale(1)",
          transition: "0.3s",
        }}
      >
        <div style={{ fontSize: "1.5rem" }}>{themeIcon}</div>
        <div>{level.levelNumber}</div>
      </div>
    </Link>
  );

  // ========================
  // LOADING
  // ========================
  if (levels.length === 0)
    return (
      <Layout>
        <div
          style={{
            padding: 100,
            textAlign: "center",
            color: "white",
            fontSize: "1.8rem",
          }}
        >
          Loading map...
        </div>
      </Layout>
    );

  // ========================
  // UI
  // ========================
  return (
    <Layout>
      <div
        style={{
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            position: "sticky",
            top: 20,
            background: "rgba(255,255,255,0.95)",
            padding: "20px",
            borderRadius: "20px",
            marginBottom: "40px",
            textAlign: "center",
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {getStreakEmoji(userStats.streak)} Streak: {userStats.streak}
          </div>
          <div>❤️ {userStats.hearts}/5</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {userStats.xp} XP
          </div>
        </div>

        {/* MAP */}
        <div
          style={{
            position: "relative",
            height: flatLevels.length * 120 + 200,
          }}
        >
          {/* PATH */}
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
                      Q ${(curr.x + next.x) / 2} ${
                    (curr.y + next.y) / 2
                  }
                      ${next.x} ${next.y}`}
                  stroke="#60a5fa"
                  strokeWidth="18"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              );
            })}
          </svg>

          {/* NODES */}
          {flatLevels.map((lvl, i) => {
            const pos = getNodePosition(i);
            const unlocked = isUnlocked(
              lvl.materiIndex,
              lvl.levelIndex
            );
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
  );
}
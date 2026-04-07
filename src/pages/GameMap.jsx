import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { apiGet } from "../services/api";
import Layout from "../components/Layout";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const Container = styled.div`
  font-family: 'Roboto', sans-serif;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.h1`
  text-align: center;
  font-size: 3rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 50px;
`;

const MateriSection = styled.div`
  margin-bottom: 80px;
  animation: ${bounce} 1s ease-out;
`;

const MateriTitle = styled.h3`
  text-align: center;
  font-size: 2rem;
  color: white;
  margin-bottom: 40px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const LevelsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
`;

const LevelNode = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: ${props => props.unlocked ? 'pointer' : 'default'};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);

  ${props => props.completed && `
    background: linear-gradient(135deg, #4ade80, #22c55e);
    box-shadow: 0 0 30px rgba(74, 222, 128, 0.6);
  `}

  ${props => props.unlocked && !props.completed && `
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  `}

  ${props => !props.unlocked && `
    background: linear-gradient(135deg, #9ca3af, #6b7280);
    opacity: 0.5;
  `}

  &:hover {
    ${props => props.unlocked && `
      transform: scale(1.15) rotate(360deg);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    `}
  }
`;

const LevelNumber = styled.div`
  font-size: 26px;
  color: white;
  z-index: 2;
  margin-bottom: 2px;
`;

const LevelLabel = styled.div`
  position: absolute;
  bottom: -35px;
  font-size: 11px;
  color: white;
  font-weight: 600;
  text-align: center;
  width: 110px;
`;

const LockIcon = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 28px;
  height: 28px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  font-weight: bold;
`;

const gameTypeIcons = {
  quiz: '🧠',
  flashcard: '📝',
  memory: '🧩',
  typing: '⌨️',
  sort: '🔄',
  hangman: '😵'
};

export default function GameMap() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [levelsRes, progressRes] = await Promise.all([
        apiGet("/game/map"),
        apiGet("/game/progress")
      ]);
      
      if (levelsRes.status) setLevels(levelsRes.levels);
      if (progressRes.status) setProgress(progressRes.progress);
    } catch (err) {
      console.error(err);
    }
  };

  const materiList = Object.values(
    levels.reduce((acc, lvl) => {
      if (!acc[lvl.materiId]) {
        acc[lvl.materiId] = {
          materiId: lvl.materiId,
          materiName: lvl.materiName,
          levels: []
        };
      }
      acc[lvl.materiId].levels.push(lvl);
      return acc;
    }, {})
  ).sort((a, b) => a.materiId - b.materiId);

  const isCompleted = (levelId) => {
    return progress.some(p => p.levelId === Number(levelId) && p.completed);
  };

  const isUnlocked = (materiIndex, levelIndex) => {
    if (materiIndex === 0 && levelIndex === 0) return true;

    if (levelIndex === 0) {
      const prevMateriLevels = materiList[materiIndex - 1]?.levels || [];
      return prevMateriLevels.every(l => isCompleted(l.id));
    }

    const prevLevel = materiList[materiIndex].levels[levelIndex - 1];
    return isCompleted(prevLevel.id);
  };

  const handleLevelClick = (levelId) => {
    navigate(`/game/play/${levelId}`);
  };

  return (
    <Layout>
      <Container>
        <Header>🎮 Mini Games Collection</Header>

        {materiList.map((materi, mIdx) => (
          <MateriSection key={materi.materiId}>
            <MateriTitle>📚 {materi.materiName}</MateriTitle>
            
            <LevelsContainer>
              {materi.levels.map((lvl, lIdx) => {
                const unlocked = isUnlocked(mIdx, lIdx);
                const completed = isCompleted(lvl.id);

                return (
                  <div key={lvl.id} style={{ position: 'relative' }}>
                    {!unlocked && <LockIcon>🔒</LockIcon>}
                    <LevelNode
                      unlocked={unlocked}
                      completed={completed}
                      onClick={unlocked ? () => handleLevelClick(lvl.id) : undefined}
                      title={!unlocked ? "Selesaikan level sebelumnya" : lvl.title}
                    >
                      <LevelNumber>{lvl.levelNumber}</LevelNumber>
                      <div style={{ fontSize: '14px', marginTop: '2px' }}>
                        {gameTypeIcons[lvl.type] || '🎮'}
                      </div>
                      <LevelLabel>{lvl.type?.toUpperCase()}</LevelLabel>
                    </LevelNode>
                  </div>
                );
              })}
            </LevelsContainer>
          </MateriSection>
        ))}
      </Container>
    </Layout>
  );
}
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
  width: 80px;
  height: 80px;
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

  &::after {
    content: '${props => props.gameTypeIcon}';
    font-size: 20px;
    margin-bottom: 2px;
  }
`;

const LevelNumber = styled.div`
  font-size: 24px;
  color: white;
  z-index: 2;
`;

const LevelLabel = styled.div`
  position: absolute;
  bottom: -30px;
  font-size: 12px;
  color: white;
  font-weight: 600;
  text-align: center;
  width: 100px;
`;

const LockIcon = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  font-weight: bold;
`;

export default function GameMap() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    apiGet("/game/map").then(res => {
      if (res.status) {
        setLevels(res.levels);
        setProgress(res.progress);
      }
    });
  }, []);

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
    const found = progress.find(p => p.levelId === Number(levelId));
    return found && Number(found.completed) === 1;
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

  const gameTypeIcons = {
    quiz: '🧠',
    flashcard: '📝',
    memory: '🧩',
    typing: '⌨️',
    sort: '🔄'
  };

  const handleLevelClick = (levelId) => {
    navigate(`/game/play/${levelId}`);
  };

  return (
    <Layout>
      <Container>
        <Header>🎮 Mini Games</Header>

        {materiList.map((materi, mIdx) => (
          <MateriSection key={materi.materiId}>
            <MateriTitle>{materi.materiName}</MateriTitle>
            
            <LevelsContainer>
              {materi.levels.map((lvl, lIdx) => {
                const unlocked = isUnlocked(mIdx, lIdx);
                const completed = isCompleted(lvl.id);

                return (
                  <div key={lvl.id} style={{ position: 'relative' }}>
                    {!unlocked && (
                      <LockIcon>🔒</LockIcon>
                    )}
                    <LevelNode
                      unlocked={unlocked}
                      completed={completed}
                      gameTypeIcon={gameTypeIcons[lvl.type] || '🎮'}
                      onClick={unlocked ? () => handleLevelClick(lvl.id) : undefined}
                    >
                      <LevelNumber>{lvl.levelNumber}</LevelNumber>
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
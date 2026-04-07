import React from 'react';
import { motion } from 'react';

const GameCard = ({ game, onClick }) => {
  return (
    <motion.div
      className="game-card"
      onClick={onClick}
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="game-icon">
        <i className={`fas fa-${game.icon || 'question-circle'}`}></i>
      </div>
      <h3>{game.title}</h3>
      <p>{game.description}</p>
      <div className="reward">
        <span>{game.xp_reward} XP</span>
        <span>{game.badge_name}</span>
      </div>
    </motion.div>
  );
};

export default GameCard;
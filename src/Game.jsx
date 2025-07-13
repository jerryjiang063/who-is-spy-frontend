// who-is-spy-frontend/src/Game.jsx
import React from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { isFigLang } from './socket';

export default function Game({ word, role, visible, onNext }) {
  // 词语永远展示
  const displayWord = word;

  // 身份由 visible 决定
  const displayRole = visible
    ? (role === 'spy' ? (isFigLang ? 'Spy' : '卧底') : (isFigLang ? 'Civilian' : '平民'))
    : (isFigLang ? 'Hidden' : '保密');

  const handleStartVoting = () => {
    console.log('Start voting button clicked');
    onNext();
  };

  return (
    <div className="card-center">
      <h2 className="text-3xl mb-6">{isFigLang ? "Game in Progress" : "游戏进行中"}</h2>
      <div className="bg-white/50 rounded-xl p-4 mb-6 w-full max-w-md">
        <div className="mb-4 text-xl font-bold text-center">
          {displayWord && (isFigLang ? `Your word: ${displayWord}` : `你的词语：${displayWord}`)}
        </div>
        <div className="mb-4 text-xl font-bold text-center">
          {isFigLang ? `Your identity: ${displayRole}` : `你的身份：${displayRole}`}
        </div>
        
        <div className="text-center mb-4 text-gray-700">
          {isFigLang 
            ? "After everyone has described their word, click the button below to start voting."
            : "在所有人都描述完自己的词语后，点击下方按钮开始投票。"
          }
        </div>
        
        <button 
          onClick={handleStartVoting}
          className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <AiOutlinePlayCircle className="mr-2" /> {isFigLang ? "Start Voting" : "开始投票"}
        </button>
      </div>
    </div>
  );
}

// who-is-spy-frontend/src/Game.jsx
import React from 'react';
// Icons no longer needed

export default function Game({ word, role, visible }) {
  // 词语永远展示
  const displayWord = word;

  // 身份由 visible 决定
  const displayRole = visible
    ? (role === 'spy' ? '卧底' : '平民')
    : '保密';

  return (
    <div className="card-center min-h-screen w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">游戏进行中</h2>
      <div className="mb-8 text-2xl font-bold">{displayWord && `你的词语：${displayWord}`}</div>
      <div className="mb-8 text-2xl font-bold">{`你的身份：${displayRole}`}</div>
    </div>
  );
}

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
    <div className="card-center fadein text-center">
      <div className="space-y-8 w-full text-center">
        <div>
          <h3 className="text-2xl font-bold text-sky-500 mb-4">你的词语</h3>
          <p className="text-4xl font-black text-sky-500 mb-2">{displayWord}</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-sky-500 mb-4">你的身份</h3>
          <p className={`text-3xl font-black ${role === 'spy' && visible ? 'text-red-400' : 'text-sky-500'}`}>{displayRole}</p>
        </div>
      </div>
    </div>
  );
}

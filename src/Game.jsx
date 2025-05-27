// who-is-spy-frontend/src/Game.jsx
import React from 'react';
import { DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Game({ word, role, visible }) {
  // 词语永远展示
  const displayWord = word;

  // 身份由 visible 决定
  const displayRole = visible
    ? (role === 'spy' ? '卧底' : '平民')
    : '保密';

  return (
    <div className="card-center animate-fade-in text-center">
      <div className="space-y-6 w-full text-center">
        <div>
          <h3 className="title text-center">
            <DocumentTextIcon className="icon-xxs" />
            你的词语
          </h3>
          <p className="text-3xl font-bold text-primary text-center">{displayWord}</p>
        </div>
        <div>
          <h3 className="title text-center">
            <UserCircleIcon className="icon-xxs" />
            你的身份
          </h3>
          <p className={`text-2xl font-semibold text-center ${role === 'spy' && visible ? 'text-destructive' : ''}`}>
            {displayRole}
          </p>
        </div>
      </div>
    </div>
  );
}

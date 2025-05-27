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
    <div className="card animate-fade-in">
      <div className="p-6 space-y-6 text-center">
        <div>
          <h3 className="title mb-4">
            <DocumentTextIcon className="icon-md" />
            你的词语
          </h3>
          <p className="text-2xl font-bold text-primary">{displayWord}</p>
        </div>
        
        <div>
          <h3 className="title mb-4">
            <UserCircleIcon className="icon-md" />
            你的身份
          </h3>
          <p className={`text-xl font-semibold ${role === 'spy' && visible ? 'text-destructive' : ''}`}>
            {displayRole}
          </p>
        </div>
      </div>
    </div>
  );
}

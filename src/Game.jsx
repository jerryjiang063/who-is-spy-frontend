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
    <div className="p-8 card max-w-md mx-auto animate-fade-in">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-primary" />
            你的词语：
          </h3>
          <p className="text-3xl font-bold text-primary">{displayWord}</p>
        </div>
        
        <div>
          <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
            <UserCircleIcon className="h-6 w-6 text-primary" />
            你的身份：
          </h3>
          <p className={`text-2xl font-semibold ${role === 'spy' && visible ? 'text-destructive' : ''}`}>
            {displayRole}
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { UserMinusIcon, HandRaisedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import socket from './socket';

export default function Vote({ roomId, players }) {
  const [target, setTarget] = useState('');
  // 只让存活的玩家可以被投
  const alivePlayers = players.filter(p => p.alive);

  const submit = () => {
    socket.emit('submit-vote', {
      roomId,
      fromId: socket.id,
      toId: target || 'abstain'
    });
  };

  return (
    <div className="animate-fade-in text-center w-full">
      <h3 className="title justify-center">
        <UserMinusIcon className="icon-lg text-primary-hsl" />
        投票淘汰一名玩家
      </h3>
      <div className="w-full text-center space-y-4 mt-6">
        <div className="space-y-3 mb-6">
          {alivePlayers.map(p => (
            <label
              key={p.id}
              className={`flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 w-full text-center shadow-md border
                ${target === p.id 
                  ? 'bg-primary/20 border-primary ring-2 ring-primary text-primary-foreground' 
                  : 'bg-white/30 border-white/50 hover:bg-white/50'
                }`}
            >
              <input
                type="radio"
                name="vote"
                value={p.id}
                onChange={() => setTarget(p.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-center gap-3 text-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${target === p.id ? 'border-primary bg-primary' : 'border-muted-foreground bg-white/50'}
                `}>
                  {target === p.id && <div className="w-2 h-2 rounded-full bg-primary-foreground transition-all duration-200" />}
                </div>
                <span className={`text-center font-medium ${target === p.id ? 'text-primary-foreground': 'text-foreground'}`}>{p.name}</span>
                <span className={`text-sm ${target === p.id ? 'text-blue-100': 'text-muted-foreground'}`}>({p.id.slice(-4)})</span>
              </div>
            </label>
          ))}
          <label
            className={`flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 w-full text-center shadow-md border
            ${target === 'abstain' 
              ? 'bg-secondary/20 border-secondary ring-2 ring-secondary text-secondary-foreground' 
              : 'bg-white/30 border-white/50 hover:bg-white/50'
            }`}
          >
            <input
              type="radio"
              name="vote"
              value="abstain"
              onChange={() => setTarget('abstain')}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-3 text-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${target === 'abstain' ? 'border-secondary-foreground bg-secondary-foreground' : 'border-muted-foreground bg-white/50'}
                `}>
                  {target === 'abstain' && <div className="w-2 h-2 rounded-full bg-secondary transition-all duration-200" />}
                </div>
              <span className={`flex items-center gap-2 font-medium ${target === 'abstain' ? 'text-secondary-foreground': 'text-foreground'}`}>
                <HandRaisedIcon className="icon-md" />
                弃权
              </span>
            </div>
          </label>
        </div>
        <button
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          onClick={submit}
          disabled={!target}
        >
          <CheckCircleIcon className="icon-md" />
          提交投票
        </button>
      </div>
    </div>
  );
}

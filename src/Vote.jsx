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
    <div className="max-w-md mx-auto p-8 card animate-fade-in">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <UserMinusIcon className="h-7 w-7 text-primary" />
        投票：请选择要淘汰的玩家
      </h3>
      
      <div className="space-y-3 mb-6">
        {alivePlayers.map(p => (
          <label
            key={p.id}
            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
              target === p.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <input
              type="radio"
              name="vote"
              value={p.id}
              onChange={() => setTarget(p.id)}
              className="sr-only"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                target === p.id ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {target === p.id && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
              <span className="flex-1">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.id.slice(-4)}</span>
            </div>
          </label>
        ))}
        
        <label
          className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
            target === 'abstain' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary/50 hover:bg-secondary'
          }`}
        >
          <input
            type="radio"
            name="vote"
            value="abstain"
            onChange={() => setTarget('abstain')}
            className="sr-only"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              target === 'abstain' ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {target === 'abstain' && <div className="w-3 h-3 rounded-full bg-primary" />}
            </div>
            <span className="flex-1 flex items-center gap-2">
              <HandRaisedIcon className="h-5 w-5 text-muted-foreground" />
              弃权
            </span>
          </div>
        </label>
      </div>

      <button
        className="btn btn-primary w-full btn-lg flex items-center justify-center gap-2"
        onClick={submit}
      >
        <CheckCircleIcon className="h-5 w-5" />
        提交投票
      </button>
    </div>
  );
}

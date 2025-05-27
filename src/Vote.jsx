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
    <div className="card-center animate-fade-in text-center">
      <h3 className="title text-center">
        <UserMinusIcon className="icon-xxs" />
        投票：请选择要淘汰的玩家
      </h3>
      <div className="w-full">
        <div className="space-y-3 mb-6">
          {alivePlayers.map(p => (
            <label
              key={p.id}
              className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-colors w-full text-center ${
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
              <div className="flex items-center gap-3 text-center">
                <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                  target === p.id ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {target === p.id && <div className="w-1 h-1 rounded-full bg-primary" />}
                </div>
                <span>{p.name}</span>
                <span className="text-sm text-muted-foreground">({p.id.slice(-4)})</span>
              </div>
            </label>
          ))}
          <label
            className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-colors w-full text-center ${
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
            <div className="flex items-center gap-3 text-center">
              <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                target === 'abstain' ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {target === 'abstain' && <div className="w-1 h-1 rounded-full bg-primary" />}
              </div>
              <span className="flex items-center gap-2">
                <HandRaisedIcon className="icon-xxs text-muted-foreground" />
                弃权
              </span>
            </div>
          </label>
        </div>
        <button
          className="btn btn-primary w-full btn-lg flex items-center justify-center gap-2 text-center"
          onClick={submit}
        >
          <CheckCircleIcon className="icon-xxs" />
          提交投票
        </button>
      </div>
    </div>
  );
}

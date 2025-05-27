import React, { useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
// Icons no longer needed
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
    <div className="card-center fadein text-center">
      <h3 className="text-2xl font-bold text-sky-500 mb-8">投票：请选择要淘汰的玩家</h3>
      <div className="w-full text-center">
        <div className="space-y-3 mb-6">
          {alivePlayers.map(p => (
            <label
              key={p.id}
              className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-colors w-full text-center font-bold text-lg ${
                target === p.id ? 'bg-sky-100 ring-2 ring-sky-300' : 'bg-white/40 hover:bg-sky-50'
              }`}
            >
              <input
                type="radio"
                name="vote"
                value={p.id}
                onChange={() => setTarget(p.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-center gap-2 text-center">
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                  target === p.id ? 'border-sky-500' : 'border-sky-300'
                }`}>
                  {target === p.id && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                </div>
                <span className="text-center font-bold text-sky-500">{p.name}</span>
                <span className="text-sm text-sky-400 text-center">({p.id.slice(-4)})</span>
              </div>
            </label>
          ))}
          <label
            className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-colors w-full text-center font-bold text-lg ${
              target === 'abstain' ? 'bg-sky-100 ring-2 ring-sky-300' : 'bg-white/40 hover:bg-sky-50'
            }`}
          >
            <input
              type="radio"
              name="vote"
              value="abstain"
              onChange={() => setTarget('abstain')}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-2 text-center">
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                target === 'abstain' ? 'border-sky-500' : 'border-sky-300'
              }`}>
                {target === 'abstain' && <div className="w-2 h-2 rounded-full bg-sky-500" />}
              </div>
              <span className="text-center">弃权</span>
            </div>
          </label>
        </div>
        <button
          className="btn btn-primary w-full btn-lg justify-center text-center"
          onClick={submit}
        >
          <AiOutlineCheckCircle className="mr-2 text-2xl" /> 提交投票
        </button>
      </div>
    </div>
  );
}

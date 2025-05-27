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
    <div className="card-center min-h-screen w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">投票</h2>
      <div className="mb-8 text-2xl font-bold">请选择你怀疑的卧底：</div>
      <div className="flex flex-col gap-4 w-full max-w-md items-center">
        {alivePlayers.map((p) => (
          <button key={p.id} className="w-full" onClick={() => setTarget(p.id)}>{p.name}</button>
        ))}
        <button
          className={`w-full ${target === 'abstain' ? 'bg-sky-100 ring-2 ring-sky-300' : 'bg-white/40 hover:bg-sky-50'}`}
          onClick={() => setTarget('abstain')}
        >
            弃权
        </button>
      </div>
      <button
        className="w-full mt-8 btn btn-primary btn-lg justify-center text-center"
        onClick={submit}
      >
        <AiOutlineCheckCircle className="mr-2 text-2xl" /> 提交投票
      </button>
    </div>
  );
}

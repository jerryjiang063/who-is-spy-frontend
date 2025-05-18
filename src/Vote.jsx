import React, { useState } from 'react';
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
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h3 className="text-xl mb-4">投票：请选择要淘汰的玩家</h3>
      <ul className="list-disc pl-5 mb-4">
        {alivePlayers.map(p => (
          <li key={p.id} className="mb-2">
            <label>
              <input
                type="radio"
                name="vote"
                value={p.id}
                onChange={() => setTarget(p.id)}
                className="mr-2"
              />
              {p.name} ({p.id.slice(-4)})
            </label>
          </li>
        ))}
        <li className="mb-2">
          <label>
            <input
              type="radio"
              name="vote"
              value="abstain"
              onChange={() => setTarget('abstain')}
              className="mr-2"
            />
            弃权
          </label>
        </li>
      </ul>
      <button
        className="w-full bg-blue-500 text-white p-2 rounded"
        onClick={submit}
      >
        提交投票
      </button>
    </div>
  );
}

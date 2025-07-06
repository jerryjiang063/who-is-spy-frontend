import React, { useState } from 'react';
import { AiOutlineCheckCircle, AiOutlineUser } from 'react-icons/ai';
import { isFigLang } from './socket';

export default function Vote({ socket, roomId, players, myId }) {
  const [target, setTarget] = useState('');
  
  const submit = () => {
    socket.emit('submit-vote', {
      roomId,
      fromId: myId,
      toId: target || 'abstain'
    });
  };

  return (
    <div className="card-center">
      <h2 className="text-3xl mb-6">{isFigLang ? "Voting Phase" : "投票环节"}</h2>
      <div className="bg-white/50 rounded-xl p-4 mb-6 w-full max-w-md">
        <div className="mb-4 text-xl font-bold text-center">
          {isFigLang ? "Please select who you suspect is the spy:" : "请选择你怀疑的卧底："}
        </div>
        
        <div className="space-y-2 mb-6">
          {players.map((p) => (
            <button 
              key={p.id} 
              className={`w-full flex items-center justify-between p-3 rounded-lg ${
                target === p.id ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-white/80 hover:bg-blue-50'
              }`}
              onClick={() => setTarget(p.id)}
              disabled={p.id === myId}
            >
              <div className="flex items-center">
                <AiOutlineUser className="mr-2" />
                <span>{p.name}</span>
                {p.id === myId && <span className="ml-2 text-gray-500">
                  {isFigLang ? "(yourself)" : "(你自己)"}
                </span>}
              </div>
              {target === p.id && <AiOutlineCheckCircle className="text-blue-500" />}
            </button>
          ))}
          
          <button
            className={`w-full p-3 rounded-lg ${
              target === 'abstain' ? 'bg-gray-200 ring-2 ring-gray-300' : 'bg-white/80 hover:bg-gray-100'
            }`}
            onClick={() => setTarget('abstain')}
          >
            {isFigLang ? "Abstain" : "弃权"}
          </button>
        </div>
        
        <button
          className="w-full flex items-center justify-center"
          onClick={submit}
          disabled={!target}
        >
          <AiOutlineCheckCircle className="mr-2" /> {isFigLang ? "Submit Vote" : "提交投票"}
        </button>
      </div>
    </div>
  );
}

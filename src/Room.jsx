import React, { useState, useEffect } from 'react';
import socket from './socket';
import WordListEditor from './WordListEditor';
import Game from './Game';
import Vote from './Vote';

export default function Room() {
  const [roomId,  setRoomId]   = useState('');
  const [name,    setName]     = useState('');
  const [room,    setRoom]     = useState({ host:null, listName:'default', players:[] });
  const [myWord,  setMyWord]   = useState('');
  const [myRole,  setMyRole]   = useState('');
  const [visible, setVisible]  = useState(false);
  const [phase,   setPhase]    = useState('lobby');
  const [summary, setSummary]  = useState(null);

  const spyCount = 1;
  const isHost  = socket.id === room.host;

  useEffect(()=>{
    socket.on('room-updated', data=>{
      setRoom(data);
      setPhase('lobby');
      setSummary(null);
    });
    socket.on('deal-words', ({ word, role })=>{
      setMyWord(word);
      setMyRole(role);
      setPhase('playing');
    });
    socket.on('visibility-updated', ({ visible })=>{
      setVisible(visible);
    });
    socket.on('vote-tie', ()=>{
      alert('本轮平局或弃权多数，重投！');
      setPhase('voting');
    });
    socket.on('spy-eliminated', ({ eliminatedId })=>{
      alert('卧底被票出，平民胜利！');
      setPhase('finished');
    });
    socket.on('round-summary', ({ summary })=>{
      setSummary(summary);
      setPhase('eliminated');
    });
    socket.on('start-next-vote', ()=>{
      alert('本轮淘汰的是平民，游戏继续！');
      setPhase('voting');
    });
    socket.on('spy-win', ()=>{
      alert('卧底胜利！');
      setPhase('finished');
    });
    return ()=>socket.off();
  },[]);

  const createRoom    = ()=>socket.emit('create-room',{ roomId,name });
  const joinRoom      = ()=>socket.emit('join-room'  ,{ roomId,name });
  const changeList    = ln=>socket.emit('change-list',{ roomId,listName:ln });
  const resetGame     = ()=>{ setPhase('lobby'); socket.emit('reset-game',{ roomId }); };
  const startGame     = ()=>{ setSummary(null); socket.emit('start-game',{ roomId,spyCount }); };
  const toggleVis     = ()=>socket.emit('toggle-visibility',{ roomId,visible:!visible });

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {phase === 'lobby' && (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
          <h2 className="text-xl mb-4">在线《谁是卧底》</h2>
          <WordListEditor current={room.listName} onSelectList={changeList}/>
          <div className="flex mb-4">
            <input
              className="flex-1 border p-2 mr-2"
              placeholder="房间ID" value={roomId}
              onChange={e=>setRoomId(e.target.value)}
            />
            <input
              className="flex-1 border p-2"
              placeholder="昵称" value={name}
              onChange={e=>setName(e.target.value)}
            />
          </div>
          <div className="flex mb-4">
            <button className="flex-1 bg-blue-500 text-white p-2 mr-2" onClick={createRoom}>
              创建房间
            </button>
            <button className="flex-1 bg-green-500 text-white p-2" onClick={joinRoom}>
              加入房间
            </button>
          </div>
          {isHost && (
            <>
              <button className="w-full bg-red-500 text-white p-2 mb-2" onClick={startGame}>
                开始游戏
              </button>
              <button className="w-full bg-yellow-500 text-white p-2" onClick={toggleVis}>
                {visible ? '隐藏身份' : '显示身份'}
              </button>
            </>
          )}
          <h3 className="font-medium mt-4">玩家列表：</h3>
          <ul className="list-disc pl-5">
            {room.players.map(p=>(
              <li key={p.id}>{p.name} ({p.id.slice(-4)})</li>
            ))}
          </ul>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <Game word={myWord} role={myRole} visible={visible}/>
          <div className="max-w-md mx-auto mt-4 text-center">
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded"
              onClick={()=>setPhase('voting')}
            >
              开始投票
            </button>
          </div>
        </>
      )}

      {phase === 'voting' && (
        <Vote roomId={roomId} players={room.players}/>
      )}

      {phase === 'eliminated' && (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
          <h2 className="text-2xl mb-4 text-red-500">你已被淘汰</h2>
          <h3 className="text-xl mb-2">本轮角色 & 词语</h3>
          <ul className="list-disc pl-5 mb-6">
            {summary && Object.entries(summary).map(([pid,{word,role}])=>(
              <li key={pid}>
                {role==='spy'?'【卧底】':'【平民】'} {word} — {room.players.find(p=>p.id===pid)?.name}
              </li>
            ))}
          </ul>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={resetGame}
          >
            返回大厅
          </button>
        </div>
      )}

      {phase === 'finished' && (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10 text-center">
          <h1 className="text-3xl mb-6">游戏结束 🎉</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={resetGame}
          >
            返回大厅
          </button>
        </div>
      )}
    </div>
  );
}

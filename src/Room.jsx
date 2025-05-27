import React, { useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineUser, AiOutlineHome, AiOutlineCheckCircle, AiOutlineEye, AiOutlineEyeInvisible, AiOutlinePlayCircle } from 'react-icons/ai';
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
    <div className="card-center min-h-screen w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">房间号：{roomId}</h2>
      <div className="mb-8">
        <div className="text-2xl font-bold mb-2">玩家列表：</div>
        <ul className="text-xl font-bold text-sky-600">
          {room.players.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>
      {phase === 'lobby' && (
        <div className="space-y-4 w-full">
          <WordListEditor current={room.listName} onSelectList={changeList}/>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              className="btn btn-primary btn-lg justify-center w-full text-center"
              onClick={createRoom}
            >
              <AiOutlinePlus className="mr-2 text-2xl" /> 创建房间
            </button>
            <button 
              className="btn btn-secondary btn-lg justify-center w-full text-center"
              onClick={joinRoom}
            >
              <AiOutlineUser className="mr-2 text-2xl" /> 加入房间
            </button>
          </div>
          {isHost && (
            <div className="space-y-3 w-full">
              <button 
                className="btn btn-primary w-full btn-lg justify-center text-center"
                onClick={startGame}
              >
                <AiOutlinePlayCircle className="mr-2 text-2xl" /> 开始游戏
              </button>
              <button 
                className="btn btn-secondary w-full btn-lg justify-center text-center"
                onClick={toggleVis}
              >
                {visible ? <><AiOutlineEyeInvisible className="mr-2 text-2xl" /> 隐藏身份</> : <><AiOutlineEye className="mr-2 text-2xl" /> 显示身份</>}
              </button>
            </div>
          )}
        </div>
      )}
      {phase === 'playing' && (
        <div className="card-center fadein">
          <Game word={myWord} role={myRole} visible={visible}/>
          <div className="mt-6 text-center w-full">
            <button
              className="btn btn-primary btn-lg justify-center w-full text-center"
              onClick={()=>setPhase('voting')}
            >
              <AiOutlineCheckCircle className="mr-2 text-2xl" /> 开始投票
            </button>
          </div>
        </div>
      )}
      {phase === 'voting' && (
        <div className="card-center fadein">
          <Vote roomId={roomId} players={room.players}/>
        </div>
      )}
      {phase === 'eliminated' && (
        <div className="card-center fadein">
          <h2 className="title text-destructive text-center">你已被淘汰</h2>
          <div className="w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-center">本轮角色 & 词语</h3>
            <div className="space-y-2 mb-6">
              {summary && Object.entries(summary).map(([pid,{word,role}])=>(
                <div 
                  key={pid}
                  className={`p-3 rounded-md text-center ${
                    role === 'spy' ? 'bg-sky-100' : 'bg-white/40'
                  }`}
                >
                  <span className={`text-center font-bold ${role === 'spy' ? 'text-red-400' : 'text-sky-500'}`}>
                    {role === 'spy' ? '【卧底】' : '【平民】'}
                  </span>
                  <span className="text-center">{' '}{word} — {room.players.find(p=>p.id===pid)?.name}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary w-full btn-lg justify-center text-center"
              onClick={resetGame}
            >
              <AiOutlineHome className="mr-2 text-2xl" /> 返回大厅
            </button>
          </div>
        </div>
      )}
      {phase === 'finished' && (
        <div className="card-center fadein">
          <h1 className="title text-center">游戏结束 🎉</h1>
          <div className="w-full text-center">
            <button
              className="btn btn-primary btn-lg justify-center w-full text-center"
              onClick={resetGame}
            >
              <AiOutlineHome className="mr-2 text-2xl" /> 返回大厅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

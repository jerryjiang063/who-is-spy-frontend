import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  UserPlusIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
  ArrowPathIcon // For Reset Game, more indicative of a refresh/reset
} from '@heroicons/react/24/outline';
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
    <div className="page-center text-center-all w-full">
      {phase === 'lobby' && (
        <div className="card p-6 md:p-8 animate-fade-in text-center-all w-full">
          <h2 className="title">
            <UserGroupIcon className="icon-lg text-primary-hsl" /> 
            在线《谁是卧底》
          </h2>
          <WordListEditor current={room.listName} onSelectList={changeList}/>
          <div className="space-y-5 w-full mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <input
                className="input"
                placeholder="房间ID"
                value={roomId}
                onChange={e=>setRoomId(e.target.value)}
              />
              <input
                className="input"
                placeholder="昵称"
                value={name}
                onChange={e=>setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                onClick={createRoom}
              >
                <UserPlusIcon className="icon-md" />
                创建房间
              </button>
              <button 
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
                onClick={joinRoom}
              >
                <UserPlusIcon className="icon-md" /> {/* Corrected to UserPlusIcon for joining as well, or can be UsersIcon */} 
                加入房间
              </button>
            </div>
            {isHost && (
              <div className="space-y-4 w-full pt-4">
                <button 
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  onClick={startGame}
                >
                  <PlayIcon className="icon-md" />
                  开始游戏
                </button>
                <button 
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={toggleVis}
                >
                  {visible ? <EyeSlashIcon className="icon-md" /> : <EyeIcon className="icon-md" />}
                  {visible ? '隐藏身份' : '显示身份'}
                </button>
              </div>
            )}
            <div className="mt-8 w-full">
              <h3 className="text-xl font-semibold mb-4 text-center">玩家列表</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {room.players.length > 0 ? room.players.map(p=>(
                  <div 
                    key={p.id}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/20 text-center shadow"
                  >
                    {/* Optionally add a generic user icon here if desired */}
                    <span className="text-center font-medium">{p.name}</span>
                    <span className="text-sm text-muted-foreground text-center">
                      ({p.id.slice(-4)})
                    </span>
                  </div>
                )) : <p className="text-muted-foreground p-4">等待玩家加入...</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {phase === 'playing' && (
        <div className="card p-6 md:p-8 animate-fade-in text-center-all w-full">
          <Game word={myWord} role={myRole} visible={visible}/>
          <div className="mt-8 text-center w-full">
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              onClick={()=>setPhase('voting')}
            >
               <PlayIcon className="icon-md transform rotate-90" /> {/* Using PlayIcon rotated for "next step" feel */}
              开始投票
            </button>
          </div>
        </div>
      )}
      {phase === 'voting' && (
        <div className="card p-6 md:p-8 animate-fade-in text-center-all w-full">
          <Vote roomId={roomId} players={room.players}/>
        </div>
      )}
      {phase === 'eliminated' && (
        <div className="card p-6 md:p-8 animate-fade-in text-center-all w-full">
          <h2 className="title text-destructive"><span className="text-center">你已被淘汰!</span></h2>
          <div className="w-full text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-center">本轮词语和身份</h3>
              <div className="space-y-2 text-left">
                {summary && Object.entries(summary).map(([pid,{word,role}])=>(
                  <div 
                    key={pid}
                    className={`p-3 rounded-lg text-center shadow ${
                      role === 'spy' ? 'bg-destructive/10' : 'bg-white/20'
                    }`}
                  >
                    <span className={`font-medium ${role === 'spy' ? 'text-destructive' : 'text-primary-hsl'}`}>
                      {role === 'spy' ? '【卧底】' : '【平民】'}
                    </span>
                    <span className="mx-2">-</span>
                    <span className="font-medium">{word}</span>
                    <span className="mx-2">-</span>
                    <span className="text-muted-foreground">{room.players.find(p=>p.id===pid)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
              onClick={resetGame}
            >
              <ArrowPathIcon className="icon-md" />
              返回大厅
            </button>
          </div>
        </div>
      )}
      {phase === 'finished' && (
        <div className="card p-6 md:p-8 animate-fade-in text-center-all w-full">
          <h1 className="title text-center">游戏结束 🎉</h1>
          <div className="w-full text-center mt-6">
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              onClick={resetGame}
            >
              <HomeIcon className="icon-md" />
              返回大厅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

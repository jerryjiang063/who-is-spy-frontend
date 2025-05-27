import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  PlayIcon, 
  EyeIcon, 
  EyeSlashIcon,
  HomeIcon,
  UserIcon
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
    <div className="min-h-screen bg-background py-10 transition-colors duration-300">
      {phase === 'lobby' && (
        <div className="max-w-md mx-auto p-8 card animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <UserGroupIcon className="h-8 w-8 text-primary" />
            在线《谁是卧底》
          </h2>
          
          <WordListEditor current={room.listName} onSelectList={changeList}/>
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
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
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                onClick={createRoom}
              >
                <UserPlusIcon className="h-5 w-5" />
                创建房间
              </button>
              <button 
                className="btn btn-secondary btn-lg flex items-center justify-center gap-2"
                onClick={joinRoom}
              >
                <UserIcon className="h-5 w-5" />
                加入房间
              </button>
            </div>

            {isHost && (
              <div className="space-y-3">
                <button 
                  className="btn btn-primary w-full btn-lg flex items-center justify-center gap-2"
                  onClick={startGame}
                >
                  <PlayIcon className="h-5 w-5" />
                  开始游戏
                </button>
                <button 
                  className="btn btn-secondary w-full btn-lg flex items-center justify-center gap-2"
                  onClick={toggleVis}
                >
                  {visible ? (
                    <>
                      <EyeSlashIcon className="h-5 w-5" />
                      隐藏身份
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-5 w-5" />
                      显示身份
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">玩家列表：</h3>
              <div className="space-y-2">
                {room.players.map(p=>(
                  <div 
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                  >
                    <UserIcon className="h-5 w-5 text-primary" />
                    <span>{p.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {p.id.slice(-4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="animate-fade-in">
          <Game word={myWord} role={myRole} visible={visible}/>
          <div className="max-w-md mx-auto mt-6 text-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={()=>setPhase('voting')}
            >
              开始投票
            </button>
          </div>
        </div>
      )}

      {phase === 'voting' && (
        <div className="animate-fade-in">
          <Vote roomId={roomId} players={room.players}/>
        </div>
      )}

      {phase === 'eliminated' && (
        <div className="max-w-md mx-auto p-8 card animate-fade-in">
          <h2 className="text-2xl font-bold text-center text-destructive mb-6">你已被淘汰</h2>
          <h3 className="text-xl font-medium mb-4">本轮角色 & 词语</h3>
          <div className="space-y-2 mb-6">
            {summary && Object.entries(summary).map(([pid,{word,role}])=>(
              <div 
                key={pid}
                className={`p-3 rounded-md ${
                  role === 'spy' ? 'bg-destructive/10' : 'bg-secondary/50'
                }`}
              >
                <span className={role === 'spy' ? 'text-destructive font-medium' : ''}>
                  {role === 'spy' ? '【卧底】' : '【平民】'}
                </span>
                {' '}{word} — {room.players.find(p=>p.id===pid)?.name}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary w-full btn-lg flex items-center justify-center gap-2"
            onClick={resetGame}
          >
            <HomeIcon className="h-5 w-5" />
            返回大厅
          </button>
        </div>
      )}

      {phase === 'finished' && (
        <div className="max-w-md mx-auto p-8 card animate-fade-in text-center">
          <h1 className="text-3xl font-bold mb-6">游戏结束 🎉</h1>
          <button
            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
            onClick={resetGame}
          >
            <HomeIcon className="h-5 w-5" />
            返回大厅
          </button>
        </div>
      )}
    </div>
  );
}

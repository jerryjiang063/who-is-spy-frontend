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
    <div className="w-full py-10">
      {phase === 'lobby' && (
        <div className="card animate-fade-in">
          <h2 className="title">
            <UserGroupIcon className="icon-md" />
            在线《谁是卧底》
          </h2>
          
          <WordListEditor current={room.listName} onSelectList={changeList}/>
          
          <div className="space-y-4 mt-6 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <input
                className="input text-center"
                placeholder="房间ID"
                value={roomId}
                onChange={e=>setRoomId(e.target.value)}
              />
              <input
                className="input text-center"
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
                <UserPlusIcon className="icon-sm" />
                创建房间
              </button>
              <button 
                className="btn btn-secondary btn-lg flex items-center justify-center gap-2"
                onClick={joinRoom}
              >
                <UserIcon className="icon-sm" />
                加入房间
              </button>
            </div>

            {isHost && (
              <div className="space-y-3">
                <button 
                  className="btn btn-primary w-full btn-lg flex items-center justify-center gap-2"
                  onClick={startGame}
                >
                  <PlayIcon className="icon-sm" />
                  开始游戏
                </button>
                <button 
                  className="btn btn-secondary w-full btn-lg flex items-center justify-center gap-2"
                  onClick={toggleVis}
                >
                  {visible ? (
                    <>
                      <EyeSlashIcon className="icon-sm" />
                      隐藏身份
                    </>
                  ) : (
                    <>
                      <EyeIcon className="icon-sm" />
                      显示身份
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-center">玩家列表</h3>
              <div className="space-y-2">
                {room.players.map(p=>(
                  <div 
                    key={p.id}
                    className="flex items-center justify-center gap-2 p-2 rounded-md bg-secondary/50"
                  >
                    <UserIcon className="icon-sm text-primary" />
                    <span>{p.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({p.id.slice(-4)})
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
          <div className="mt-6 text-center">
            <button
              className="btn btn-primary btn-lg inline-flex items-center justify-center gap-2"
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
        <div className="card animate-fade-in">
          <h2 className="title text-destructive">你已被淘汰</h2>
          <div className="px-6 pb-6">
            <h3 className="text-xl font-medium mb-4 text-center">本轮角色 & 词语</h3>
            <div className="space-y-2 mb-6">
              {summary && Object.entries(summary).map(([pid,{word,role}])=>(
                <div 
                  key={pid}
                  className={`p-3 rounded-md text-center ${
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
              <HomeIcon className="icon-sm" />
              返回大厅
            </button>
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div className="card animate-fade-in">
          <h1 className="title">游戏结束 🎉</h1>
          <div className="px-6 pb-6">
            <button
              className="btn btn-primary btn-lg flex items-center justify-center gap-2"
              onClick={resetGame}
            >
              <HomeIcon className="icon-sm" />
              返回大厅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineUser, AiOutlineHome, AiOutlineCheckCircle, AiOutlineEye, AiOutlineEyeInvisible, AiOutlinePlayCircle } from 'react-icons/ai';
import WordListEditor from './WordListEditor';
import Game from './Game';
import Vote from './Vote';
import './index.css';

export default function Room({ socket }) {
  const [roomId,  setRoomId]   = useState('');
  const [name,    setName]     = useState('');
  const [room,    setRoom]     = useState({ host:null, listName:'default', players:[] });
  const [myWord,  setMyWord]   = useState('');
  const [myRole,  setMyRole]   = useState('');
  const [visible, setVisible]  = useState(false);
  const [phase,   setPhase]    = useState('lobby');
  const [summary, setSummary]  = useState(null);
  const [wordListName, setWordListName] = useState('default');
  const [showWordListEditor, setShowWordListEditor] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const spyCount = 1;

  useEffect(()=>{
    const onRoomUpdated = data => {
      setRoom(data);
      setPhase('lobby');
      setSummary(null);
    };
    const onDealWords = ({ word, role }) => {
      setMyWord(word);
      setMyRole(role);
      setPhase('playing');
    };
    const onVisibilityUpdated = ({ visible }) => {
      setVisible(visible);
    };
    const onVoteTie = () => {
      alert('本轮平局或弃权多数，重投！');
      setPhase('voting');
    };
    const onSpyEliminated = ({ eliminatedId }) => {
      alert('卧底被票出，平民胜利！');
      setPhase('finished');
    };
    const onRoundSummary = ({ summary }) => {
      setSummary(summary);
      setPhase('eliminated');
    };
    const onStartNextVote = () => {
      alert('本轮淘汰的是平民，游戏继续！');
      setPhase('voting');
    };
    const onSpyWin = () => {
      alert('卧底胜利！');
      setPhase('finished');
    };

    socket.on('room-updated', onRoomUpdated);
    socket.on('deal-words', onDealWords);
    socket.on('visibility-updated', onVisibilityUpdated);
    socket.on('vote-tie', onVoteTie);
    socket.on('spy-eliminated', onSpyEliminated);
    socket.on('round-summary', onRoundSummary);
    socket.on('start-next-vote', onStartNextVote);
    socket.on('spy-win', onSpyWin);

    return () => {
      socket.off('room-updated', onRoomUpdated);
      socket.off('deal-words', onDealWords);
      socket.off('visibility-updated', onVisibilityUpdated);
      socket.off('vote-tie', onVoteTie);
      socket.off('spy-eliminated', onSpyEliminated);
      socket.off('round-summary', onRoundSummary);
      socket.off('start-next-vote', onStartNextVote);
      socket.off('spy-win', onSpyWin);
    };
  },[socket]);

  useEffect(() => {
    function updateIsHost() {
      setIsHost(socket.id && room.host && socket.id === room.host);
    }
    updateIsHost();
    socket.on('connect', updateIsHost);
    return () => {
      socket.off('connect', updateIsHost);
    };
  }, [room.host, socket]);

  // 自动填充房主端的房间号
  useEffect(() => {
    if (room && room.id && !roomId) {
      setRoomId(room.id);
    }
  }, [room, roomId]);

  const createRoom    = ()=>socket.emit('create-room',{ roomId,name });
  const joinRoom      = ()=>socket.emit('join-room'  ,{ roomId,name });
  const changeList    = ln=>socket.emit('change-list',{ roomId,listName:ln });
  const resetGame     = ()=>{ setPhase('lobby'); socket.emit('reset-game',{ roomId }); };
  const startGame     = ()=>{
    console.log('startGame called', { roomId, isHost, players: room.players });
    if (!roomId) {
      alert('房间号不能为空！');
      return;
    }
    if (!isHost) {
      alert('只有房主可以开始游戏！');
      return;
    }
    if (!room.players || room.players.length < 2) {
      alert('至少需要2名玩家才能开始游戏！');
      return;
    }
    setSummary(null);
    console.log('emit start-game', { roomId, spyCount });
    socket.emit('start-game',{ roomId,spyCount });
  };
  const toggleVis     = ()=>socket.emit('toggle-visibility',{ roomId,visible:!visible });

  useEffect(() => {
    document.body.style.background = '#EBEFF5';
    return () => { document.body.style.background = '#B3E5FC'; };
  }, []);

  return (
    <div className="card-center min-h-screen w-full flex flex-col items-center justify-center relative">
      <h1 className="text-5xl mb-10">《谁是卧底》在线版</h1>
      {phase === 'lobby' && !showWordListEditor && (
        <div className="flex flex-col gap-4 w-full max-w-xl items-center">
            <input
            className="w-full text-base py-2 px-4"
            placeholder="房间号"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            />
            <input
            className="w-full text-base py-2 px-4"
            placeholder="昵称"
            value={name}
            onChange={e => setName(e.target.value)}
            />
          <button className="w-full text-base py-2" onClick={createRoom}>创建房间</button>
          <button className="w-full text-base py-2" onClick={joinRoom}>加入房间</button>
          <button className="w-full text-base py-2" onClick={()=>setShowWordListEditor(true)}>词库编辑</button>
          <div className="mb-8 w-full">
            <div className="text-2xl font-bold mb-2">玩家列表：</div>
            <ul className="text-xl font-bold text-sky-600">
              {room.players.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
            <div className="text-xs text-sky-400 mt-2">
              {room.host ? `房主：${room.players.find(p=>p.id===room.host)?.name || room.host}` : '请先创建或加入房间'}
          </div>
          </div>
          {isHost && (
            <div className="space-y-3 w-full">
              <button 
                className="w-full text-base py-2"
                onClick={startGame}
                disabled={!isHost}
              >
                开始游戏
              </button>
              <button 
                className="w-full text-base py-2"
                onClick={toggleVis}
              >
                {visible ? '隐藏身份' : '显示身份'}
              </button>
            </div>
          )}
          {!isHost && room.host && (
            <div className="w-full text-xs text-red-400 text-center mt-2">只有房主可以开始游戏</div>
          )}
        </div>
      )}
      {showWordListEditor && (
        <WordListEditor current={wordListName} onSelectList={name=>setWordListName(name)} onBack={()=>setShowWordListEditor(false)} />
      )}
      {phase === 'playing' && (
        <div className="w-full">
          <Game word={myWord} role={myRole} visible={visible}/>
          <div className="mt-6 text-center w-full">
            <button
              className="w-full text-base py-2"
              onClick={()=>setPhase('voting')}
            >
              开始投票
            </button>
          </div>
        </div>
      )}
      {phase === 'voting' && (
        <div className="w-full">
        <Vote roomId={roomId} players={room.players}/>
        </div>
      )}
      {phase === 'eliminated' && (
        <div className="w-full">
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
              className="w-full text-base py-2"
            onClick={resetGame}
          >
            返回大厅
          </button>
          </div>
        </div>
      )}
      {phase === 'finished' && (
        <div className="w-full">
          <h1 className="title text-center">游戏结束 🎉</h1>
          <div className="w-full text-center">
          <button
              className="w-full text-base py-2"
            onClick={resetGame}
          >
            返回大厅
          </button>
          </div>
        </div>
      )}
      <div className="fixed bottom-2 left-0 w-full text-center text-xs text-sky-400 font-bold opacity-80 select-none z-50">
        By 姜姜大当家 | 谁是卧底在线版 | 2025
      </div>
    </div>
  );
}

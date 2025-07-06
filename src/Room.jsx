import React, { useState, useEffect, useRef } from 'react';
import { AiOutlinePlus, AiOutlineUser, AiOutlineHome, AiOutlineCheckCircle, AiOutlineEye, AiOutlineEyeInvisible, AiOutlinePlayCircle, AiOutlineClose, AiOutlineQuestionCircle } from 'react-icons/ai';
import WordListEditor from './WordListEditor';
import Game from './Game';
import Vote from './Vote';
import Punishment from './Punishment';
import QuestionMode from './QuestionMode';
import { isFigLang, baseURL } from './socket';
import axios from 'axios';
import './index.css';

export default function Room({ socket, title = '《谁是卧底》在线版', defaultWordList = 'default' }) {
  const [roomId,  setRoomId]   = useState('');
  const [name,    setName]     = useState('');
  const [room,    setRoom]     = useState({ host:null, listName: defaultWordList, players:[] });
  const [myWord,  setMyWord]   = useState('');
  const [myRole,  setMyRole]   = useState('');
  const [visible, setVisible]  = useState(false);
  const [phase,   setPhase]    = useState('lobby');
  const [summary, setSummary]  = useState(null);
  const [wordListName, setWordListName] = useState(defaultWordList);
  const [showWordListEditor, setShowWordListEditor] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const [errorMsg, setErrorMsg] = useState('');
  const [waitingForGame, setWaitingForGame] = useState(false);
  const [inPunishment, setInPunishment] = useState(false);
  const [spyCount, setSpyCount] = useState(1);
  const [wordLists, setWordLists] = useState([]);
  const [selectedList, setSelectedList] = useState('default');
  const [inQuestionMode, setInQuestionMode] = useState(false);
  
  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(()=>{
    const onRoomUpdated = data => {
      setRoom(data);
      if (data.status) {
        setRoomStatus(data.status);
      }
      if (data.status === 'waiting') {
        if (waitingForGame) {
          setPhase('lobby');
          setWaitingForGame(false);
        }
      }
      
      if (isFigLang) {
        const currentPlayer = data.players.find(p => p.id === socket.id);
        if (currentPlayer) {
          setInPunishment(currentPlayer.inPunishment);
        }
      }
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
      if (isFigLang) {
        alert('Tie vote or majority abstained. Vote again!');
      } else {
        alert('本轮平局或弃权多数，重投！');
      }
      setPhase('voting');
    };
    const onSpyEliminated = ({ eliminatedId }) => {
      if (isFigLang) {
        alert('The spy has been eliminated! Civilians win!');
      } else {
        alert('卧底被票出，平民胜利！');
      }
      
      // 如果当前玩家是卧底且在figurativelanguage域名下，则进入惩罚环节
      if (isFigLang && myRole === 'spy') {
        setInPunishment(true);
        setPhase('punishment');
      } else {
        setPhase('finished');
      }
    };
    const onRoundSummary = ({ summary }) => {
      setSummary(summary);
      setPhase('eliminated');
    };
    const onStartNextVote = () => {
      const currentRoom = roomRef.current;
      const isPlayerAlive = currentRoom.players.find(p => p.id === socket.id)?.alive;
      if (isPlayerAlive) {
        if (isFigLang) {
          alert('A civilian was eliminated. The game continues!');
        } else {
          alert('本轮淘汰的是平民，游戏继续！');
        }
        setPhase('voting');
      }
    };
    const onSpyWin = () => {
      if (isFigLang) {
        alert('The spy wins!');
      } else {
        alert('卧底胜利！');
      }
      
      // 如果当前玩家是平民且在figurativelanguage域名下，则进入惩罚环节
      if (isFigLang && myRole === 'civilian') {
        setInPunishment(true);
        setPhase('punishment');
      } else {
        setPhase('finished');
      }
    };
    
    const onRoomExists = () => {
      if (isFigLang) {
        setErrorMsg('Room already exists. Please join or choose another room ID.');
      } else {
        setErrorMsg('该房间已存在，请加入或选择其他房间名');
      }
      setTimeout(() => setErrorMsg(''), 3000);
    };
    
    const onKickedFromRoom = () => {
      if (isFigLang) {
        alert('You have been removed from the room by the host.');
      } else {
        alert('你已被房主移出房间');
      }
      setPhase('lobby');
      setRoom({ host:null, listName: defaultWordList, players:[] });
    };
    
    const onEnterPunishment = () => {
      if (isFigLang) {
        setInPunishment(true);
        setPhase('punishment');
      }
    };
    
    const onPlayersInPunishment = () => {
      if (isFigLang) {
        alert('Some players are still in the punishment phase. Please wait until everyone has completed it before starting a new game.');
      } else {
        alert('有玩家正在惩罚环节中，请等待所有玩家完成惩罚环节后再开始游戏');
      }
    };
    
    const onSpecialWordlistError = ({ message }) => {
      alert(message);
    };

    socket.on('room-updated', onRoomUpdated);
    socket.on('deal-words', onDealWords);
    socket.on('visibility-updated', onVisibilityUpdated);
    socket.on('vote-tie', onVoteTie);
    socket.on('spy-eliminated', onSpyEliminated);
    socket.on('round-summary', onRoundSummary);
    socket.on('start-next-vote', onStartNextVote);
    socket.on('spy-win', onSpyWin);
    socket.on('room-exists', onRoomExists);
    socket.on('kicked-from-room', onKickedFromRoom);
    socket.on('special-wordlist-error', onSpecialWordlistError);
    
    if (isFigLang) {
      socket.on('enter-punishment', onEnterPunishment);
      socket.on('players-in-punishment', onPlayersInPunishment);
    }

    return () => {
      socket.off('room-updated', onRoomUpdated);
      socket.off('deal-words', onDealWords);
      socket.off('visibility-updated', onVisibilityUpdated);
      socket.off('vote-tie', onVoteTie);
      socket.off('spy-eliminated', onSpyEliminated);
      socket.off('round-summary', onRoundSummary);
      socket.off('start-next-vote', onStartNextVote);
      socket.off('spy-win', onSpyWin);
      socket.off('room-exists', onRoomExists);
      socket.off('kicked-from-room', onKickedFromRoom);
      socket.off('special-wordlist-error', onSpecialWordlistError);
      
      if (isFigLang) {
        socket.off('enter-punishment', onEnterPunishment);
        socket.off('players-in-punishment', onPlayersInPunishment);
      }
    };
  },[socket, defaultWordList, waitingForGame, myRole]);

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

  useEffect(() => {
    if (room && room.id && !roomId) {
      setRoomId(room.id);
    }
  }, [room, roomId]);

  // 获取所有可用词库
  useEffect(() => {
    const fetchWordLists = async () => {
      try {
        console.log('Fetching word lists from:', `${baseURL}/wordlists`);
        // 使用 axios 和 baseURL 确保一致的 API 地址
        const response = await axios.get(`${baseURL}/wordlists`);
        console.log('Word lists fetched successfully:', response.data);
        setWordLists(response.data);
      } catch (error) {
        console.error('获取词库列表失败:', error);
      }
    };
    
    fetchWordLists();
  }, []);

  // 根据当前域名过滤词库
  const filteredWordLists = wordLists.filter(list => {
    if (isFigLang) {
      // 在 figurativelanguage 域名下只显示 figurative_language 词库
      return list === 'figurative_language';
    } else {
      // 在普通域名下不显示 figurative_language 词库
      return list !== 'figurative_language';
    }
  });

  const createRoom    = ()=>socket.emit('create-room',{ roomId,name });
  const joinRoom      = ()=>socket.emit('join-room'  ,{ roomId,name });
  const changeList    = ln=>{
    if (ln === 'figurative_language' && !isFigLang) {
      alert('该词库为特殊词库，请在figurativelanguage.spyccb.top中使用。');
      return;
    }
    socket.emit('change-list',{ roomId,listName:ln });
  };
  
  const resetGame = () => {
    setPhase('lobby');
    socket.emit('reset-game', { roomId });
  };
  
  const leaveRoom = () => {
    socket.emit('check-room-status', { roomId }, (response) => {
      if (response.exists) {
        if (response.status === 'playing') {
          setWaitingForGame(true);
          setPhase('waiting');
        } else {
          socket.emit('leave-room', { roomId });
          setPhase('lobby');
          setRoom({ host:null, listName: defaultWordList, players:[] });
        }
      } else {
        setPhase('lobby');
        setRoom({ host:null, listName: defaultWordList, players:[] });
      }
    });
  };
  
  const kickPlayer = (playerId) => {
    if (isHost && socket.id !== playerId) {
      socket.emit('kick-player', { roomId, playerId });
    }
  };

  const startGame = () => {
    if (room.players.length < 3) {
      if (isFigLang) {
        alert('At least 3 players are needed to start the game.');
      } else {
        alert('至少需要3名玩家才能开始游戏');
      }
      return;
    }
    if (spyCount >= room.players.length) {
      if (isFigLang) {
        alert('The number of spies cannot be greater than or equal to the total number of players.');
      } else {
        alert('卧底数量不能大于或等于玩家总数');
      }
      return;
    }
    socket.emit('start-game',{ roomId, spyCount });
  };
  
  const toggleVis = () => socket.emit('toggle-visibility',{ roomId,visible:!visible });

  // 当惩罚环节完成时
  const onPunishmentCompleted = () => {
    socket.emit('punishment-completed', { roomId });
    setInPunishment(false);
    setPhase('lobby');
  };

  // 进入问答模式
  const enterQuestionMode = () => {
    setInQuestionMode(true);
  };

  // 退出问答模式
  const exitQuestionMode = () => {
    setInQuestionMode(false);
  };

  // 如果在问答模式，显示问答组件
  if (inQuestionMode) {
    return <QuestionMode onBack={exitQuestionMode} />;
  }

  // 根据当前阶段渲染不同的内容
  if (phase === 'waiting') {
    return (
      <div className="card-center">
        <h2>{isFigLang ? 'Waiting for Game to End' : '等待游戏结束'}</h2>
        <p className="text-lg text-center mb-4">
          {isFigLang 
            ? 'You have left the room, but the game is still in progress. You will automatically return to the lobby when the game ends.' 
            : '你已离开房间，但游戏仍在进行中。游戏结束后将自动返回大厅。'}
        </p>
      </div>
    );
  }
  
  if (phase === 'punishment' && isFigLang) {
    return (
      <Punishment 
        socket={socket}
        roomId={roomId}
        onCompleted={onPunishmentCompleted}
      />
    );
  }

  if (phase === 'lobby') {
    return (
      <div className="card-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        {!room.host ? (
          // 未加入房间
          <>
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder={isFigLang ? "Enter Room ID" : "输入房间ID"}
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full mb-2"
              />
              <input
                type="text"
                placeholder={isFigLang ? "Enter Your Name" : "输入你的名字"}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mb-2"
              />
              {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}
              <div className="flex gap-2">
                <button onClick={createRoom} className="w-1/2 flex items-center justify-center">
                  <AiOutlinePlus className="mr-2" /> {isFigLang ? "Create Room" : "创建房间"}
                </button>
                <button onClick={joinRoom} className="w-1/2 flex items-center justify-center">
                  <AiOutlineHome className="mr-2" /> {isFigLang ? "Join Room" : "加入房间"}
                </button>
              </div>
              
              {/* 只在figurativelanguage子域名下显示问答模式按钮 */}
              {isFigLang && (
                <button 
                  onClick={enterQuestionMode} 
                  className="w-full mt-4 bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center"
                >
                  <AiOutlineQuestionCircle className="mr-2" /> Question Answering Mode
                </button>
              )}
            </div>
          </>
        ) : (
          // 已加入房间
          <>
            <div className="w-full max-w-md">
              <h2 className="text-2xl mb-4">{isFigLang ? `Room: ${roomId}` : `房间: ${roomId}`}</h2>
              
              {/* 玩家列表 */}
              <div className="bg-white/50 rounded-xl p-4 mb-4">
                <h3 className="text-xl mb-2">{isFigLang ? "Player List" : "玩家列表"}</h3>
                <ul className="space-y-2">
                  {room.players.map(p => (
                    <li key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AiOutlineUser className="mr-2" />
                        <span>{p.name}</span>
                        {p.id === room.host && <span className="ml-2 text-yellow-600">
                          {isFigLang ? "(Host)" : "(房主)"}
                        </span>}
                        {isFigLang && p.inPunishment && <span className="ml-2 text-red-500">
                          {isFigLang ? "(In Punishment)" : "(惩罚中)"}
                        </span>}
                      </div>
                      {isHost && p.id !== socket.id && (
                        <button 
                          onClick={() => kickPlayer(p.id)}
                          className="text-red-500 hover:text-red-700 text-sm p-1"
                        >
                          <AiOutlineClose />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 房主控制面板 */}
              {isHost && (
                <div className="bg-white/50 rounded-xl p-4 mb-4">
                  <h3 className="text-xl mb-2">{isFigLang ? "Game Settings" : "游戏设置"}</h3>
                  
                  <div className="flex items-center mb-4">
                    <label className="mr-2">{isFigLang ? "Word List:" : "词库:"}</label>
                    <select 
                      value={room.listName} 
                      onChange={e => changeList(e.target.value)}
                      className="flex-grow text-base p-2"
                    >
                      {filteredWordLists.map(list => (
                        <option key={list} value={list}>{list}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setShowWordListEditor(true)}
                      className="ml-2 text-sm p-2 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      {isFigLang ? "Edit" : "编辑"}
                    </button>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <label className="mr-2">{isFigLang ? "Number of Spies:" : "卧底数:"}</label>
                    <select 
                      value={spyCount} 
                      onChange={e => setSpyCount(Number(e.target.value))}
                      className="flex-grow text-base p-2"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  
                  {roomStatus === 'playing' && (
                    <button 
                      onClick={toggleVis}
                      className="w-full flex items-center justify-center mb-4"
                    >
                      {visible ? (
                        <>
                          <AiOutlineEyeInvisible className="mr-2" /> {isFigLang ? "Hide All Identities" : "隐藏所有人身份"}
                        </>
                      ) : (
                        <>
                          <AiOutlineEye className="mr-2" /> {isFigLang ? "Show All Identities" : "显示所有人身份"}
                        </>
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={startGame}
                    className="w-full flex items-center justify-center"
                    disabled={isFigLang && room.players.some(p => p.inPunishment)}
                  >
                    <AiOutlinePlayCircle className="mr-2" /> 
                    {isFigLang ? "Start Game" : "开始游戏"}
                    {isFigLang && room.players.some(p => p.inPunishment) && 
                      (isFigLang ? " (Players in punishment)" : " (有玩家在惩罚环节)")}
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <button onClick={leaveRoom} className="w-full">{isFigLang ? "Leave Room" : "离开房间"}</button>
                
                {/* 只在figurativelanguage子域名下显示问答模式按钮 */}
                {isFigLang && (
                  <button 
                    onClick={enterQuestionMode} 
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center"
                  >
                    <AiOutlineQuestionCircle className="mr-2" /> Question Mode
                  </button>
                )}
              </div>
            </div>
            
            {/* 词库编辑器 */}
            {showWordListEditor && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <WordListEditor 
                    current={room.listName}
                    onSelectList={changeList}
                    onBack={() => setShowWordListEditor(false)}
                    filteredWordLists={filteredWordLists}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <Game
        word={myWord}
        role={myRole}
        visible={visible}
        onToggleVisible={toggleVis}
        onNext={() => setPhase('voting')}
      />
    );
  }

  if (phase === 'voting') {
    return (
      <Vote
        socket={socket}
        roomId={roomId}
        players={room.players.filter(p => p.alive)}
        myId={socket.id}
      />
    );
  }

  if (phase === 'eliminated' || phase === 'finished') {
    return (
      <div className="card-center">
        <h2 className="text-3xl mb-6">{isFigLang ? "Game Over" : "游戏结束"}</h2>
        
        {summary && (
          <div className="bg-white/50 rounded-xl p-4 mb-6 w-full max-w-md">
            <h3 className="text-xl mb-2">{isFigLang ? "Words This Round" : "本局词语"}</h3>
            <ul className="space-y-2">
              {Object.entries(summary).map(([pid, info]) => {
                const player = room.players.find(p => p.id === pid);
                return (
                  <li key={pid} className="flex items-center justify-between">
                    <span>{player?.name || (isFigLang ? 'Unknown Player' : '未知玩家')}</span>
                    <div>
                      <span className={info.role === 'spy' ? 'text-red-500' : 'text-green-500'}>
                        {info.role === 'spy' 
                          ? (isFigLang ? 'Spy' : '卧底') 
                          : (isFigLang ? 'Civilian' : '平民')}
                      </span>
                      <span className="ml-2">{isFigLang ? `Word: ${info.word}` : `词语: ${info.word}`}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {isHost ? (
          <button onClick={resetGame} className="w-full max-w-md flex items-center justify-center">
            <AiOutlineHome className="mr-2" /> {isFigLang ? "Return to Lobby" : "返回大厅"}
          </button>
        ) : (
          <div className="text-center text-lg">
            {isFigLang ? "Waiting for host to start a new game..." : "等待房主开始新游戏..."}
          </div>
        )}
      </div>
    );
  }

  return <div>{isFigLang ? "Unknown game phase" : "未知游戏阶段"}</div>;
}

import React, { useState, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { isFigLang, axiosWithRetry } from './socket';
import './index.css';

export default function Punishment({ socket, roomId, onCompleted }) {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // 获取随机题目
  const fetchRandomQuestion = async () => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    
    try {
      // 使用socket.id作为玩家唯一标识
      const playerId = socket.id;
      console.log(`Fetching question for player: ${playerId}`);
      
      // 使用带有重试功能的axios实例，并传递playerId参数
      const response = await axiosWithRetry.get(`/quiz/random?playerId=${playerId}&timestamp=${Date.now()}`);
      
      // 检查是否已回答所有题目
      if (response.data.allCompleted) {
        console.log('All questions completed');
        setError(null);
        setLoading(false);
        
        // 显示完成信息并返回大厅
        if (onCompleted) {
          onCompleted(response.data.message);
        } else {
          socket.emit('punishment-completed', { roomId });
        }
        return;
      }
      
      setQuestion(response.data);
      setError(null);
      setRetryCount(0); // 重置重试计数
    } catch (err) {
      console.error('Error fetching question:', err);
      
      // 如果重试次数小于3，则自动重试
      if (retryCount < 3) {
        console.log(`自动重试获取题目 (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(fetchRandomQuestion, 1000);
        return;
      }
      
      setError(isFigLang ? 'Failed to fetch question. Please try again.' : '获取题目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交答案
  const submitAnswer = async () => {
    if (selectedOption === null || !question) return;
    
    try {
      // 使用带有重试功能的axios实例
      const response = await axiosWithRetry.post('/quiz/submit', {
        questionId: question.id,
        answer: selectedOption,
        playerId: socket.id // 添加玩家ID
      });
      
      setResult(response.data);
      
      // 如果答案正确，通知服务器惩罚环节已完成
      if (response.data.isCorrect) {
        if (onCompleted) {
          onCompleted();
        } else {
          socket.emit('punishment-completed', { roomId });
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(isFigLang ? 'Failed to submit answer. Please try again.' : '提交答案失败，请重试');
    }
  };

  // 初始加载题目
  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  // 渲染加载状态
  if (loading) {
    return (
      <div className="card-center">
        <h2 className="text-3xl mb-6">{isFigLang ? "Punishment Phase" : "惩罚环节"}</h2>
        <div className="text-xl">
          {isFigLang 
            ? `Loading question${retryCount > 0 ? ` (retry ${retryCount}/3)` : ''}...` 
            : `加载题目中${retryCount > 0 ? ` (重试 ${retryCount}/3)` : ''}...`}
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="card-center">
        <h2 className="text-3xl mb-6">{isFigLang ? "Punishment Phase" : "惩罚环节"}</h2>
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button className="w-full text-base py-2" onClick={() => {
          setRetryCount(0);
          fetchRandomQuestion();
        }}>
          {isFigLang ? "Retry" : "重试"}
        </button>
      </div>
    );
  }

  return (
    <div className="card-center">
      <h2 className="text-3xl mb-6">{isFigLang ? "Punishment Phase" : "惩罚环节"}</h2>
      
      {question && (
        <div className="w-full max-w-lg">
          <div className="bg-white/40 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 rounded-md ${
                    selectedOption === index
                      ? 'bg-blue-100 ring-2 ring-blue-300'
                      : 'bg-white/80 hover:bg-blue-50'
                  } ${result && 'pointer-events-none'}`} // 禁用点击，如果已经提交答案
                  onClick={() => setSelectedOption(index)}
                  disabled={result !== null}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>

          {/* 结果显示 */}
          {result && (
            <div className={`p-4 rounded-lg mb-6 ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              {result.isCorrect ? (
                <div className="flex items-center">
                  <AiOutlineCheckCircle className="text-green-500 text-2xl mr-2" />
                  <span className="text-green-700 font-bold">
                    {isFigLang ? "Congratulations! Your answer is correct!" : "恭喜你选择正确！"}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <AiOutlineCloseCircle className="text-red-500 text-2xl mr-2" />
                    <span className="text-red-700 font-bold">
                      {isFigLang ? "Incorrect answer. The correct answer is:" : "回答错误，正确答案应该是："}
                    </span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-md mb-2">
                    {String.fromCharCode(65 + result.correctAnswer)}. {question.options[result.correctAnswer]}
                  </div>
                  <div className="bg-white/60 p-3 rounded-md">
                    <span className="font-bold">{isFigLang ? "Explanation:" : "解析："}</span> {result.explanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            {!result && (
              <button
                className="w-full flex items-center justify-center"
                onClick={submitAnswer}
                disabled={selectedOption === null}
              >
                <AiOutlineCheckCircle className="mr-2" /> {isFigLang ? "Submit Answer" : "提交答案"}
              </button>
            )}
            
            {result && !result.isCorrect && (
              <button 
                className="w-full flex items-center justify-center"
                onClick={fetchRandomQuestion}
              >
                {isFigLang ? "Continue Answering" : "继续答题"}
              </button>
            )}
            
            {result && result.isCorrect && (
              <button 
                className="w-full flex items-center justify-center"
                onClick={() => {
                  if (onCompleted) {
                    onCompleted();
                  } else {
                    socket.emit('punishment-completed', { roomId });
                  }
                }}
              >
                {isFigLang ? "Return to Lobby" : "返回大厅"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
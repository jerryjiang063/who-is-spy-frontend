import React, { useState, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineArrowLeft } from 'react-icons/ai';
import { isFigLang, baseURL, axiosWithRetry } from './socket';
import './index.css';

export default function QuestionMode({ onBack }) {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [playerId, setPlayerId] = useState(`user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // 获取随机题目
  const fetchRandomQuestion = async () => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    
    try {
      console.log(`Fetching question for player: ${playerId}`);
      
      // 使用带有重试功能的axios实例，并传递playerId参数
      const response = await axiosWithRetry.get(`/quiz/random?playerId=${playerId}&timestamp=${Date.now()}`);
      
      // 检查是否已回答所有题目
      if (response.data.allCompleted) {
        console.log('All questions completed');
        setQuestion(null);
        setError(null);
        setLoading(false);
        
        // 显示完成消息
        setResult({
          allCompleted: true,
          message: response.data.message
        });
        return;
      }
      
      setQuestion(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to fetch question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 提交答案
  const submitAnswer = async () => {
    if (selectedOption === null || !question) return;
    
    try {
      const response = await axiosWithRetry.post(`/quiz/submit`, {
        questionId: question.id,
        answer: selectedOption,
        playerId: playerId // 添加玩家ID
      });
      
      setResult(response.data);
      setAnsweredCount(prev => prev + 1);
      
      if (response.data.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
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
        <h2 className="text-3xl mb-6">Question Answering Mode</h2>
        <div className="text-xl">Loading question...</div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="card-center">
        <h2 className="text-3xl mb-6">Question Answering Mode</h2>
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button className="w-full text-base py-2" onClick={fetchRandomQuestion}>
          Retry
        </button>
      </div>
    );
  }

  // 渲染所有题目已完成状态
  if (result && result.allCompleted) {
    return (
      <div className="card-center">
        <h2 className="text-3xl mb-6">Question Answering Mode</h2>
        <div className="bg-green-100 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <AiOutlineCheckCircle className="text-green-500 text-2xl mr-2" />
            <span className="text-green-700 font-bold">
              {result.message}
            </span>
          </div>
        </div>
        <div className="text-lg mb-6">
          Final Score: {correctCount}/{answeredCount}
        </div>
        <button 
          onClick={onBack}
          className="w-full flex items-center justify-center"
        >
          <AiOutlineArrowLeft className="mr-2" /> Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="card-center">
      <div className="flex items-center justify-between w-full max-w-lg mb-4">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <AiOutlineArrowLeft className="mr-1" /> Back to Lobby
        </button>
        <div className="text-lg">
          Score: {correctCount}/{answeredCount}
        </div>
      </div>
      
      <h2 className="text-3xl mb-6">Question Answering Mode</h2>
      
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
                    Congratulations! Your answer is correct!
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <AiOutlineCloseCircle className="text-red-500 text-2xl mr-2" />
                    <span className="text-red-700 font-bold">
                      Incorrect answer. The correct answer is:
                    </span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-md mb-2">
                    {String.fromCharCode(65 + result.correctAnswer)}. {question.options[result.correctAnswer]}
                  </div>
                  <div className="bg-white/60 p-3 rounded-md">
                    <span className="font-bold">Explanation:</span> {result.explanation}
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
                <AiOutlineCheckCircle className="mr-2" /> Submit Answer
              </button>
            )}
            
            {result && (
              <button 
                className="w-full flex items-center justify-center"
                onClick={fetchRandomQuestion}
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
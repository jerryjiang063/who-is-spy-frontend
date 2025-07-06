// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { isFigLang, baseURL } from './socket'

export default function WordListEditor({ current, onSelectList, onBack, filteredWordLists }) {
  const [lists, setLists] = useState([])
  const [newList, setNewList] = useState('')
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showItems, setShowItems] = useState(true)
  const [error, setError] = useState(null)

  // 获取所有列表名
  const fetchLists = async () => {
    try {
      // 使用 baseURL 确保正确的 API 地址
      const apiUrl = `${baseURL}/wordlists`;
      console.log('Attempting to fetch wordlists from:', apiUrl);
      const res = await axios.get(apiUrl);
      console.log('fetchLists 返回：', res.data); // 调试日志
      
      // 如果传入了过滤后的词库列表，则使用它
      if (filteredWordLists) {
        setLists(filteredWordLists);
      } else {
        // 否则过滤词库列表，如果不是 figurativelanguage 域名，则不显示 figurative_language 词库
        const filtered = res.data.filter(list => {
          if (isFigLang) {
            // 在 figurativelanguage 域名下只显示 figurative_language 词库
            return list === 'figurative_language';
          } else {
            // 在普通域名下不显示 figurative_language 词库
            return list !== 'figurative_language';
          }
        });
        setLists(filtered);
      }
      setError(null);
    } catch (err) {
      console.error('获取词库列表失败:', err);
      setError('获取词库列表失败: ' + (err.message || '未知错误'));
    }
  }
  
  // 获取当前选中列表的词条
  const fetchItems = async name => {
    try {
      const apiUrl = `${baseURL}/wordlists/${name}`;
      console.log(`Attempting to fetch items for wordlist "${name}" from:`, apiUrl);
      const res = await axios.get(apiUrl);
      setItems(res.data)
      setError(null);
    } catch (err) {
      console.error(`获取词库 ${name} 的词条失败:`, err);
      setError(`获取词库 ${name} 的词条失败: ` + (err.message || '未知错误'));
    }
  }

  useEffect(() => { 
    fetchLists();
    
    // 当 filteredWordLists 更新时重新获取列表
    if (filteredWordLists) {
      setLists(filteredWordLists);
    }
  }, [filteredWordLists]);
  
  useEffect(() => { if (current) fetchItems(current) }, [current])

  const createList = async () => {
    if (!newList.trim()) return
    
    // 在 figurativelanguage 域名下不允许创建新词库
    if (isFigLang) {
      alert('Creating new word lists is not allowed in Fig Lang Game');
      return;
    }
    
    try {
      const apiUrl = `${baseURL}/wordlists`;
      await axios.post(apiUrl, { name: newList.trim() });
      setNewList('')
      fetchLists()
    } catch (err) {
      console.error('创建词库失败:', err);
      setError('创建词库失败: ' + (err.message || '未知错误'));
    }
  }
  
  const deleteList = async name => {
    // 在 figurativelanguage 域名下不允许删除词库
    if (isFigLang) {
      alert('Deleting word lists is not allowed in Fig Lang Game');
      return;
    }
    
    try {
      const apiUrl = `${baseURL}/wordlists/${name}`;
      await axios.delete(apiUrl);
      onSelectList('default')
      fetchLists()
    } catch (err) {
      console.error(`删除词库 ${name} 失败:`, err);
      setError(`删除词库 ${name} 失败: ` + (err.message || '未知错误'));
    }
  }
  
  const addItem = async () => {
    if (!newItem.trim()) return
    try {
      const apiUrl = `${baseURL}/wordlists/${current}/items`;
      await axios.post(apiUrl, { item: newItem.trim() });
      setNewItem('')
      fetchItems(current)
    } catch (err) {
      console.error(`添加词条到词库 ${current} 失败:`, err);
      setError(`添加词条到词库 ${current} 失败: ` + (err.message || '未知错误'));
    }
  }
  
  const delItem = async item => {
    try {
      const apiUrl = `${baseURL}/wordlists/${current}/items`;
      await axios.delete(apiUrl, { params: { item } });
      fetchItems(current)
    } catch (err) {
      console.error(`从词库 ${current} 删除词条 ${item} 失败:`, err);
      setError(`从词库 ${current} 删除词条 ${item} 失败: ` + (err.message || '未知错误'));
    }
  }

  return (
    <div className="card-center w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">{isFigLang ? "Word List Editor" : "词库编辑"}</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-lg">
          <p>{error}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 w-full max-w-lg items-center">
        {!isFigLang && (
          <div className="flex gap-2 w-full">
            <input
              className="w-full"
              placeholder={isFigLang ? "New word list name" : "新建词库名称"}
              value={newList}
              onChange={e => setNewList(e.target.value)}
            />
            <button className="w-full text-xs py-0.5 px-1" onClick={createList}>
              {isFigLang ? "Create" : "创建"}
            </button>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <select
            className="w-full"
            value={current || ''}
            onChange={e => onSelectList(e.target.value)}
          >
            <option value="">{isFigLang ? "Please select a word list" : "请选择词库"}</option>
            {lists.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {!isFigLang && (
            <button 
              className="w-full text-xs py-0.5 px-1" 
              onClick={() => deleteList(current)} 
              disabled={!current || current === 'default'}
            >
              {isFigLang ? "Delete" : "删除"}
            </button>
          )}
        </div>
        {current && (
          <div className="w-full">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-xl font-bold">
                {isFigLang ? `Word List: ${current}` : `词条列表：${current}`}
              </div>
              <button className="w-auto" onClick={() => setShowItems(!showItems)}>
                {isFigLang ? (showItems ? 'Collapse' : 'Expand') : (showItems ? '收起' : '展开')}
              </button>
            </div>
            {showItems && (
              <div className="w-full">
                <div className="max-h-48 overflow-auto rounded-md border bg-white/40 w-full mb-2">
                  {items.length > 0 ? (
                    <div>
                      {items.map(i => (
                        <div key={i} className="flex justify-between items-center p-2 hover:bg-sky-50">
                          <span className="font-bold text-sky-500">{i}</span>
                          {!isFigLang && (
                            <button 
                              className="w-auto text-red-400 hover:text-red-600 text-xs px-1 py-0.5" 
                              onClick={() => delItem(i)}
                            >
                              {isFigLang ? "Delete" : "删除"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sky-400">
                      {isFigLang ? "No items yet" : "暂无词条"}
                    </div>
                  )}
                </div>
                {!isFigLang && (
                  <div className="flex gap-2 w-full">
                    <input
                      className="w-full"
                      placeholder={isFigLang ? "Format: civilian word,spy word" : "格式：平民词,卧底词"}
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                    />
                    <button className="w-auto text-xs py-0.5 px-1" onClick={addItem}>
                      {isFigLang ? "Add" : "添加"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <button className="w-full text-xs py-0.5 px-1 mt-2" onClick={onBack}>
          {isFigLang ? "Return" : "返回"}
        </button>
      </div>
    </div>
  )
}

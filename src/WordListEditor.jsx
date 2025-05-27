// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AiOutlinePlus, AiOutlineDelete, AiOutlineCheckCircle, AiOutlineUnorderedList } from 'react-icons/ai';

export default function WordListEditor({ current, onSelectList }) {
  const [lists, setLists] = useState([])
  const [newList, setNewList] = useState('')
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showItems, setShowItems] = useState(true)  // 控制收起/展开

  // 获取所有列表名
  const fetchLists = async () => {
    const res = await axios.get('/api/wordlists')
    setLists(res.data)
  }
  // 获取当前选中列表的词条
  const fetchItems = async name => {
    const res = await axios.get(`/api/wordlists/${name}`)
    setItems(res.data)
  }

  // 初始化
  useEffect(() => {
    fetchLists()
  }, [])

  // 切换下拉时
  useEffect(() => {
    if (current) fetchItems(current)
  }, [current])

  // 创建列表
  const createList = async () => {
    if (!newList.trim()) return
    await axios.post('/api/wordlists', { name: newList.trim() })
    setNewList('')
    fetchLists()
  }

  // 删除列表
  const deleteList = async name => {
    await axios.delete(`/api/wordlists/${name}`)
    onSelectList('default')  // 退回默认
    fetchLists()
  }

  // 添加词条
  const addItem = async () => {
    if (!newItem.trim()) return
    await axios.post(`/api/wordlists/${current}/items`, { item: newItem.trim() })
    setNewItem('')
    fetchItems(current)
  }

  // 删除词条
  const delItem = async item => {
    await axios.delete(`/api/wordlists/${current}/items`, { params: { item } })
    fetchItems(current)
  }

  return (
    <div className="card-center fadein mb-6 text-center">
      <h3 className="title text-center flex items-center justify-center gap-2">
        <AiOutlineUnorderedList className="text-2xl" /> 词库管理
      </h3>
      <div className="space-y-4 w-full text-center">
        <div className="flex gap-2 w-full">
          <input
            className="input flex-1 text-center"
            placeholder="新建词库名称"
            value={newList}
            onChange={e => setNewList(e.target.value)}
          />
          <button 
            className="btn btn-primary justify-center text-center flex items-center gap-2" 
            onClick={createList}
          >
            <AiOutlinePlus className="text-2xl" /> 创建
          </button>
        </div>
        <div className="flex gap-2 w-full">
          <select
            className="input flex-1 text-center"
            value={current}
            onChange={e => onSelectList(e.target.value)}
          >
            <option value="" className="text-center">请选择词库</option>
            {lists.map(l => (
              <option key={l} value={l} className="text-center">{l}</option>
            ))}
          </select>
          <button
            className="btn btn-secondary justify-center text-center flex items-center gap-2"
            onClick={() => deleteList(current)}
          >
            <AiOutlineDelete className="text-2xl" /> 删除
          </button>
        </div>
        {current && (
          <div className="space-y-4 w-full text-center">
            <div className="flex justify-between items-center w-full">
              <h4 className="text-lg font-bold text-center flex items-center gap-2">
                <AiOutlineUnorderedList className="text-xl" /> 词条列表：{current}
              </h4>
              <button
                className="btn btn-secondary btn-sm justify-center text-center"
                onClick={() => setShowItems(!showItems)}
              >
                {showItems ? '收起' : '展开'}
              </button>
            </div>
            {showItems && (
              <div className="space-y-4 animate-slide-down w-full text-center">
                <div className="max-h-48 overflow-auto rounded-md border bg-white/40 w-full text-center">
                  {items.length > 0 ? (
                    <div className="divide-y">
                      {items.map(i => (
                        <div key={i} className="flex justify-between items-center p-2 hover:bg-sky-50 text-center">
                          <span className="text-center font-bold text-sky-500">{i}</span>
                          <button
                            className="text-red-400 hover:text-red-600 p-1 rounded-full transition-colors text-center flex items-center gap-1"
                            onClick={() => delItem(i)}
                          >
                            <AiOutlineDelete className="text-xl" /> 删除
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sky-400">
                      暂无词条
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <input
                    className="input flex-1 text-center"
                    placeholder="格式：平民词,卧底词"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary justify-center text-center flex items-center gap-2" 
                    onClick={addItem}
                  >
                    <AiOutlinePlus className="text-2xl" /> 添加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

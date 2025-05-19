// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
    <div className="mb-6 p-4 bg-gray-50 rounded shadow">
      <h3 className="font-medium mb-2">词库管理</h3>

      <div className="flex items-center mb-2">
        <input
          className="border p-1 mr-2"
          placeholder="新建词库名称"
          value={newList}
          onChange={e => setNewList(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={createList}>
          创建
        </button>
      </div>

      <div className="flex items-center mb-2">
        <select
          className="border p-1 mr-2 flex-1"
          value={current}
          onChange={e => onSelectList(e.target.value)}
        >
          <option value="">请选择词库</option>
          {lists.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded"
          onClick={() => deleteList(current)}
        >
          删除
        </button>
      </div>

      {current && (
        <>
          <div className="flex justify-between items-center mb-1">
            <h4 className="mb-1 font-medium">词条列表：{current}</h4>
            <button
              className="text-sm text-blue-500 underline"
              onClick={() => setShowItems(!showItems)}
            >
              {showItems ? '收起' : '展开'}
            </button>
          </div>

          {showItems && (
            <>
              <ul className="list-disc pl-5 mb-3 max-h-40 overflow-auto">
                {items.map(i => (
                  <li key={i} className="flex justify-between items-center">
                    <span>{i}</span>
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => delItem(i)}
                    >删除</button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center">
                <input
                  className="border p-1 mr-2 flex-1"
                  placeholder="格式：平民词,卧底词"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                />
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={addItem}>
                  添加
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

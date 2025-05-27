// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function WordListEditor({ current, onSelectList, onBack }) {
  const [lists, setLists] = useState([])
  const [newList, setNewList] = useState('')
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showItems, setShowItems] = useState(true)

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

  useEffect(() => { fetchLists() }, [])
  useEffect(() => { if (current) fetchItems(current) }, [current])

  const createList = async () => {
    if (!newList.trim()) return
    await axios.post('/api/wordlists', { name: newList.trim() })
    setNewList('')
    fetchLists()
  }
  const deleteList = async name => {
    await axios.delete(`/api/wordlists/${name}`)
    onSelectList('default')
    fetchLists()
  }
  const addItem = async () => {
    if (!newItem.trim()) return
    await axios.post(`/api/wordlists/${current}/items`, { item: newItem.trim() })
    setNewItem('')
    fetchItems(current)
  }
  const delItem = async item => {
    await axios.delete(`/api/wordlists/${current}/items`, { params: { item } })
    fetchItems(current)
  }

  return (
    <div className="card-center w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">词库编辑</h2>
      <div className="flex flex-col gap-4 w-full max-w-lg items-center">
        <div className="flex gap-2 w-full">
          <input
            className="w-full"
            placeholder="新建词库名称"
            value={newList}
            onChange={e => setNewList(e.target.value)}
          />
          <button className="w-full" onClick={createList}>创建</button>
        </div>
        <div className="flex gap-2 w-full">
          <select
            className="w-full"
            value={current || ''}
            onChange={e => onSelectList(e.target.value)}
          >
            <option value="">请选择词库</option>
            {lists.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button className="w-full" onClick={() => deleteList(current)} disabled={!current || current === 'default'}>删除</button>
        </div>
        {current && (
          <div className="w-full">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-xl font-bold">词条列表：{current}</div>
              <button className="w-auto" onClick={() => setShowItems(!showItems)}>{showItems ? '收起' : '展开'}</button>
            </div>
            {showItems && (
              <div className="w-full">
                <div className="max-h-48 overflow-auto rounded-md border bg-white/40 w-full mb-2">
                  {items.length > 0 ? (
                    <div>
                      {items.map(i => (
                        <div key={i} className="flex justify-between items-center p-2 hover:bg-sky-50">
                          <span className="font-bold text-sky-500">{i}</span>
                          <button className="w-auto text-red-400 hover:text-red-600 text-base px-2 py-1" onClick={() => delItem(i)}>删除</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sky-400">暂无词条</div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <input
                    className="w-full"
                    placeholder="格式：平民词,卧底词"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                  />
                  <button className="w-auto" onClick={addItem}>添加</button>
                </div>
              </div>
            )}
          </div>
        )}
        <button className="w-full text-base py-2 mt-2" onClick={onBack}>返回</button>
      </div>
    </div>
  )
}

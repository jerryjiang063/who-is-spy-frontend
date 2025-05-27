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
    <div className="card-center min-h-screen w-full flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-6">词库编辑</h2>
      <form className="flex flex-col gap-6 w-full max-w-lg items-center" onSubmit={handleSubmit}>
        <textarea
          className="w-full text-2xl font-bold rounded-3xl p-6 border-2 border-sky-200 bg-white/80 text-sky-600 shadow-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          rows={8}
          value={wordList}
          onChange={e => setWordList(e.target.value)}
        />
        <button type="submit" className="w-full">保存</button>
        <button type="button" className="w-full" onClick={onBack}>返回</button>
      </form>
    </div>
  )
}

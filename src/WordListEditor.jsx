// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PlusIcon,
  TrashIcon,
  ChevronUpDownIcon,
  BookOpenIcon,
  FolderOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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
    if (!name) {
      setItems([])
      return
    }
    const res = await axios.get(`/api/wordlists/${name}`)
    setItems(res.data)
  }

  // 初始化
  useEffect(() => {
    fetchLists()
  }, [])

  // 切换下拉时
  useEffect(() => {
    fetchItems(current)
  }, [current])

  // 创建列表
  const createList = async () => {
    if (!newList.trim()) return
    await axios.post('/api/wordlists', { name: newList.trim() })
    setNewList('')
    fetchLists()
    onSelectList(newList.trim())
  }

  // 删除列表
  const deleteList = async name => {
    if (!name || name === 'default') return
    await axios.delete(`/api/wordlists/${name}`)
    onSelectList('default')
    fetchLists()
  }

  // 添加词条
  const addItem = async () => {
    if (!newItem.trim() || !current) return
    await axios.post(`/api/wordlists/${current}/items`, { item: newItem.trim() })
    setNewItem('')
    fetchItems(current)
  }

  // 删除词条
  const delItem = async item => {
    if (!current) return
    await axios.delete(`/api/wordlists/${current}/items`, { params: { item } })
    fetchItems(current)
  }

  return (
    <div className="w-full text-center space-y-5 animate-fade-in pt-2 pb-6">
      <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
        <BookOpenIcon className="icon-md text-primary-hsl" />
        词库管理
      </h3>
      <div className="space-y-4 w-full text-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            className="input flex-1"
            placeholder="新建词库名称"
            value={newList}
            onChange={e => setNewList(e.target.value)}
          />
          <button 
            className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={createList}
            disabled={!newList.trim()}
          >
            <PlusIcon className="icon-md" />
            创建词库
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
          <div className="relative w-full sm:flex-1">
            <select
              className="input appearance-none w-full pr-10"
              value={current || ''}
              onChange={e => onSelectList(e.target.value)}
            >
              <option value="" className="text-muted-foreground">选择一个词库</option>
              {lists.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <ChevronUpDownIcon className="icon-md absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <button
            className="btn btn-destructive flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={() => deleteList(current)}
            disabled={!current || current === 'default' || lists.length <= 1}
          >
            <TrashIcon className="icon-md" />
            删除当前词库
          </button>
        </div>

        {current && (
          <div className="space-y-4 w-full text-center pt-4">
            <div className="flex justify-between items-center w-full px-1">
              <h4 className="text-lg font-semibold flex items-center justify-center gap-2">
                <FolderOpenIcon className="icon-md text-primary-hsl" />
                词条 ({items.length})
              </h4>
              <button
                className="btn btn-secondary btn-sm flex items-center justify-center gap-1"
                onClick={() => setShowItems(!showItems)}
              >
                {showItems ? <ChevronUpDownIcon className="icon-sm transform rotate-180" /> : <ChevronUpDownIcon className="icon-sm" />}
                {showItems ? '收起' : '展开'}
              </button>
            </div>
            {showItems && (
              <div className="space-y-4 animate-slide-down w-full text-center">
                <div className="max-h-48 overflow-y-auto rounded-xl border bg-white/10 backdrop-blur-sm p-3 space-y-2 shadow-inner">
                  {items.length > 0 ? (
                    items.map(i => (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-white/20 hover:bg-white/30 shadow-sm">
                        <span className="text-center text-foreground font-medium">{i}</span>
                        <button
                          className="p-1.5 rounded-full hover:bg-destructive/20 transition-colors group"
                          onClick={() => delItem(i)}
                          aria-label="删除词条"
                        >
                          <XMarkIcon className="icon-sm text-destructive/70 group-hover:text-destructive" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      此词库暂无词条，快添加一个吧！
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    className="input flex-1"
                    placeholder="格式：平民词语,卧底词语"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    onClick={addItem}
                    disabled={!newItem.trim() || !current}
                  >
                    <PlusIcon className="icon-md" />
                    添加词条
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

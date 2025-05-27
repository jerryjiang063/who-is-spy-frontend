// src/WordListEditor.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  BookOpenIcon,
  FolderIcon
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
    <div className="mb-6 card animate-fade-in">
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-medium flex items-center gap-2">
          <BookOpenIcon className="h-6 w-6 text-primary" />
          词库管理
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="新建词库名称"
              value={newList}
              onChange={e => setNewList(e.target.value)}
            />
            <button 
              className="btn btn-primary flex items-center gap-2" 
              onClick={createList}
            >
              <PlusIcon className="h-5 w-5" />
              创建
            </button>
          </div>

          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={current}
              onChange={e => onSelectList(e.target.value)}
            >
              <option value="">请选择词库</option>
              {lists.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button
              className="btn btn-destructive flex items-center gap-2"
              onClick={() => deleteList(current)}
            >
              <TrashIcon className="h-5 w-5" />
              删除
            </button>
          </div>
        </div>

        {current && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <FolderIcon className="h-5 w-5 text-primary" />
                词条列表：{current}
              </h4>
              <button
                className="btn btn-secondary btn-sm flex items-center gap-1"
                onClick={() => setShowItems(!showItems)}
              >
                {showItems ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4" />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4" />
                    展开
                  </>
                )}
              </button>
            </div>

            {showItems && (
              <div className="space-y-4 animate-slide-down">
                <div className="max-h-48 overflow-auto rounded-md border bg-secondary/20">
                  {items.length > 0 ? (
                    <div className="divide-y">
                      {items.map(i => (
                        <div key={i} className="flex justify-between items-center p-2 hover:bg-secondary/30">
                          <span>{i}</span>
                          <button
                            className="text-destructive hover:text-destructive/70 p-1 rounded-full hover:bg-destructive/10 transition-colors"
                            onClick={() => delItem(i)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      暂无词条
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="格式：平民词,卧底词"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary flex items-center gap-2" 
                    onClick={addItem}
                  >
                    <PlusIcon className="h-5 w-5" />
                    添加
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

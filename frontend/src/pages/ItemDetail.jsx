import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { db } from '../utils/db'
import { success, error } from '../utils/toast'
import useUserStore from '../store/user'

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useUserStore()
  const [item, setItem] = useState(null)
  const [content, setContent] = useState('')

  // 本地消息列表
  const [localMessages, setLocalMessages] = useState([])

  // 1. 获取物品详情
  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(res => setItem(res.data))
      .catch(err => error('❌ 获取详情失败'))
  }, [id])

  // 🔥🔥🔥 2. 核心修复：监听全局同步事件，更新气泡状态 🔥🔥🔥
  useEffect(() => {
    const handleSyncEvent = (e) => {
      const { tempId, realId } = e.detail;
      console.log('📡 ItemDetail 收到同步广播:', tempId, '->', realId);

      setLocalMessages(prev => prev.map(msg => {
        // 强制转为 Number 进行比对，防止类型不一致
        if (Number(msg.id) === Number(tempId)) {
          return { ...msg, status: 'sent', id: realId }; // 变绿！
        }
        return msg;
      }));
    };

    window.addEventListener('message-synced', handleSyncEvent);

    // 清理函数
    return () => {
      window.removeEventListener('message-synced', handleSyncEvent);
    };
  }, []); // 依赖数组为空，确保只绑定一次

  const handleSendMessage = async () => {
    if (!item) return
    if (!content.trim()) return

    // 1. 生成统一 ID
    const tempId = Date.now()

    const optimisticMsg = {
      id: tempId,
      content: content,
      senderId: user?.id,
      createdAt: new Date().toISOString(),
      status: 'sending'
    }

    // 2. 乐观更新
    setLocalMessages(prev => [optimisticMsg, ...prev])
    setContent('')

    // 3. 离线处理
    if (!navigator.onLine) {
      try {
        await db.offlineMessages.add({
          content: optimisticMsg.content,
          receiverId: item.userId,
          timestamp: tempId // 存入 DB
        });

        setLocalMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...msg, status: 'offline' } : msg
        ));
      } catch (e) {
        setLocalMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        ));
      }
      return;
    }

    // 4. 在线处理
    try {
      const res = await axios.post('/api/messages', {
        receiverId: item.userId,
        content: optimisticMsg.content
      })

      setLocalMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'sent', id: res.data.id } : msg
      ))

    } catch (err) {
      console.error(err)
      setLocalMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ))
    }
  }

  // 状态图标组件
  const StatusIcon = ({ status }) => {
    if (status === 'sending') return <span className="text-gray-400 text-xs animate-pulse">发送中...</span>;
    if (status === 'sent') return <span className="text-green-500 text-xs">✓ 已读</span>;
    if (status === 'offline') return <span className="text-yellow-500 text-xs">🌐 等待网络</span>;
    if (status === 'error') return <span className="text-red-500 text-xs cursor-pointer">❗ 重试</span>;
    return null;
  }

  if (!item) return <div className="p-4">加载中...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      {/* 物品信息 */}
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
        <div className="text-2xl font-bold text-indigo-600">#{item.id}</div>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        分类：{item.category} · 地点：{item.location}
      </p>
      {Array.isArray(item.images) && item.images.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto mb-4">
          {item.images.map((url, idx) => (
            <img key={idx} src={url.startsWith('http') ? url : `${BASE_URL}${url}`} className="h-40 w-60 object-cover rounded" />
          ))}
        </div>
      )}
      <p className="text-gray-800 mb-6 border-b pb-4">{item.description}</p>

      {/* 聊天区域 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">💬 立即联系 (模拟聊天框)</h3>

        <div className="flex gap-2 mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="请输入私信内容 (Enter 发送)..."
            className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            rows={2}
          />
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition self-end h-full"
            onClick={handleSendMessage}
          >
            发送
          </button>
        </div>

        <div className="space-y-3">
          {localMessages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">在此处发送消息，体验乐观 UI 的零延迟效果 👇</p>
          )}

          {localMessages.map(msg => (
            <div key={msg.id} className="flex flex-col items-end">
              <div className="flex items-end gap-2">
                <div className="mb-1"><StatusIcon status={msg.status} /></div>

                <div className={`px-4 py-2 rounded-2xl rounded-tr-none max-w-xs text-sm 
                            ${msg.status === 'error' ? 'bg-red-100 text-red-800' :
                    msg.status === 'offline' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-900'}
                        `}>
                  {msg.content}
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-1 mr-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
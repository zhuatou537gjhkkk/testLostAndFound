import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../utils/axios'

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [content, setContent] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    console.log(`📦 获取物品详情 /api/items/${id}`)
    axios.get(`/api/items/${id}`)
      .then(res => {
        console.log('📦 获取到的物品数据:', res.data)
        setItem(res.data)
      })
      .catch(err => {
        console.error('❌ 获取详情失败', err)
        alert('❌ 获取详情失败，请检查后端是否可访问')
      })
  }, [id])

  const handleSendMessage = async () => {
    if (!item) return
    if (!content.trim()) {
      alert('请输入私信内容')
      return
    }

    console.log('💬 准备发送私信，内容：', content)
    try {
      const res = await axios.post('/api/messages', {
        receiverId: item.userId,
        content
      })
      console.log('✅ 私信发送成功，返回：', res.data)
      setSent(true)
    } catch (err) {
      console.error('❌ 私信发送错误：', err.response?.status, err.response?.data || err.message)
      alert('❌ 私信发送失败：' +
        (err.response?.data?.error || err.response?.data?.message || err.message))
    }
  }

  if (!item) return <div className="p-4">加载中...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        分类：{item.category} · 地点：{item.location} · 时间：{item.date?.slice(0, 10)} · {item.type === 'lost' ? '❓ 丢失' : '✅ 拾获'}
      </p>

      {Array.isArray(item.images) && item.images.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto mb-4">
          {item.images.map((url, idx) => {
            const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
            return (
              <img
                key={idx}
                src={fullUrl}
                alt={`图片 ${idx + 1}`}
                className="h-40 w-60 object-cover rounded shadow"
                onError={e => e.currentTarget.src = '/fallback.png'}
              />
            )
          })}
        </div>
      )}

      <div className="mb-4">
        <p className="font-medium">描述：</p>
        <p className="text-gray-800">{item.description}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">
          发布人 ID：<span className="font-semibold text-blue-600">#{item.userId}</span>
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">📩 联系对方</h3>
        {sent ? (
          <p className="text-green-600">✅ 私信发送成功！</p>
        ) : (
          <>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="请输入私信内容"
              className="w-full p-2 border rounded resize-none"
              rows={4}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700 transition"
              onClick={handleSendMessage}
            >
              发送私信
            </button>
          </>
        )}
      </div>
    </div>
  )
}

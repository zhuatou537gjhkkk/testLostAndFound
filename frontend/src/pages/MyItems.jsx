import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import useUserStore from '../store/user'
import { Link, useNavigate } from 'react-router-dom'

const BASE_URL = 'http://localhost:5000'

export default function MyItems() {
  const [items, setItems] = useState([])
  const { user } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = () => {
    axios.get('/api/items/mine')
      .then(res => setItems(res.data))
      .catch(() => alert('获取失败 ❌'))
  }

  const getFullImageUrl = (url) => url?.startsWith('http') ? url : `${BASE_URL}${url}`

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除该帖子吗？')) {
      try {
        await axios.delete(`/api/items/${id}`)
        alert('✅ 删除成功')
        fetchItems()
      } catch {
        alert('❌ 删除失败')
      }
    }
  }

  // pages/MyItems.jsx

  const markAsResolved = async (id) => {
    try {
      await axios.patch(`/api/items/${id}/status`);
      alert('✅ 状态已更新！');
      // 更新本地 state，而不是刷新页面
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, status: 'resolved' } : item
        )
      );
    } catch (err) {
      console.error('标记失败 ❌', err);
      alert('❌ 标记失败');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">📦 我的发布</h2>
      <p className="text-gray-600 mb-4">
        当前登录：<span className="text-blue-600">{user?.username || '已登录'}</span>
      </p>

      {items.length === 0 ? (
        <p className="text-gray-500">暂无发布记录 💤</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border rounded shadow p-4 bg-white">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">
                {item.date?.slice(0, 10)} · {item.location} · {item.type === 'lost' ? '❓ 丢失' : '✅ 拾获'}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded ${item.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {item.status === 'resolved' ? '已找回' : '待找回'}
                </span>
              </p>

              {item.images?.[0] && (
                <img
                  src={getFullImageUrl(item.images[0])}
                  className="w-full h-32 object-cover mt-2 rounded"
                  alt="item"
                />
              )}

              <p className="mt-2 text-sm text-gray-700">{item.description}</p>

              <Link to={`/item/${item.id}`} className="text-blue-500 text-sm mt-1 inline-block hover:underline">
                查看详情 →
              </Link>

              <div className="mt-2 flex gap-2 text-sm">
                <button onClick={() => navigate(`/edit/${item.id}`)} className="text-indigo-600 hover:underline">编辑</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">删除</button>
                {item.status !== 'resolved' && (
                  <button onClick={() => markAsResolved(item.id)} className="text-green-600 hover:underline">标记找回</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

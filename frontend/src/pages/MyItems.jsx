import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import useUserStore from '../store/user'
import { Link, useNavigate } from 'react-router-dom'
import { success, error } from '../utils/toast'

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
      .catch(() => error('获取我的物品列表失败 ❌'))
  }

  const getFullImageUrl = (url) => url?.startsWith('http') ? url : `${BASE_URL}${url}`

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除该帖子吗？此操作不可撤销。')) {
      try {
        await axios.delete(`/api/items/${id}`)
        success('✅ 删除成功')
        fetchItems()
      } catch {
        error('❌ 删除失败')
      }
    }
  }

  // ✅ *** 这是本次修复的核心 ***
  const handleToggleStatus = async (id) => {
    try {
      // 1. 调用后端 API，后端会返回更新后的完整 item 对象
      const res = await axios.patch(`/api/items/${id}/status`);
      success('✅ 状态已更新！');

      // 2. (关键修复) 直接使用后端返回的、最新的 item 数据
      const updatedItemFromServer = res.data.item;

      // 3. 更新前端 state，用新数据替换掉列表中的旧数据
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === id ? updatedItemFromServer : item
        )
      );
    } catch (err) {
      console.error('标记失败 ❌', err);
      error('❌ 标记失败');
    }
  }

  // 根据物品类型和状态返回对应的状态文本
  const getStatusLabel = (item) => {
    if (item.status === 'resolved') {
      return item.type === 'lost' ? '已找回' : '已归还';
    }
    return item.type === 'lost' ? '待找回' : '待归还';
  }

  // 根据物品类型和状态返回对应的操作按钮文本
  const getToggleButtonText = (item) => {
    if (item.status === 'resolved') {
      return '撤销标记';
    }
    return item.type === 'lost' ? '标记为已找回' : '标记为已归还';
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
                {(item.date || '').slice(0, 10)} · {item.location} · {item.type === 'lost' ? '❓ 丢失' : '✅ 拾获'}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {getStatusLabel(item)}
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
                <button onClick={() => handleToggleStatus(item.id)} className="text-green-600 hover:underline">
                  {getToggleButtonText(item)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
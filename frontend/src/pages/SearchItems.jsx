import { useState, useEffect } from 'react'
import axios from '../utils/axios'
import { Link } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function SearchItems() {
  // 1. 定义搜索条件状态
  const [query, setQuery] = useState({
    keyword: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    radius: ''
  })

  const [results, setResults] = useState([])

  // 2. 提取搜索逻辑为独立函数
  const handleSearch = async () => {
    // 过滤掉空字符串的参数
    const params = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== '')
    )

    try {
      // 即使 params 为空，后端也会返回所有数据，实现“重置”效果
      const res = await axios.get('/api/items/search', { params })
      setResults(res.data)
    } catch (err) {
      console.error('搜索失败:', err)
      // 注意：自动搜索模式下，建议去掉 alert 弹窗，否则用户输入时可能会频繁被打断
    }
  }

  // 3. 🔥 核心改进：防抖 (Debounce) 搜索 Effect
  useEffect(() => {
    // 设置一个定时器，500ms 后执行搜索
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    // 清理函数：如果 500ms 内 query 再次发生变化（用户还在打字），
    // 会先清除上一个定时器，重新计时。
    return () => clearTimeout(timer);
  }, [query]); // 依赖数组包含 query，意味着任何搜索条件变化都会触发

  // 辅助函数：生成完整图片链接
  const getFullImageUrl = (url) => {
    if (!url) {
      return 'https://via.placeholder.com/300x200?text=暂无图片';
    }
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl leading-tight font-semibold text-gray-900 mb-6">🔍 搜索物品</h2>

      {/* 搜索条件输入区域 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          value={query.keyword}
          onChange={e => setQuery({ ...query, keyword: e.target.value })}
          // 注意：移除了 onKeyDown，因为现在是自动搜索了
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="关键词（如 耳机、一卡通）"
        />
        <input
          type="text"
          value={query.category}
          onChange={e => setQuery({ ...query, category: e.target.value })}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="分类（如 电子、证件）"
        />
        <input
          type="text"
          value={query.location}
          onChange={e => setQuery({ ...query, location: e.target.value })}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="地点（如 图书馆）"
        />
        <input
          type="number"
          value={query.latitude}
          onChange={e => setQuery({ ...query, latitude: e.target.value })}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="纬度"
        />
        <input
          type="number"
          value={query.longitude}
          onChange={e => setQuery({ ...query, longitude: e.target.value })}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="经度"
        />
        <input
          type="number"
          value={query.radius}
          onChange={e => setQuery({ ...query, radius: e.target.value })}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="半径（km）"
        />
      </div>

      {/* 搜索按钮（可选保留，作为立即刷新功能） */}
      <div className="mb-6">
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          立即刷新
        </button>
      </div>

      {/* 结果展示区域 */}
      {results.length === 0 ? (
        <p className="text-gray-500">🙈 暂无搜索结果</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(item => (
            <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
              <img
                src={getFullImageUrl(item.images?.[0])}
                alt={item.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {item.location} · {item.type === 'lost' ? '❓ 丢失' : '✅ 拾获'}
                </p>
                <Link
                  to={`/item/${item.id}`}
                  className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
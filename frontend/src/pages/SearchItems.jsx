import { useState } from 'react'
import axios from '../utils/axios'
import { Link } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function SearchItems() {
  const [query, setQuery] = useState({
    keyword: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    radius: ''
  })
  const [results, setResults] = useState([])

  const handleSearch = async () => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== '')
    )
    try {
      const res = await axios.get('/api/items/search', { params })
      setResults(res.data)
    } catch (err) {
      console.error(err)
      alert('❌ 搜索失败')
    }
  }

  // ✅ 新增一个辅助函数，用于生成完整的图片 URL
  const getFullImageUrl = (url) => {
    if (!url) {
      return 'https://via.placeholder.com/300x200?text=暂无图片';
    }
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl leading-tight font-semibold text-gray-900 mb-6">🔍 搜索物品</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {/* 输入框部分保持不变 */}
        <input
          type="text"
          value={query.keyword}
          onChange={e => setQuery({ ...query, keyword: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
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
          className="form-input block w-full rounded-md border-ray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

      <div className="mb-6">
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          搜索
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-gray-500">🙈 暂无搜索结果</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(item => (
            <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
                // ✅ 修复这里：使用辅助函数生成完整的URL
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
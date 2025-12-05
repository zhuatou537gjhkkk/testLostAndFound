import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { Link } from 'react-router-dom'
import VirtualGrid from '../components/VirtualGrid' // ✅ 引入虚拟滚动组件

const BASE_URL = 'http://localhost:5000'

export default function Home() {
    const [items, setItems] = useState([])
    const [isVirtual, setIsVirtual] = useState(true) // 开关：用于对比性能

    useEffect(() => {
        axios.get('/api/items/search')
            .then(res => {
                const realData = res.data;

                // 🔥🔥🔥【性能测试】生成 2000 条模拟数据 🔥🔥🔥
                // 只有数据量足够大，虚拟滚动才有意义
                const MOCK_COUNT = 2000;
                const mockData = Array.from({ length: MOCK_COUNT }).map((_, i) => ({
                    id: `mock-${i}`,
                    title: `高性能测试物品 #${i}`,
                    location: i % 2 === 0 ? '图书馆' : '教学楼',
                    type: i % 3 === 0 ? 'found' : 'lost',
                    images: [], // 模拟无图
                    status: 'open',
                    date: new Date().toISOString()
                }));

                console.log(`🚀 已生成 ${MOCK_COUNT} 条数据用于测试虚拟滚动`);
                setItems([...realData, ...mockData]);
            })
            .catch(() => alert('❌ 加载信息失败'))
    }, [])

    // 渲染单个卡片的函数 (传给 VirtualGrid 用)
    const renderCard = (item) => {
        const getStatusLabel = (item) => {
            if (item.status === 'resolved') {
                return item.type === 'lost' ? '已找回' : '已归还';
            }
            return null;
        }
        const statusLabel = getStatusLabel(item);

        return (
            <div className="border p-4 shadow rounded bg-white flex flex-col h-[300px] mb-4 hover:shadow-lg transition-shadow">
                <div className="relative w-full h-40 mb-3 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                        <img
                            src={`${BASE_URL}${item.images[0]}`}
                            className="w-full h-full object-cover"
                            alt={item.title}
                            loading="lazy" // 图片懒加载
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}

                    {statusLabel && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                            {statusLabel}
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-lg truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2 truncate">
                    {item.location} · {item.type === 'lost' ? '❓丢失' : '✅拾获'}
                </p>
                <div className="flex-grow"></div>
                <Link className="text-blue-500 hover:underline self-start mt-auto" to={`/item/${item.id}`}>
                    查看详情 →
                </Link>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-4xl mx-auto h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold">📋 信息墙 (瀑布流)</h1>
                    <p className="text-xs text-gray-500">
                        当前数据量: {items.length} 条 |
                        模式: {isVirtual ? '🚀 虚拟滚动开启' : '🐢 普通渲染'}
                    </p>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setIsVirtual(!isVirtual)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                    >
                        切换模式
                    </button>
                    <Link to="/post" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline">
                        去发布
                    </Link>
                </div>
            </div>

            {/* 列表区域 */}
            <div className="flex-1 overflow-hidden border rounded bg-gray-50">
                {isVirtual ? (
                    // ✅ 模式 A: 虚拟滚动 (只渲染视口内的 DOM)
                    <VirtualGrid
                        items={items}
                        columnCount={2} // 两列布局
                        rowHeight={320} // 卡片高度 + 间距
                        containerHeight={window.innerHeight - 150} // 动态计算容器高度
                        renderItem={renderCard}
                    />
                ) : (
                    // ❌ 模式 B: 普通渲染 (渲染所有 DOM，会卡顿)
                    <div className="overflow-y-auto h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="h-[320px]">
                                {renderCard(item)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
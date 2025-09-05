import { useEffect, useState } from 'react'
// --- 路径修正：从 './utils/axios' 改为 '../utils/axios' ---
import axios from '../utils/axios'
import { Link } from 'react-router-dom'

// 和详情页一样，定义后端的基地址，用于拼接图片URL
const BASE_URL = 'http://localhost:5000'

export default function Home() {
    const [items, setItems] = useState([])
    // 新增一个 state，用于管理每个物品卡片的轮播图当前显示的图片索引
    // 它的结构会是这样：{ itemId_1: 0, itemId_2: 2, ... }
    const [currentImageIndexes, setCurrentImageIndexes] = useState({})

    useEffect(() => {
        axios.get('/api/items/search')
            .then(res => setItems(res.data))
            .catch(() => alert('❌ 加载信息失败'))
    }, [])

    // --- 新增轮播图逻辑 ---
    // 点击“上一张”按钮的处理函数
    const handlePrevImage = (itemId, totalImages) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) === 0 ? totalImages - 1 : (prev[itemId] || 0) - 1
        }))
    }

    // 点击“下一张”按钮的处理函数
    const handleNextImage = (itemId, totalImages) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) + 1) % totalImages
        }))
    }
    // --- 轮播图逻辑结束 ---

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">📋 信息墙</h1>
                <Link to="/post" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline">
                    去发布
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => {
                    // 获取当前物品卡片的图片索引，如果还没记录，默认为 0
                    const currentIndex = currentImageIndexes[item.id] || 0
                    const hasImages = item.images && item.images.length > 0

                    return (
                        <div key={item.id} className="border p-4 shadow rounded bg-white flex flex-col">
                            {/* ---- 图片轮播图部分 ---- */}
                            {hasImages ? (
                                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                                    {/* 图片 */}
                                    <img
                                        src={`${BASE_URL}${item.images[currentIndex]}`}
                                        className="w-full h-full object-cover"
                                        alt={item.title}
                                    />

                                    {/* 仅在图片数量大于1时显示左右切换按钮 */}
                                    {item.images.length > 1 && (
                                        <>
                                            {/* 上一张按钮 */}
                                            <button
                                                onClick={() => handlePrevImage(item.id, item.images.length)}
                                                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 leading-none hover:bg-opacity-60 focus:outline-none"
                                            >
                                                &#10094;
                                            </button>
                                            {/* 下一张按钮 */}
                                            <button
                                                onClick={() => handleNextImage(item.id, item.images.length)}
                                                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 leading-none hover:bg-opacity-60 focus:outline-none"
                                            >
                                                &#10095;
                                            </button>

                                            {/* 轮播图指示点 */}
                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {item.images.map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`block w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // 如果没有图片，显示一个占位符
                                <div className="w-full h-48 mb-3 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                                    暂无图片
                                </div>
                            )}
                            {/* ---- 图片轮播图部分结束 ---- */}

                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                                {item.location} · {item.type === 'lost' ? '❓丢失' : '✅拾获'}
                            </p>
                            <div className="flex-grow"></div> {/* 这是一个flex布局的技巧，用于将下面的链接推到底部 */}
                            <Link className="text-blue-500 hover:underline self-start mt-2" to={`/item/${item.id}`}>
                                查看详情 →
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
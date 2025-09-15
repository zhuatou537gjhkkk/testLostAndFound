import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { Link } from 'react-router-dom'

const BASE_URL = 'http://localhost:5000'

export default function Home() {
    const [items, setItems] = useState([])
    const [currentImageIndexes, setCurrentImageIndexes] = useState({})

    useEffect(() => {
        axios.get('/api/items/search')
            .then(res => setItems(res.data))
            .catch(() => alert('❌ 加载信息失败'))
    }, [])

    const handlePrevImage = (itemId, totalImages) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) === 0 ? totalImages - 1 : (prev[itemId] || 0) - 1
        }))
    }

    const handleNextImage = (itemId, totalImages) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) + 1) % totalImages
        }))
    }

    // 根据物品类型和状态返回对应的状态文本
    const getStatusLabel = (item) => {
        if (item.status === 'resolved') {
            return item.type === 'lost' ? '已找回' : '已归还';
        }
        return null; // 状态为 open 时不显示
    }

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
                    const currentIndex = currentImageIndexes[item.id] || 0
                    const hasImages = item.images && item.images.length > 0
                    const statusLabel = getStatusLabel(item);

                    return (
                        <div key={item.id} className="border p-4 shadow rounded bg-white flex flex-col">
                            <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                                {/* 图片 */}
                                {hasImages ? (
                                    <img
                                        src={`${BASE_URL}${item.images[currentIndex]}`}
                                        className="w-full h-full object-cover"
                                        alt={item.title}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                        暂无图片
                                    </div>
                                )}

                                {/* 状态角标 */}
                                {statusLabel && (
                                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                                        {statusLabel}
                                    </div>
                                )}

                                {/* 轮播图按钮和指示点 */}
                                {hasImages && item.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => handlePrevImage(item.id, item.images.length)}
                                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 leading-none hover:bg-opacity-60 focus:outline-none"
                                        >
                                            &#10094;
                                        </button>
                                        <button
                                            onClick={() => handleNextImage(item.id, item.images.length)}
                                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 leading-none hover:bg-opacity-60 focus:outline-none"
                                        >
                                            &#10095;
                                        </button>
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

                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                                {item.location} · {item.type === 'lost' ? '❓丢失' : '✅拾获'}
                            </p>
                            <div className="flex-grow"></div>
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
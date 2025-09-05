import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { error, success } from '../utils/toast'
import useUserStore from '../store/user'
import { motion, AnimatePresence } from 'framer-motion'

export default function Inbox() {
    const { user } = useUserStore()
    const [messages, setMessages] = useState([])

    const loadMessages = async () => {
        try {
            const res = await axios.get('/api/messages')
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setMessages(sorted)
        } catch {
            error('❌ 获取消息失败')
        }
    }

    useEffect(() => {
        loadMessages()
    }, [])

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/messages/${id}`)
            setMessages(msgs => msgs.filter(m => m.id !== id))
            success('已删除该条消息')
        } catch {
            error('删除失败')
        }
    }


    const markRead = async (id) => {
        try {
            await axios.patch(`/api/messages/${id}/read`); // ✅ 修复URL
            setMessages(msgs =>
                msgs.map(m => m.id === id ? { ...m, read: true } : m)
            )
        } catch {
            // 可以添加一些错误处理
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">📨 私信列表</h2>
            <p className="text-gray-600 mb-4">当前登录：{user?.username}</p>

            <AnimatePresence>
                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`mb-4 p-4 rounded shadow transition 
              ${msg.read ? 'bg-white' : 'bg-yellow-100 border-l-4 border-yellow-500'}`}
                    >
                        <p className="font-medium mb-1">来自用户 #{msg.fromUserId}</p>
                        <p className="text-gray-700">{msg.content}</p>
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <span>{new Date(msg.createdAt).toLocaleString()}</span>
                            <div className="space-x-2">
                                {!msg.read && (
                                    <button onClick={() => markRead(msg.id)} className="text-blue-600">标记已读</button>
                                )}
                                <button onClick={() => handleDelete(msg.id)} className="text-red-500">删除</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { error, success } from '../utils/toast'
import useUserStore from '../store/user'
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '../services/socket'

export default function Inbox() {
    const { user, clearUnread } = useUserStore()
    const [messages, setMessages] = useState([])

    useEffect(() => {
        clearUnread();
    }, []);

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

        const socket = getSocket();

        const handleNewMessage = (newMsg) => {
            setMessages(prev => [newMsg, ...prev]);
        };

        if (socket) {
            socket.on('new_message', handleNewMessage);
        }

        return () => {
            if (socket) socket.off('new_message', handleNewMessage);
        };
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
            await axios.patch(`/api/messages/${id}/read`);
            // ✅ 修复点 1：这里要用 isRead: true，而不是 read: true
            setMessages(msgs =>
                msgs.map(m => m.id === id ? { ...m, isRead: true } : m)
            )
        } catch {
            // 失败处理
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">📨 私信列表</h2>
            <AnimatePresence>
                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        // ✅ 修复点 2：这里判断条件改为 msg.isRead
                        className={`mb-4 p-4 rounded shadow transition ${msg.isRead ? 'bg-white' : 'bg-yellow-50 border-l-4 border-yellow-400'}`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-indigo-700">
                                {msg.Sender?.username || `用户 #${msg.senderId}`}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-gray-700 mt-1">{msg.content}</p>
                        <div className="flex justify-end gap-2 mt-2 text-sm">
                            {/* ✅ 修复点 3：这里判断条件改为 !msg.isRead */}
                            {!msg.isRead && (
                                <button onClick={() => markRead(msg.id)} className="text-blue-500 hover:underline">
                                    标记已读
                                </button>
                            )}
                            <button onClick={() => handleDelete(msg.id)} className="text-red-500 hover:underline">
                                删除
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
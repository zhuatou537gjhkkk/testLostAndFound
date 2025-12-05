import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useUserStore from './store/user'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostItem from './pages/PostItem'
import ItemDetail from './pages/ItemDetail'
import Inbox from './pages/Inbox'
import MyItems from './pages/MyItems'
import MapWall from './pages/MapWall'
import SearchItems from './pages/SearchItems'
import EditItem from './pages/EditItem'
import './index.css';

// 引入服务
import { connectSocket, disconnectSocket } from './services/socket'
import { db } from './utils/db'
import axios from './utils/axios'
import { success } from './utils/toast'

function ProtectedRoute({ children }) {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);

  if (isLoading) return <div className="p-10 text-center">正在检查登录状态...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { initUser, user, incrementUnread } = useUserStore()

  useEffect(() => {
    initUser()
  }, [])

  // ✅ 核心逻辑：监听网络恢复，同步离线消息
  useEffect(() => {
    const handleOnline = async () => {
      const pendingMsgs = await db.offlineMessages.toArray();

      if (pendingMsgs.length > 0) {
        success(`🌐 网络恢复，正在同步 ${pendingMsgs.length} 条离线消息...`);

        for (const msg of pendingMsgs) {
          try {
            // 1. 发送请求
            const res = await axios.post('/api/messages', {
              content: msg.content,
              receiverId: msg.receiverId
            });

            // 2. 删除本地缓存
            await db.offlineMessages.delete(msg.id);

            // 🔥🔥🔥 3. 发送全局广播，告诉 ItemDetail 这条消息发成功了 🔥🔥🔥
            // 重点：确保 tempId 是数字类型
            window.dispatchEvent(new CustomEvent('message-synced', {
              detail: {
                tempId: Number(msg.timestamp), // 对应 ItemDetail 里的 id
                realId: res.data.id            // 后端返回的真实 ID
              }
            }));

          } catch (e) {
            console.error('同步失败', e);
          }
        }
        success('✅ 离线消息同步完成');
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ✅ 全局 Socket 监听（红点推送）
  useEffect(() => {
    if (user) {
      const socket = connectSocket(user.id);
      socket.on('new_message', () => {
        incrementUnread();
        success('📨 收到一条新私信');
      });
    } else {
      disconnectSocket();
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
        <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapWall /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchItems /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
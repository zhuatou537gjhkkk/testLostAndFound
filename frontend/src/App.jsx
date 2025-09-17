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
import './index.css';
import SearchItems from './pages/SearchItems'
import EditItem from './pages/EditItem'

// ✅ *** 修复后的路由守卫组件 ***
function ProtectedRoute({ children }) {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);

  // 1. 如果正在检查登录状态，则显示加载提示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>正在检查登录状态...</div>
      </div>
    );
  }

  // 2. 加载结束后，如果用户状态仍然不存在，则重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. 确认用户已登录，才渲染子组件
  return children;
}


function App() {
  const initUser = useUserStore(state => state.initUser)

  useEffect(() => {
    initUser()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* --- 公共路由 --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 使用 ProtectedRoute 包裹需要登录才能访问的路由 --- */}
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
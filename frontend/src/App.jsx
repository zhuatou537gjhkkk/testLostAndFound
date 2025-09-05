import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Search from './pages/SearchItems'
import SearchItems from './pages/SearchItems'
import EditItem from './pages/EditItem'

function App() {
  // ✅ 使用 initUser 替代原始 setUser + jwtDecode 逻辑
  const initUser = useUserStore(state => state.initUser)

  useEffect(() => {
    initUser()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post" element={<PostItem />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/map" element={<MapWall />} />
        <Route path="/search" element={<SearchItems />} />
        <Route path="/edit/:id" element={<EditItem />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

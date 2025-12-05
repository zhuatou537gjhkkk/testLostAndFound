import { Link, useLocation, useNavigate } from 'react-router-dom'
import useUserStore from '../store/user'
import { LogoutIcon } from '@heroicons/react/outline'

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    // 1. 从 Store 中提取 unreadCount
    const { user, logout, unreadCount } = useUserStore()

    const publicMenu = [
        { name: '首页', to: '/' },
    ]

    const privateMenu = [
        { name: '发布', to: '/post' },
        { name: '我的发布', to: '/my-items' },
        { name: '私信', to: '/inbox' }, // 注意这里
        { name: '搜索', to: '/search' },
        { name: '地图', to: '/map' }
    ]

    const menu = user ? [...publicMenu, ...privateMenu] : publicMenu

    const isActive = (to) =>
        location.pathname === to
            ? 'border-b-2 border-indigo-500 text-indigo-600'
            : 'text-gray-600 hover:text-indigo-600'

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-xl font-semibold text-indigo-600">校园失物平台</div>
                <nav className="navbar space-x-6 flex items-center">
                    {menu.map((m) => (
                        <Link
                            key={m.to}
                            to={m.to}
                            className={`relative px-3 py-2 font-medium rounded-md transition-colors duration-200 ${isActive(m.to)} hover:bg-gray-100`}
                        >
                            {m.name}

                            {/* 2. 在“私信”按钮上添加红点逻辑 */}
                            {m.to === '/inbox' && unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    ))}

                    {user ? (
                        <div className="inline-flex items-center space-x-2 border-l pl-4 ml-2">
                            <span className="text-gray-700 text-sm">你好，{user.username}</span>
                            <button
                                onClick={() => {
                                    logout()
                                    localStorage.removeItem('token')
                                    navigate('/login')
                                }}
                                className="hover:bg-gray-200 p-1 rounded transition"
                                title="退出登录"
                            >
                                <LogoutIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="px-3 py-2 font-medium text-gray-600 hover:text-indigo-600">登录</Link>
                            <Link to="/register" className="px-3 py-2 font-medium text-gray-600 hover:text-indigo-600">注册</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
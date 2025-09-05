import { Link, useLocation } from 'react-router-dom'
import useUserStore from '../store/user'
import { LogoutIcon } from '@heroicons/react/outline'

export default function Navbar() {
    const location = useLocation()
    const { user, logout } = useUserStore()
    const menu = [
        { name: '首页', to: '/' },
        { name: '发布', to: '/post' },
        { name: '我的发布', to: '/my-items' },
        { name: '私信', to: '/inbox' },
        { name: '搜索', to: '/search' },
        { name: '地图', to: '/map' }
    ]
    const isActive = (to) =>
        location.pathname === to
            ? 'border-b-2 border-indigo-500 text-indigo-600'
            : 'text-gray-600 hover:text-indigo-600'

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-xl font-semibold">校园失物平台</div>
                <nav className="navbar space-x-6 flex items-center">
                    {menu.map((m) => (
                        <Link
                            key={m.to}
                            to={m.to}
                            className={`px-3 py-2 font-medium rounded-md transition-colors duration-200 ${isActive(m.to)} hover:bg-gray-100`}
                        >
                            {m.name}
                        </Link>
                    ))}
                    {user ? (
                        <div className="inline-flex items-center space-x-2">
                            <span className="text-gray-700">你好，{user.username}</span>
                            <button
                                onClick={() => {
                                    logout()
                                    localStorage.removeItem('token')
                                }}
                                className="hover:bg-gray-200 p-1 rounded"
                            >
                                <LogoutIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-3 py-2 font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                登录
                            </Link>
                            <Link
                                to="/register"
                                className="px-3 py-2 font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                注册
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

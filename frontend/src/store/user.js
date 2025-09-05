import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";

const useUserStore = create((set) => ({
    user: null,

    // 初始化：从 token 解码用户信息
    initUser: () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const decoded = jwtDecode(token)
                set({
                    user: {
                        id: decoded.id,
                        username: decoded.username,
                        email: decoded.email
                    }
                })
            } catch (err) {
                console.error('❌ JWT 解码失败：', err)
                localStorage.removeItem('token')
            }
        }
    },

    // 设置用户
    setUser: (user) => set({ user }),

    // 清除用户（退出）
    logout: () => set({ user: null })
}))

export default useUserStore

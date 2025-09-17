import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";

const useUserStore = create((set) => ({
    user: null,
    isLoading: true, // 1. 新增一个加载状态，默认为 true

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
                    },
                    isLoading: false // 2. 解码成功，加载结束
                })
            } catch (err) {
                console.error('❌ JWT 解码失败：', err)
                localStorage.removeItem('token')
                set({ user: null, isLoading: false }); // 3. 解码失败，加载结束
            }
        } else {
            set({ user: null, isLoading: false }); // 4. 没有 token，加载结束
        }
    },

    // 设置用户
    setUser: (user) => set({ user }),

    // 清除用户（退出）
    logout: () => set({ user: null })
}))

export default useUserStore
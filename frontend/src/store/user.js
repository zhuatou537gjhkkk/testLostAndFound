import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";

const useUserStore = create((set) => ({
    user: null,
    isLoading: true,
    unreadCount: 0, // ✅ 新增：未读消息数

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
                    isLoading: false
                })
            } catch (err) {
                console.error('❌ JWT 解码失败：', err)
                localStorage.removeItem('token')
                set({ user: null, isLoading: false });
            }
        } else {
            set({ user: null, isLoading: false });
        }
    },

    setUser: (user) => set({ user }),
    logout: () => set({ user: null, unreadCount: 0 }),

    // ✅ 新增：增加未读数
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    // ✅ 新增：清空未读数
    clearUnread: () => set({ unreadCount: 0 })
}))

export default useUserStore
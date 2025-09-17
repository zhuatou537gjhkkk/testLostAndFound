import axios from 'axios'
import useUserStore from '../store/user';

const instance = axios.create({
    baseURL: 'http://localhost:5000',
})

// 请求拦截器：发送请求前自动附加token
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器：处理全局的认证失败错误
instance.interceptors.response.use(
    // 对成功的响应直接返回
    (response) => response,
    // 对失败的响应进行统一处理
    (error) => {
        // 检查响应是否存在且状态码为 401 (未授权) 或 403 (禁止访问)
        if (error.response && [401, 403].includes(error.response.status)) {
            // 从Zustand store中获取logout方法
            const { logout } = useUserStore.getState();

            // 清除本地存储的token
            localStorage.removeItem('token');
            // 清除store中的用户信息
            logout();

            // 为了防止用户停留在需要登录才能访问的页面上，直接跳转到登录页
            // 并检查当前是否已在登录页，避免无限循环跳转
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // 将错误继续抛出，以便组件内的catch代码块可以捕获
        return Promise.reject(error);
    }
);


export default instance
// frontend/src/pages/Login.jsx

import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { success, error } from '../utils/toast'
import { jwtDecode } from 'jwt-decode';
import useUserStore from '../store/user'

const schema = Yup.object({
    username: Yup.string().required('用户名不能为空'),
    password: Yup.string().required('密码不能为空')
})

export default function Login() {
    const navigate = useNavigate()
    const setUser = useUserStore(state => state.setUser)

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post('/api/auth/login', values)
            localStorage.setItem('token', res.data.token)

            // ✅ 修复：解码并保存完整的用户信息
            const decoded = jwtDecode(res.data.token)
            setUser({
                id: decoded.id,
                username: decoded.username,
                email: decoded.email
            })

            success('🎉 登录成功')
            navigate('/')
        } catch (err) {
            error(err.response?.data?.message || '登录失败')
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">🔐 用户登录</h2>
            <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={schema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form className="space-y-4">
                        <div>
                            <Field name="username" className="w-full border p-2" placeholder="用户名" />
                            {errors.username && touched.username && <div className="text-red-500 text-sm">{errors.username}</div>}
                        </div>
                        <div>
                            <Field name="password" type="password" className="w-full border p-2" placeholder="密码" />
                            {errors.password && touched.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">登录</button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
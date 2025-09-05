import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { success, error } from '../utils/toast'

const schema = Yup.object({
    username: Yup.string().required('用户名不能为空'),
    email: Yup.string().email('无效邮箱').required('邮箱不能为空'),
    password: Yup.string().min(6, '密码至少6位').required('密码不能为空')
})

export default function Register() {
    const navigate = useNavigate()

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post('/api/auth/register', values)
            localStorage.setItem('token', res.data.token)
            success('注册成功 🎉')
            navigate('/')
        } catch (err) {
            error(err.response?.data?.error || '注册失败')
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">📝 用户注册</h2>
            <Formik
                initialValues={{ username: '', email: '', password: '' }}
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
                            <Field name="email" type="email" className="w-full border p-2" placeholder="邮箱" />
                            {errors.email && touched.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                        </div>
                        <div>
                            <Field name="password" type="password" className="w-full border p-2" placeholder="密码" />
                            {errors.password && touched.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">注册</button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

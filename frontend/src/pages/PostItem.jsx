import { useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import { success, error } from '../utils/toast'
import MapPicker from '../components/MapPicker'
import ImageUploader from '../components/ImageUploader'

const schema = Yup.object({
    title: Yup.string().required('请输入标题'),
    description: Yup.string().required('请输入描述'),
    category: Yup.string().required('请输入分类'),
    location: Yup.string().required('请输入地点描述'),
    latitude: Yup.number().required('请在地图上点击选择坐标'), // 错误信息更明确
    longitude: Yup.number().required('请在地图上点击选择坐标'),
    date: Yup.string().required('请选择日期'),
    type: Yup.string().oneOf(['lost', 'found']).required('请选择类型')
})

export default function PostItem() {
    const navigate = useNavigate()
    const [imageFiles, setImageFiles] = useState([])

    const handleSubmit = async (values, { setSubmitting }) => {
        console.log("🚀 开始提交表单...", values); // Debug日志

        try {
            const formData = new FormData()

            // 添加文本数据
            for (const key in values) {
                formData.append(key, values[key])
            }

            // 添加图片文件 (确保是有效的文件对象)
            if (imageFiles.length > 0) {
                imageFiles.forEach((file, index) => {
                    console.log(`正在处理第 ${index + 1} 张图片:`, file.name);
                    formData.append('images', file)
                })
            }

            // 显示上传提示
            const loadingToast = success('正在上传数据...', { autoClose: false });

            await axios.post('/api/items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            success('发布成功 🎉')
            navigate('/')
        } catch (err) {
            console.error("❌ 提交失败:", err);
            error(err.response?.data?.error || '发布失败，请检查网络或控制台日志')
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">📤 发布物品信息</h2>

            <div className="prose max-w-none p-6 bg-white rounded shadow">
                <Formik
                    initialValues={{
                        title: '',
                        description: '',
                        category: '',
                        location: '',
                        latitude: '', // 初始为空，容易触发校验错误
                        longitude: '',
                        date: new Date().toISOString().split('T')[0],
                        type: 'lost'
                    }}
                    validationSchema={schema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, errors, touched, isValid, isSubmitting }) => (
                        <Form className="space-y-4">
                            {/* 1. 基础信息 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">类型</label>
                                    <Field as="select" name="type" className="mt-1 block w-full rounded-md border-gray-300 p-2 border">
                                        <option value="lost">❓ 丢失</option>
                                        <option value="found">✅ 拾获</option>
                                    </Field>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">日期</label>
                                    <Field type="date" name="date" className="mt-1 block w-full rounded-md border-gray-300 p-2 border" />
                                </div>
                            </div>

                            <div>
                                <Field name="title" placeholder="物品名称 (如：黑色钱包)" className="block w-full rounded-md border-gray-300 p-2 border" />
                                {touched.title && errors.title && <div className="text-red-500 text-xs mt-1">*{errors.title}</div>}
                            </div>

                            <div>
                                <Field as="textarea" name="description" rows={3} placeholder="详细描述..." className="block w-full rounded-md border-gray-300 p-2 border" />
                                {touched.description && errors.description && <div className="text-red-500 text-xs mt-1">*{errors.description}</div>}
                            </div>

                            <div>
                                <Field name="category" placeholder="分类 (如：电子产品)" className="block w-full rounded-md border-gray-300 p-2 border" />
                                {touched.category && errors.category && <div className="text-red-500 text-xs mt-1">*{errors.category}</div>}
                            </div>

                            {/* 2. 图片上传 */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">📸 图片上传 (支持拖拽排序)</label>
                                <ImageUploader
                                    files={imageFiles}
                                    setFiles={setImageFiles}
                                    maxFiles={5}
                                />
                            </div>

                            {/* 3. 地理位置 */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">📍 地点信息</label>
                                <Field name="location" placeholder="文字描述 (如：二教305)" className="block w-full rounded-md border-gray-300 p-2 border mb-2" />
                                {touched.location && errors.location && <div className="text-red-500 text-xs mb-2">*{errors.location}</div>}

                                <div className={`border rounded-md overflow-hidden ${errors.latitude ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                    <MapPicker setLatLng={({ latitude, longitude }) => {
                                        console.log("📍 地图选点:", latitude, longitude); // Debug日志
                                        setFieldValue('latitude', latitude)
                                        setFieldValue('longitude', longitude)
                                    }} />
                                </div>
                                {/* 强制显示地图错误，不管有没有 touch */}
                                {(errors.latitude || errors.longitude) && (
                                    <div className="text-red-600 text-sm font-bold mt-1 bg-red-50 p-2 rounded">
                                        ❌ 必须在地图上点击选择一个位置
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    已选坐标: {values.latitude || '未选择'}, {values.longitude || '未选择'}
                                </p>
                            </div>

                            {/* 🔴 错误汇总区域 (关键 Debug 点) */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                                    <strong>发布失败，请检查以下必填项：</strong>
                                    <ul className="list-disc pl-5 mt-1">
                                        {Object.values(errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                onClick={() => {
                                    // 这一步是为了在控制台看看到底有没有触发点击
                                    console.log("🖱️ 点击了发布按钮", "当前表单错误:", errors);
                                }}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${Object.keys(errors).length > 0 ? 'bg-red-400 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                                `}
                            >
                                {isSubmitting ? '🚀 正在发布...' : (Object.keys(errors).length > 0 ? '请先修正表单错误 ⚠️' : '🚀 立即发布')}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
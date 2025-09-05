import { useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import { success, error } from '../utils/toast'
import MapPicker from '../components/MapPicker'

const schema = Yup.object({
    title: Yup.string().required('请输入标题'),
    description: Yup.string().required('请输入描述'),
    category: Yup.string().required('请输入分类'),
    location: Yup.string().required('请输入地点'),
    latitude: Yup.number().required('请选择经纬度'),
    longitude: Yup.number().required('请选择经纬度'),
    date: Yup.string().required('请选择日期'),
    type: Yup.string().oneOf(['lost', 'found']).required('请选择类型')
})

export default function PostItem() {
    const [imageFiles, setImageFiles] = useState([])
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length + imageFiles.length > 5) {
            return error('最多只能上传5张图片')
        }
        setImageFiles(prev => [...prev, ...files])
    }

    const handleRemoveImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData()

            // 添加文本数据
            for (const key in values) {
                formData.append(key, values[key])
            }

            // 添加图片文件
            imageFiles.forEach(file => {
                formData.append('images', file)
            })

            await axios.post('/api/items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            success('发布成功 🎉')
            navigate('/')
        } catch (err) {
            error(err.response?.data?.error || '发布失败')
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
                        latitude: '',
                        longitude: '',
                        date: '',
                        type: 'lost'
                    }}
                    validationSchema={schema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, errors, touched }) => (
                        <Form className="space-y-4">
                            <Field
                                as="select"
                                name="type"
                                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="lost">❓ 丢失</option>
                                <option value="found">✅ 拾获</option>
                            </Field>

                            <Field
                                name="title"
                                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="物品名称"
                            />
                            {touched.title && errors.title && <div className="text-red-500 text-sm">{errors.title}</div>}

                            <Field
                                as="textarea"
                                name="description"
                                className="form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="物品描述"
                            />
                            {touched.description && errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}

                            <Field
                                name="category"
                                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="分类（如证件、电子产品）"
                            />
                            {touched.category && errors.category && <div className="text-red-500 text-sm">{errors.category}</div>}

                            <Field
                                name="location"
                                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="地点描述"
                            />
                            {touched.location && errors.location && <div className="text-red-500 text-sm">{errors.location}</div>}

                            <input
                                type="date"
                                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={values.date}
                                onChange={e => setFieldValue('date', e.target.value)}
                            />
                            {touched.date && errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}

                            <label className="block font-medium">📍 点击地图选择地点</label>
                            <MapPicker setLatLng={({ latitude, longitude }) => {
                                setFieldValue('latitude', latitude)
                                setFieldValue('longitude', longitude)
                            }} />
                            <p className="text-sm text-gray-600">坐标：{values.latitude}, {values.longitude}</p>
                            {(touched.latitude && errors.latitude) || (touched.longitude && errors.longitude) ? (
                                <div className="text-red-500 text-sm">请在地图上选点</div>
                            ) : null}

                            <label className="block font-medium">📷 上传图片（最多5张）</label>
                            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-gray-50">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-4
                                        file:rounded file:border-0 file:text-sm file:font-semibold
                                        file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                                <p className="text-sm text-gray-500 mt-2">点击上传 JPG/PNG 图片</p>
                            </div>

                            {imageFiles.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    {imageFiles.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img src={URL.createObjectURL(file)} alt="上传图" className="h-24 w-full object-cover rounded shadow" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100"
                                                title="删除"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                                发布
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { success, error } from '../utils/toast'

const BASE_URL = 'http://localhost:5000'

const schema = Yup.object({
  title: Yup.string().required('标题不能为空'),
  description: Yup.string().required('描述不能为空'),
  category: Yup.string().required('分类不能为空'),
  location: Yup.string().required('地点不能为空'),
  date: Yup.string().required('日期不能为空'),
  type: Yup.string().oneOf(['lost', 'found']).required(),
})

export default function EditItem() {
  const { id } = useParams()
  const nav = useNavigate()
  const [initialValues, setInitialValues] = useState(null)
  const [imageFiles, setImageFiles] = useState([]) // 存储新选择的图片 File 对象
  const [imagePreviews, setImagePreviews] = useState([]) // 存储用于预览的图片 URL

  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(res => {
        const data = res.data
        setInitialValues({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          date: data.date?.slice(0, 10),
          type: data.type,
        })
        // 设置初始图片预览
        const existingImageUrls = Array.isArray(data.images) ? data.images.map(url => `${BASE_URL}${url}`) : [];
        setImagePreviews(existingImageUrls);
      })
      .catch(() => error('获取物品信息失败'))
  }, [id])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      return error('最多只能上传5张图片');
    }
    setImageFiles(files);
    // 更新预览
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // 添加文本数据
      for (const key in values) {
        formData.append(key, values[key]);
      }

      // 如果有新图片，则添加
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      await axios.put(`/api/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      success('✅ 更新成功');
      nav('/my-items');
    } catch (err) {
      error(err.response?.data?.error || '❌ 更新失败');
    }
  };

  if (!initialValues) return <div>加载中...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">✏️ 编辑物品信息</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
        enableReinitialize // 允许表单在 initialValues 变化时重置
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            {/* 表单字段 */}
            <div>
              <label className="block font-medium">类型</label>
              <Field as="select" name="type" className="w-full border rounded p-2">
                <option value="lost">❓ 丢失</option>
                <option value="found">✅ 拾获</option>
              </Field>
            </div>
            <div>
              <label className="block font-medium">标题</label>
              <Field name="title" className="w-full border rounded p-2" />
              {touched.title && errors.title && <div className="text-red-500 text-sm">{errors.title}</div>}
            </div>
            <div>
              <label className="block font-medium">描述</label>
              <Field as="textarea" name="description" className="w-full border rounded p-2" />
              {touched.description && errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
            </div>
            <div>
              <label className="block font-medium">分类</label>
              <Field name="category" className="w-full border rounded p-2" />
              {touched.category && errors.category && <div className="text-red-500 text-sm">{errors.category}</div>}
            </div>
            <div>
              <label className="block font-medium">地点</label>
              <Field name="location" className="w-full border rounded p-2" />
              {touched.location && errors.location && <div className="text-red-500 text-sm">{errors.location}</div>}
            </div>
            <div>
              <label className="block font-medium">日期</label>
              <Field type="date" name="date" className="w-full border rounded p-2" />
              {touched.date && errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
            </div>

            {/* 图片上传和预览 */}
            <div>
              <label className="block font-medium">📷 上传新图片（将替换所有旧图片）</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img src={src} alt={`预览 ${index + 1}`} className="h-24 w-full object-cover rounded shadow" />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">提交修改</button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
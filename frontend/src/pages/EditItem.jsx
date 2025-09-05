import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const schema = Yup.object({
  title: Yup.string().required(),
  description: Yup.string().required(),
  category: Yup.string().required(),
  location: Yup.string().required(),
  date: Yup.string().required(),
  type: Yup.string().oneOf(['lost','found']).required(),
})

export default function EditItem() {
  const { id } = useParams()
  const nav = useNavigate()
  const [initValues, setInit] = useState(null)

  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(res => {
        const data = res.data
        setInit({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          date: data.date?.slice(0,10),
          type: data.type,
        })
      })
      .catch(() => alert('获取失败'))
  }, [id])

  if (!initValues) return <div>加载中...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">✏️ 编辑物品</h2>
      <Formik
        initialValues={initValues}
        validationSchema={schema}
        onSubmit={async (vals) => {
          try {
            await axios.put(`/api/items/${id}`, vals)
            alert('✅ 更新成功')
            nav('/my-items')
          } catch {
            alert('❌ 更新失败')
          }
        }}
      >
        {({ errors, touched }) => (
        <Form className="space-y-4">
          {['type','title','description','category','location','date'].map(name => (
            <div key={name}>
              <label className="block font-medium">{name.toUpperCase()}</label>
              {name === 'description' ? (
                <Field as="textarea" name={name} className="w-full border rounded p-2" />
              ) : name === 'type' ? (
                <Field as="select" name="type" className="w-full border rounded p-2">
                  <option value="lost">丢失</option>
                  <option value="found">拾获</option>
                </Field>
              ) : (
                <Field type={name === 'date' ? 'date' : 'text'} name={name}
                  className="w-full border rounded p-2" />
              )}
              {touched[name] && errors[name] && <div className="text-red-500 text-sm">{errors[name]}</div>}
            </div>
          ))}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">提交修改</button>
        </Form>
        )}
      </Formik>
    </div>
  )
}

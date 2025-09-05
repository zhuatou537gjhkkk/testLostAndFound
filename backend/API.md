# 📚 校园失物招领平台 API 文档

## 🌐 Base URL

```
http://localhost:5000
```

所有受保护接口需添加 JWT：

```
Authorization: Bearer <token>
```

---

## 🧑 用户认证模块

### ▶️ POST /api/auth/register

注册新用户。

- 请求体：

```json
{
  "username": "张三",
  "password": "123456",
  "email": "zhangsan@example.com"
}
```

- 响应：

```json
{
  "token": "JWT_TOKEN"
}
```

---

### ▶️ POST /api/auth/login

用户登录。

- 请求体：

```json
{
  "username": "张三",
  "password": "123456"
}
```

- 响应：

```json
{
  "token": "JWT_TOKEN"
}
```

---

## 📦 物品管理模块

### ▶️ POST /api/items

发布失物或拾物信息（需要登录）。

- 请求头：

```
Authorization: Bearer <token>
```

- 请求体：

```json
{
  "title": "学生证",
  "description": "在教学楼A掉了",
  "location": "教学楼A",
  "latitude": 39.914,
  "longitude": 116.405,
  "type": "lost",
  "category": "证件类",
  "date": "2025-07-01",
  "images": ["/uploads/xx1.jpg", "/uploads/xx2.jpg"]
}


```

- 响应：

```json

{
  "id": 10,
  "title": "学生证",
  ...
}


```

---

### ▶️ GET /api/items/mine

获取当前用户发布的物品信息。

消息头：

```
Authorization: Bearer <JWT_TOKEN>

```
- 响应：

```json
[
  {
    "id": 1,
    "title": "耳机",
    "images": ["/uploads/1.jpg", "/uploads/2.jpg"],
    "latitude": 39.914,
    "longitude": 116.403
  }
]

```

---

### ▶️ DELETE /api/items/:id

删除发布的信息（仅限本人）。

消息头：

```
Authorization: Bearer <JWT_TOKEN>

```

- 响应：

```json
{ "message": "删除成功" }
```

---

### ▶️ GET /api/items/search

搜索物品信息（综合搜索+地理范围筛选）。

#### 可选查询参数

- `keyword`：关键词
    
- `category`：分类
    
- `location`：地点名模糊匹配
    
- `latitude`、`longitude`：坐标点
    
- `radius`：范围（默认1公里



示例

```
GET /items/search?location=图书馆
GET /items/search?latitude=39.91&longitude=116.40&radius=1.5


```


- response：
  

```
[
  {
    "id": 5,
    "title": "黑色钱包",
    "images": ["/uploads/1.jpg", "/uploads/2.jpg"],
    "latitude": 39.914,
    "longitude": 116.403,
    "type": "lost"
  }
]

```

---
## 📤 图片上传

### POST /api/upload/images

上传多张图片

**FormData**

```
`images: [file1, file2, file3...]`
```


**Response**

```
{   "urls": ["/uploads/xxx1.jpg", "/uploads/yyy1.jpg"] }
```




---

## 📬 通知模块（测试用）

### ▶️ POST /api/notify/test-email

发送邮件通知。

```json
{
  "email": "test@example.com",
  "subject": "测试邮件",
  "message": "你好，这是测试"
}
```


---

## ✉️ 站内信模块

### ▶️ POST /api/messages

发送站内信。

```json
{
  "receiverId": 3,
  "content": "你好，我可能捡到了你的U盘"
}
```

---

### ▶️ GET /api/messages

获取收件箱。

```json
[
  {
    "id": 5,
    "content": "系统提醒：你可能丢失了U盘",
    "isRead": false,
    "Sender": {
      "username": "系统"
    }
  }
]
```

---

### ▶️ PATCH /api/messages/:id/read

标记站内信为已读。

```json
{ "message": "已标记为已读" }
```

---

### ▶️ DELETE /api/messages/:id

删除站内信。

```json
{ "message": "消息已删除" }
```

---

## 🛡️ 错误状态码说明

| 状态码 | 描述              |
|--------|-------------------|
| 200    | 请求成功          |
| 201    | 创建成功          |
| 400    | 请求参数错误      |
| 401    | 未登录或认证失败  |
| 403    | 无权限或token失效 |
| 404    | 资源未找到        |
| 500    | 服务器内部错误    |

---

## ✅ JWT 认证说明

在请求头加入：

```
Authorization: Bearer <token>
```

# Campus_LostAndFound

## 前端

## 后端
结构说明

lost-found-backend/
├── config/
│   └── db.js   #数据库连接配置
├── controllers/    #各模块控制器
│   └── authController.js
│   └── itemController.js
├── middleware/
│   └── authMiddleware.js  #JWT验证中间件
├── models/
│   ├── index.js
│   ├── user.js
│   └── item.js
├── routes/
│   └── authRoutes.js
│   └── itemRoutes.js
├── utils
|   └── sendEmail.js  #邮件提醒
├── .env
├── server.js   #主服务器文件
└── package.json

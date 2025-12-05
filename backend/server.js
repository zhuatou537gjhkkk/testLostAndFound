// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // 1. 引入 http
const { Server } = require('socket.io'); // 2. 引入 Socket.IO
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notifyRoutes = require('./routes/notifyRoutes');

dotenv.config();
const app = express();

// 3. 创建 HTTP 服务器
const server = http.createServer(app);

// 4. 初始化 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // 允许跨域
    methods: ["GET", "POST"]
  }
});

// 5. 监听 Socket 连接
io.on('connection', (socket) => {
  console.log('🔌 新客户端连接:', socket.id);

  // 用户登录后加入以自己 ID 命名的房间，方便接收私信
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`用户 ${userId} 已加入房间 user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('客户端断开连接');
  });
});

// 6. 将 io 挂载到 app，方便 Controller 调用
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', require('./routes/uploadRoutes'));

sequelize.sync().then(() => {
  console.log('✅ 数据库已同步');
  // 7. 注意这里改为 server.listen 而不是 app.listen
  server.listen(process.env.PORT || 5000, () => {
    console.log('🚀 服务器已启动 (支持 WebSocket)');
  });
});
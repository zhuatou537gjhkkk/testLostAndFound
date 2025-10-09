// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notifyRoutes = require('./routes/notifyRoutes');


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 👇 *** 修改这里 ***
// 注释: 将 sequelize.sync({ force: true }) 修改为 sequelize.sync()。
// force: true 会在每次服务器启动时删除所有表并重建，导致数据丢失。
// 修改后的 sequelize.sync() 只会在表不存在时创建它们，从而实现数据的持久化。
sequelize.sync().then(() => {
  console.log('✅ 数据库已同步'); // 修改日志信息
  app.listen(process.env.PORT || 5000, () => {
    console.log('🚀 服务器已启动');
  });
});
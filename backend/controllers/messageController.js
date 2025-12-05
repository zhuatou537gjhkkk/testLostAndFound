// backend/controllers/messageController.js

const { Message, User } = require('../models');

// 发消息
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ error: '接收者不存在' });

    const msg = await Message.create({ content, senderId: req.user.id, receiverId });

    // ✅ 核心修改：获取 io 实例并推送消息
    const io = req.app.get('io');

    // 获取发送者信息，方便前端展示
    const msgWithSender = await Message.findOne({
      where: { id: msg.id },
      include: [{ model: User, as: 'Sender', attributes: ['username'] }]
    });

    // 推送到接收者的房间
    io.to(`user_${receiverId}`).emit('new_message', msgWithSender);
    // 同时给自己发一个（用于多端同步，可选）
    // io.to(`user_${req.user.id}`).emit('message_sent', msgWithSender);

    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ... 其他方法保持不变 (getInbox, markRead, deleteMessage)
exports.getInbox = async (req, res) => {
  const messages = await Message.findAll({
    where: { receiverId: req.user.id },
    include: [{ model: User, as: 'Sender', attributes: ['username'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(messages);
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  const msg = await Message.findOne({ where: { id, receiverId: req.user.id } });
  if (!msg) return res.status(404).json({ error: '消息不存在' });
  msg.isRead = true;
  await msg.save();
  res.json({ message: '已标记为已读' });
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  await Message.destroy({ where: { id, receiverId: req.user.id } });
  res.json({ message: '消息已删除' });
};
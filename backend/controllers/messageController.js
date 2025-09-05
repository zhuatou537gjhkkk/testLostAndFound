// backend/controllers/messageController.js

const { Message, User } = require('../models');

// 发消息
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ error: '接收者不存在' });

    // ✅ 这里也要用 req.user.id
    const msg = await Message.create({ content, senderId: req.user.id, receiverId });
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 获取我收到的消息
exports.getInbox = async (req, res) => {
  const messages = await Message.findAll({
    where: { receiverId: req.user.id }, // ✅ 修复：使用 req.user.id
    include: [{ model: User, as: 'Sender', attributes: ['username'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(messages);
};

// 标记已读
exports.markRead = async (req, res) => {
  const { id } = req.params;
  const msg = await Message.findOne({ where: { id, receiverId: req.user.id } }); // ✅ 修复：使用 req.user.id
  if (!msg) return res.status(404).json({ error: '消息不存在' });
  msg.isRead = true;
  await msg.save();
  res.json({ message: '已标记为已读' });
};

// 删除消息
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  // ✅ 修复：使用 req.user.id
  await Message.destroy({ where: { id, receiverId: req.user.id } });
  res.json({ message: '消息已删除' });
};
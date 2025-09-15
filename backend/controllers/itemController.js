const { Item, User, Message } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');
const { shouldNotify } = require('../utils/notifyThrottle');

// (createItem, getMyItems, deleteItem, searchItems, getItemById 函数保持不变)
exports.createItem = async (req, res) => {
  // ... 代码不变
};
exports.getMyItems = async (req, res) => {
  // ... 代码不变
};
exports.deleteItem = async (req, res) => {
  // ... 代码不变
};
exports.searchItems = async (req, res) => {
  // ... 代码不变
};
exports.getItemById = async (req, res) => {
  // ... 代码不变
};

// ✅ 修改物品状态 (最终修复版)
exports.updateItemStatus = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await Item.findOne({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: '未找到或无权限操作' });

    // 切换状态
    item.status = item.status === 'open' ? 'resolved' : 'open';
    await item.save();

    // 关键修复：确保返回给前端的数据是经过 toJSON() 序列化的纯净对象
    const returnedItem = item.toJSON();

    res.json({ message: '状态更新成功', item: returnedItem });
  } catch (err) {
    console.error('状态更新失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};


// 更新物品信息 (无变动)
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await Item.findOne({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: '未找到或无权限操作' });

    const fields = ['title', 'description', 'category', 'location', 'date', 'type'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      item.images = newImages;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('编辑失败:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
}
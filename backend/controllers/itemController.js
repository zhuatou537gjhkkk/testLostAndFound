const { Item, User, Message } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');
const { shouldNotify } = require('../utils/notifyThrottle');

// 发布新物品
exports.createItem = async (req, res) => {
  try {
    const { title, description, category, location, latitude, longitude, date, type } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newItem = await Item.create({
      title,
      description,
      category,
      location,
      latitude,
      longitude,
      date,
      type,
      images,
      userId: req.user.id
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error('创建物品失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取我发布的物品
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error('获取我的物品失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除物品
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const item = await Item.findOne({ where: { id, userId } });
    if (!item) {
      return res.status(404).json({ error: '未找到物品或无权限删除' });
    }
    await item.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除物品失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 搜索物品
exports.searchItems = async (req, res) => {
  try {
    const { keyword, category, location, type } = req.query;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }
    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }
    if (type) {
      where.type = type;
    }

    const items = await Item.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
    res.json(items);
  } catch (err) {
    console.error('搜索物品失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 根据ID获取单个物品详情
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
    if (!item) {
      return res.status(404).json({ error: '物品不存在' });
    }
    res.json(item);
  } catch (err) {
    console.error('获取物品详情失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
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
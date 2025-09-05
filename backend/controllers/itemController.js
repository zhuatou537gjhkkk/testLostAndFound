const { Item, User, Message } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');
const { shouldNotify } = require('../utils/notifyThrottle');

// ✅ 创建物品
exports.createItem = async (req, res) => {
  try {
    const reverseType = req.body.type === 'lost' ? 'found' : 'lost';
    const keywords = [...new Set(req.body.title.split(/[\s,，。:：]/).filter(word => word.length >= 2))];

    const related = await Item.findAll({
      where: {
        type: reverseType,
        category: req.body.category,
        [Op.or]: [
          { location: { [Op.like]: `%${req.body.location}%` } },
          ...keywords.map(k => ({ title: { [Op.like]: `%${k}%` } }))
        ],
        date: {
          [Op.between]: [
            new Date(new Date(req.body.date) - 1000 * 60 * 60 * 24 * 5),
            new Date(new Date(req.body.date).getTime() + 1000 * 60 * 60 * 24 * 5)
          ]
        }
      },
      include: [{ model: User }]
    });

    for (const match of related) {
      const matchedUser = match.User;
      if (!matchedUser) continue;

      const uid = matchedUser.id;
      const msg = `系统检测到可能与您相关的${req.body.type === 'lost' ? '失物' : '拾物'}：${req.body.title}，请及时登录核对！`;

      if (await shouldNotify(uid, 'inbox', 3600 * 6)) {
        await Message.create({
          content: msg,
          senderId: req.user.id,
          receiverId: uid
        });
      }

      if (matchedUser.email && await shouldNotify(uid, 'email', 3600 * 6)) {
        await sendEmail(
          matchedUser.email,
          `📢 校园${req.body.type === 'lost' ? '失物' : '拾物'}匹配提醒`,
          `<p>${msg}</p>`
        );
      }
    }

    const images = req.files.map(file => `/uploads/${file.filename}`);

    const item = await Item.create({
      ...req.body,
      userId: req.user.id,
      images, // ✅ 写入图片数组
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('❌ 创建物品失败', err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ 获取自己发布的
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ 确保来自中间件解析的 user

    const items = await Item.findAll({
      where: { userId: req.user.id},
      order: [['createdAt', 'DESC']], // 📌 最近发布的排前面
    });

    // ✅ 确保每个 item 的 images 是数组
    const result = items.map(item => ({
      ...item.toJSON(),
      images: Array.isArray(item.images) ? item.images : []
    }));

    res.json(result);
  } catch (err) {
    console.error('获取用户发布的物品失败 ❌:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
};


// ✅ 删除
exports.deleteItem = async (req, res) => {
  await Item.destroy({ where: { id: req.params.id, userId: req.user.id } }); // ✅ 修复点
  res.json({ message: '删除成功' });
};

// ✅ 搜索接口
exports.searchItems = async (req, res) => {
  try {
    const { keyword, category, location, type, latitude, longitude, radius = 1 } = req.query;
    const where = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (location) where.location = { [Op.like]: `%${location}%` };

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const delta = radius / 111;
      where.latitude = { [Op.between]: [lat - delta, lat + delta] };
      where.longitude = { [Op.between]: [lng - delta, lng + delta] };
    }

    const results = await Item.findAll({ where });
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ 详情页接口
exports.getItemById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: '未找到该物品' });
    }

    // ✅ 确保 images 是数组格式
    const result = {
      ...item.toJSON(),
      images: Array.isArray(item.images) ? item.images : []
    };

    res.json(result);
  } catch (err) {
    console.error('获取详情失败:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
};


// ✅ 修改物品状态（标记为已找回）
exports.updateItemStatus = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await Item.findOne({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: '未找到或无权限操作' });

    item.status = 'resolved';
    await item.save();
    res.json({ message: '状态已更新为已找回' });
  } catch (err) {
    console.error('状态更新失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};


exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await Item.findOne({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: '未找到或无权限操作' });

    // 可更新的字段
    const fields = ['title','description','category','location','date','type','latitude','longitude'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('编辑失败:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
}

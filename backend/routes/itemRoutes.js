const { Item } = require('../models');

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createItem, getMyItems, deleteItem,
  searchItems, getItemById, updateItem,
  updateItemStatus
} = require('../controllers/itemController');
const { multipleUpload } = require('../middleware/upload');

router.post('/', auth, multipleUpload, createItem);
router.get('/mine', auth, getMyItems);
router.delete('/:id', auth, deleteItem);
router.get('/search', searchItems);
router.get('/:id', getItemById); // ✅ 正确写法

// routes/itemRoutes.js
router.get('/debug/all', async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// routes/itemRoutes.js

// 标记找回
router.patch('/:id/status', auth, updateItemStatus);
// 更新物品信息（只允许本人），并添加 multipleUpload 中间件
router.put('/:id', auth, multipleUpload, updateItem)


module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sendMessage, getInbox, markRead, deleteMessage } = require('../controllers/messageController');

router.post('/', auth, sendMessage);               // 发送消息
router.get('/', auth, getInbox);                   // 获取收件箱
router.patch('/:id/read', auth, markRead);         // 标记为已读
router.delete('/:id', auth, deleteMessage);        // 删除消息

module.exports = router;

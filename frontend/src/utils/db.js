// frontend/src/utils/db.js
import Dexie from 'dexie';

export const db = new Dexie('CampusLostFoundDB');

// 定义表结构：++id 自增主键
db.version(1).stores({
    offlineMessages: '++id, content, receiverId, timestamp'
});
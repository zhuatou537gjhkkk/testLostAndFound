-- ===============================================================
-- 校内失物招领平台数据库 Schema (v5 - 联系方式改为邮箱)
-- 文件名: schema.sql
-- 描述: 用于创建所有表结构的SQL脚本。
-- ===============================================================

-- 为了方便重复执行，先删除已存在的表
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- 创建 users (用户) 表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    -- 更新: 将 contactInfo 改为 email，并增加 UNIQUE 约束
    email TEXT NOT NULL UNIQUE
);

-- 创建 items (物品) 表
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved')),
    location TEXT,
    itemDate DATETIME NOT NULL,
    imageUrl TEXT,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建 messages (私信) 表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    itemId INTEGER NOT NULL,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users (id) ON DELETE CASCADE
);

-- (可选) 为常用查询字段创建索引
CREATE INDEX idxItemsTypeStatusCategory ON items (type, status, category);
CREATE INDEX idxMessagesItemId ON messages (itemId);
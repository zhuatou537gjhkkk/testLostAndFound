# 文件名: initializeDb.py
# 描述: 用于初始化数据库，创建表并填充遵循驼峰命名法的模拟数据。(v4)

import sqlite3
import hashlib
from faker import Faker
import os
from datetime import datetime

# --- 配置区 ---
dbName = 'campus.db'
schemaFile = 'schema.sql'
numUsers = 10
numItems = 50

# 初始化 Faker
fakerInstance = Faker('zh_CN')

def hashPassword(password):
    """对密码进行 SHA-256 哈希加密"""
    return hashlib.sha256(password.encode()).hexdigest()

def initializeDatabase():
    """主函数，执行数据库初始化所有步骤"""

    if os.path.exists(dbName):
        os.remove(dbName)
        print(f"旧数据库 '{dbName}' 已删除。")

    dbConnection = sqlite3.connect(dbName)
    dbCursor = dbConnection.cursor()
    print(f"数据库 '{dbName}' 已创建并连接。")

    try:
        with open(schemaFile, 'r', encoding='utf-8') as sqlFile:
            dbCursor.executescript(sqlFile.read())
        print(f"成功执行 '{schemaFile}'，表结构已创建。")
    except FileNotFoundError:
        print(f"错误: 未找到 '{schemaFile}' 文件。请确保它和本脚本在同一目录下。")
        dbConnection.close()
        return

    print(f"正在生成 {numUsers} 个模拟用户...")
    userList = []
    for _ in range(numUsers):
        userName = fakerInstance.unique.user_name()
        password = 'password123'
        passwordHash = hashPassword(password)
        # 更新: 从生成电话号码改为生成唯一的邮箱地址
        userEmail = fakerInstance.unique.email()
        userList.append((userName, passwordHash, userEmail))

    # 更新: INSERT 语句中的列名改为 email
    dbCursor.executemany("INSERT INTO users (username, passwordHash, email) VALUES (?, ?, ?)", userList)
    print("模拟用户数据插入成功。")

    # (物品和消息部分无需改动，保持原样)
    print(f"正在生成 {numItems} 个模拟物品...")
    itemList = []
    categoryOptions = ['电子产品', '证件', '书籍', '雨伞', '钥匙', '衣物', '其他']
    typeOptions = ['lost', 'found']
    for _ in range(numItems):
        itemName = fakerInstance.bs().capitalize()
        itemDescription = fakerInstance.text(max_nb_chars=120)
        itemCategory = fakerInstance.random_element(elements=categoryOptions)
        itemType = fakerInstance.random_element(elements=typeOptions)
        itemStatus = 'open'
        itemLocation = fakerInstance.street_address()
        itemDate = fakerInstance.date_time_between(start_date='-1y', end_date='now')
        userId = fakerInstance.random_int(min=1, max=numUsers)
        itemList.append((itemName, itemDescription, itemCategory, itemType, itemStatus, itemLocation, itemDate, userId))
    
    dbCursor.executemany(
        "INSERT INTO items (name, description, category, type, status, location, itemDate, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        itemList
    )
    print("模拟物品数据插入成功。")

    dbConnection.commit()
    dbConnection.close()
    print(f"所有更改已提交，数据库连接已关闭。")
    print("\n🎉 数据库初始化成功！")

if __name__ == '__main__':
    initializeDatabase()
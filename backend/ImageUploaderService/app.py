# 文件名: app.py
# 描述: 图片上传微服务的核心代码 (驼峰命名法版本)

import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# --- 配置区 ---
uploadFolder = 'uploads'
allowedExtensions = {'png', 'jpg', 'jpeg', 'gif'}
maxContentLength = 16 * 1024 * 1024 # 16MB

# 初始化 Flask 应用
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = uploadFolder
app.config['MAX_CONTENT_LENGTH'] = maxContentLength

# 确保上传文件夹存在
os.makedirs(uploadFolder, exist_ok=True)

def isFileAllowed(filename):
    """检查文件名是否包含允许的扩展名"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowedExtensions

@app.route('/')
def helloWorld():
    """一个简单的测试路由，确保服务正在运行"""
    return '图片上传服务正在运行！'

@app.route('/upload', methods=['POST'])
def uploadFile():
    """处理图片上传的核心路由"""
    if 'file' not in request.files:
        return jsonify({'error': '请求中没有文件部分'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
        
    if file and isFileAllowed(file.filename):
        safeFilename = secure_filename(file.filename)
        extension = safeFilename.rsplit('.', 1)[1].lower()
        uniqueFilename = str(uuid.uuid4()) + '.' + extension
        
        filePath = os.path.join(app.config['UPLOAD_FOLDER'], uniqueFilename)
        file.save(filePath)
        
        fileUrl = f'/uploads/{uniqueFilename}'
        return jsonify({
            'message': '文件上传成功', 
            'url': fileUrl
        }), 201
    else:
        return jsonify({'error': '文件类型不被允许'}), 400

@app.route('/uploads/<filename>')
def getUploadedFile(filename):
    """提供一个路由，让浏览器可以访问并显示上传的图片"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
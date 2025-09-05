const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 保证 uploads 目录存在
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
    cb(null, safeName)
  }
})

const upload = multer({ storage })

module.exports = {
  singleUpload: upload.single('image'),
  multipleUpload: upload.array('images', 5)
}

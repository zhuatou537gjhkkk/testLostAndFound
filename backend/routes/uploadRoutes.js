const express = require('express')
const router = express.Router()
const path = require('path')
const { multipleUpload } = require('../middleware/upload')

router.post('/images', multipleUpload, (req, res) => {
  const urls = req.files.map(file => `/uploads/${file.filename}`)
  res.json({ urls })
})

module.exports = router

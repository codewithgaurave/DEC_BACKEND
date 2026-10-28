import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base uploads root: DEC_Backend/uploads
const UPLOAD_ROOT = path.join(__dirname, '../../uploads')

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Configure Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamic subfolder: services, projects, blog, general
    const subfolder = req.query.folder || req.body.folder || 'services'
    const targetDir = path.join(UPLOAD_ROOT, subfolder)
    ensureDirectoryExists(targetDir)
    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 40)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${baseName}-${uniqueSuffix}${ext}`)
  },
})

// File Type Validation Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `Invalid file format '${file.mimetype}'. Only JPEG, PNG, WEBP, and SVG images are allowed.`
      ),
      false
    )
  }
}

// Multer Upload Instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
})

export default upload

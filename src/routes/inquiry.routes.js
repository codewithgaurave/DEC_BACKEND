import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  getAllInquiries,
  getInquiryStats,
  getInquiryById,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
  seedInquiries,
  uploadResumeFile,
} from '../controllers/inquiry.controller.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RESUMES_DIR = path.join(__dirname, '../../uploads/resumes')

// Ensure resumes directory exists
if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true })
}

// Multer Storage for Resumes / CVs
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUMES_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 35)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`
    cb(null, `${baseName}-${uniqueSuffix}${ext}`)
  },
})

const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExts = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp']
  if (allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid resume file format. Allowed formats: PDF, DOC, DOCX, PNG, JPG.'), false)
  }
}

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
})

// Flexible middleware for 'resume', 'cv', or 'file' field
const handleResumeUploadMiddleware = (req, res, next) => {
  const uploadHandler = resumeUpload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])

  uploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: err.message || 'File upload error',
      })
    }

    if (req.files?.resume?.[0]) {
      req.file = req.files.resume[0]
    } else if (req.files?.cv?.[0]) {
      req.file = req.files.cv[0]
    } else if (req.files?.file?.[0]) {
      req.file = req.files.file[0]
    }

    next()
  })
}

const router = Router()

// Public Routes
router.post('/upload-resume', handleResumeUploadMiddleware, uploadResumeFile)
router.get('/stats', getInquiryStats)
router.get('/', getAllInquiries)
router.get('/:id', getInquiryById)
router.post('/', createInquiry)

// Admin Management Routes
router.patch('/:id/status', updateInquiryStatus)
router.delete('/:id', deleteInquiry)
router.post('/seed', seedInquiries)

export default router

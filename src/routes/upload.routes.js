import { Router } from 'express'
import {
  uploadSingleImage,
  uploadMultipleImages,
} from '../controllers/upload.controller.js'
import { upload } from '../middlewares/upload.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

/**
 * Handle Single Image Upload
 * Field name can be 'image' or 'file'
 */
const singleUploadMiddleware = (req, res, next) => {
  const uploadHandler = upload.fields([
    { name: 'image', maxCount: 1 },
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

    if (req.files?.image?.[0]) {
      req.file = req.files.image[0]
    } else if (req.files?.file?.[0]) {
      req.file = req.files.file[0]
    }

    next()
  })
}

// Single Image Upload Endpoint
router.post('/', authenticate, singleUploadMiddleware, uploadSingleImage)

// Multiple Images Upload Endpoint
router.post(
  '/multiple',
  authenticate,
  upload.array('images', 10),
  uploadMultipleImages
)

export default router

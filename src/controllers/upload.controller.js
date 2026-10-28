import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_ROOT = path.join(__dirname, '../../uploads')

/**
 * @desc    Upload Single Image to Backend
 * @route   POST /api/upload
 * @access  Private (Admin / SuperAdmin)
 */
export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No image file uploaded. Please attach an image field.',
      })
    }

    const subfolder = req.query.folder || req.body.folder || 'services'
    const relativeUrl = `/uploads/${subfolder}/${req.file.filename}`
    const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Image uploaded successfully to server storage.',
      data: {
        filename: req.file.filename,
        url: relativeUrl,
        fullUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Upload Multiple Images
 * @route   POST /api/upload/multiple
 * @access  Private (Admin / SuperAdmin)
 */
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No image files uploaded.',
      })
    }

    const subfolder = req.query.folder || req.body.folder || 'services'
    const uploaded = req.files.map((file) => {
      const relativeUrl = `/uploads/${subfolder}/${file.filename}`
      return {
        filename: file.filename,
        url: relativeUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${relativeUrl}`,
        size: file.size,
        mimetype: file.mimetype,
      }
    })

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Successfully uploaded ${uploaded.length} images to server storage.`,
      data: uploaded,
    })
  } catch (error) {
    next(error)
  }
}

export default {
  uploadSingleImage,
  uploadMultipleImages,
}

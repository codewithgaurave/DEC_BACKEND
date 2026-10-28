import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { uploadToCloudinary } from '../config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_ROOT = path.join(__dirname, '../../uploads')

/**
 * @desc    Upload Single Image to Backend & Cloudinary
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

    // Upload to Cloudinary for live cloud hosting (e.g. Render/production)
    let cloudinaryUrl = null
    let cloudinaryPublicId = null
    try {
      const cldResult = await uploadToCloudinary(req.file.path, subfolder)
      cloudinaryUrl = cldResult.secure_url
      cloudinaryPublicId = cldResult.public_id
    } catch (cldErr) {
      console.warn('⚠️ Cloudinary upload warning in uploadSingleImage:', cldErr.message)
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Image uploaded successfully to server storage and Cloudinary.',
      data: {
        filename: req.file.filename,
        // url defaults to Cloudinary HTTPS URL so live deployment has persistent assets,
        // with fallback to local relativeUrl
        url: cloudinaryUrl || relativeUrl,
        cloudinaryUrl: cloudinaryUrl || null,
        localUrl: relativeUrl,
        fullUrl: cloudinaryUrl || fullUrl,
        publicId: cloudinaryPublicId,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Upload Multiple Images to Backend & Cloudinary
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
    const uploaded = await Promise.all(
      req.files.map(async (file) => {
        const relativeUrl = `/uploads/${subfolder}/${file.filename}`
        const localFullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`
        let cloudinaryUrl = null
        let cloudinaryPublicId = null

        try {
          const cldResult = await uploadToCloudinary(file.path, subfolder)
          cloudinaryUrl = cldResult.secure_url
          cloudinaryPublicId = cldResult.public_id
        } catch (cldErr) {
          console.warn('⚠️ Cloudinary upload warning in uploadMultipleImages:', cldErr.message)
        }

        return {
          filename: file.filename,
          url: cloudinaryUrl || relativeUrl,
          cloudinaryUrl: cloudinaryUrl || null,
          localUrl: relativeUrl,
          fullUrl: cloudinaryUrl || localFullUrl,
          publicId: cloudinaryPublicId,
          size: file.size,
          mimetype: file.mimetype,
        }
      })
    )

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Successfully uploaded ${uploaded.length} images to server storage and Cloudinary.`,
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

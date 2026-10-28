import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oabhaa7a',
  api_key: process.env.CLOUDINARY_API_KEY || '912323528775259',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mmuXeuzJauq5nFNVSedVajVX7nI',
  secure: true,
})

/**
 * Upload local file to Cloudinary
 * @param {string} filePath - Absolute or relative path to local file
 * @param {string} folder - Cloudinary folder name (e.g. 'projects', 'services', 'gallery', 'blog', 'resumes')
 * @param {object} customOptions - Extra Cloudinary options
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
export const uploadToCloudinary = async (filePath, folder = 'general', customOptions = {}) => {
  try {
    const options = {
      folder: `dec/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...customOptions,
    }

    const result = await cloudinary.uploader.upload(filePath, options)
    return result
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error)
    throw error
  }
}

/**
 * Upload buffer to Cloudinary
 */
export const uploadBufferToCloudinary = (buffer, folder = 'general', customOptions = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `dec/${folder}`,
      resource_type: 'auto',
      ...customOptions,
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('❌ Cloudinary Stream Upload Error:', error)
        return reject(error)
      }
      resolve(result)
    })

    uploadStream.end(buffer)
  })
}

/**
 * Delete asset from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (error) {
    console.error('❌ Cloudinary Delete Error:', error)
    throw error
  }
}

export default cloudinary

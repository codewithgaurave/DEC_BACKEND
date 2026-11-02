import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Signature from '../models/Signature.model.js'
import { generateSignatureHtml } from '../utils/signatureTemplate.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const signaturesDir = path.resolve(__dirname, '../../uploads/signatures')

// Ensure directory exists
if (!fs.existsSync(signaturesDir)) {
  fs.mkdirSync(signaturesDir, { recursive: true })
}

const sanitizeFileName = (name = 'signature') => {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .replace(/\s+/g, '_') || 'signature'
  )
}

/**
 * Get all signatures (with search, sort, pagination)
 */
export const getAllSignatures = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50, sort = '-createdAt' } = req.query
    const query = {}

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [{ name: regex }, { designation: regex }, { email: regex }, { mobile: regex }]
    }

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const [signatures, total] = await Promise.all([
      Signature.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Signature.countDocuments(query),
    ])

    res.status(200).json({
      success: true,
      data: signatures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Get single signature
 */
export const getSignatureById = async (req, res, next) => {
  try {
    const signature = await Signature.findById(req.params.id)
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Email signature not found',
      })
    }

    res.status(200).json({
      success: true,
      data: signature,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Create a new signature & save HTML file
 */
export const createSignature = async (req, res, next) => {
  try {
    const { name, designation } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required',
      })
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Designation / Job Title is required',
      })
    }

    // Generate HTML
    const htmlContent = generateSignatureHtml(req.body)

    // Generate file name & save HTML file to disk
    const safeName = sanitizeFileName(name)
    const fileName = `${safeName}_${Date.now()}.html`
    const filePath = path.join(signaturesDir, fileName)
    fs.writeFileSync(filePath, htmlContent, 'utf8')

    const fileUrl = `/uploads/signatures/${fileName}`

    // Create DB Record
    const signature = await Signature.create({
      ...req.body,
      name: name.trim(),
      designation: designation.trim(),
      htmlContent,
      fileName,
      fileUrl,
    })

    res.status(201).json({
      success: true,
      message: 'Email signature created and HTML file generated successfully',
      data: signature,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Update an existing signature & re-generate HTML file
 */
export const updateSignature = async (req, res, next) => {
  try {
    const signature = await Signature.findById(req.params.id)
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Email signature not found',
      })
    }

    // Merge updated payload
    const updatedData = { ...signature.toObject(), ...req.body }

    // Re-generate HTML
    const htmlContent = generateSignatureHtml(updatedData)

    // Save to file (reuse existing or create new file if name changed)
    const safeName = sanitizeFileName(updatedData.name)
    let fileName = signature.fileName
    if (!fileName || !fileName.endsWith('.html')) {
      fileName = `${safeName}_${Date.now()}.html`
    }

    const filePath = path.join(signaturesDir, fileName)
    fs.writeFileSync(filePath, htmlContent, 'utf8')
    const fileUrl = `/uploads/signatures/${fileName}`

    // Update in DB
    Object.assign(signature, req.body, {
      htmlContent,
      fileName,
      fileUrl,
    })

    await signature.save()

    res.status(200).json({
      success: true,
      message: 'Email signature updated and HTML file regenerated successfully',
      data: signature,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Delete a signature & delete HTML file
 */
export const deleteSignature = async (req, res, next) => {
  try {
    const signature = await Signature.findById(req.params.id)
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Email signature not found',
      })
    }

    // Remove file if exists
    if (signature.fileName) {
      const filePath = path.join(signaturesDir, signature.fileName)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkErr) {
          console.warn('Could not delete signature file:', unlinkErr.message)
        }
      }
    }

    await Signature.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Email signature deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Direct file download endpoint
 */
export const downloadSignatureHtml = async (req, res, next) => {
  try {
    const signature = await Signature.findById(req.params.id)
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Email signature not found',
      })
    }

    const clientFileName = `${sanitizeFileName(signature.name) || 'Email_Signature'}.html`
    const filePath = path.join(signaturesDir, signature.fileName || '')

    if (fs.existsSync(filePath)) {
      return res.download(filePath, clientFileName)
    }

    // Fallback if file not on disk: stream htmlContent
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${clientFileName}"`)
    return res.send(signature.htmlContent || generateSignatureHtml(signature))
  } catch (err) {
    next(err)
  }
}

/**
 * Direct HTML preview (raw HTML rendered in browser)
 */
export const previewSignatureRawHtml = async (req, res, next) => {
  try {
    const signature = await Signature.findById(req.params.id)
    if (!signature) {
      return res.status(404).send('<h1>Email signature not found</h1>')
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(signature.htmlContent || generateSignatureHtml(signature))
  } catch (err) {
    next(err)
  }
}

/**
 * Seed initial sample signature if database is empty
 */
export const seedInitialSignature = async (req, res, next) => {
  try {
    const existing = await Signature.findOne({ name: 'Islam Farid' })
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Islam Farid signature already exists',
        data: existing,
      })
    }

    const initialData = {
      name: 'Islam Farid',
      qualifications: 'MSc, MBA, MCIOB, PMP',
      designation: 'Founding Partner & General Manager',
      mobile: '(+974) 31601117',
      telephone: '(+974) 44554383',
      email: 'islam@desentralqatar.com',
      address: 'Office 704, Manarat Lusail Tower, Qatar',
      addressUrl: 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
      website: 'www.desentralqatar.com',
      websiteUrl: 'https://desentralqatar.com/',
      linkedin: 'LinkedIn',
      linkedinUrl: 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
    }

    const htmlContent = generateSignatureHtml(initialData)
    const fileName = 'Islam_Farid.html'
    const filePath = path.join(signaturesDir, fileName)
    fs.writeFileSync(filePath, htmlContent, 'utf8')

    const fileUrl = `/uploads/signatures/${fileName}`

    const seeded = await Signature.create({
      ...initialData,
      htmlContent,
      fileName,
      fileUrl,
    })

    res.status(201).json({
      success: true,
      message: 'Islam Farid initial signature seeded successfully',
      data: seeded,
    })
  } catch (err) {
    next(err)
  }
}

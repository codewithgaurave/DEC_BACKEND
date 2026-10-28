import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Inquiry from '../models/Inquiry.model.js'
import { SEED_INQUIRIES } from '../data/seedInquiries.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RESUMES_DIR = path.join(__dirname, '../../uploads/resumes')

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Helper to convert base64 CV into a physical file on disk in uploads/resumes
 */
const saveBase64ResumeToFile = (cvData, applicantName) => {
  if (!cvData || !cvData.base64) return cvData

  try {
    ensureDirectoryExists(RESUMES_DIR)

    const matches = cvData.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    let fileBuffer
    let ext = '.pdf'

    if (matches && matches.length === 3) {
      fileBuffer = Buffer.from(matches[2], 'base64')
      const mime = matches[1].toLowerCase()
      if (mime.includes('pdf')) ext = '.pdf'
      else if (mime.includes('word') || mime.includes('officedocument') || mime.includes('doc')) ext = '.docx'
      else if (mime.includes('png')) ext = '.png'
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg'
    } else {
      fileBuffer = Buffer.from(cvData.base64, 'base64')
    }

    if (cvData.filename && path.extname(cvData.filename)) {
      ext = path.extname(cvData.filename).toLowerCase()
    }

    const safeName = (applicantName || 'candidate')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30)

    const uniqueFilename = `${safeName}-${Date.now()}${ext}`
    const filePath = path.join(RESUMES_DIR, uniqueFilename)

    fs.writeFileSync(filePath, fileBuffer)

    return {
      filename: cvData.filename || uniqueFilename,
      contentType: cvData.contentType || 'application/pdf',
      url: `/uploads/resumes/${uniqueFilename}`,
      base64: '', // clear huge payload from DB
    }
  } catch (err) {
    console.error('Failed to save base64 CV to physical file:', err)
    return cvData
  }
}

/**
 * @desc    Upload Candidate Resume File (Multipart)
 * @route   POST /api/inquiries/upload-resume
 * @access  Public
 */
export const uploadResumeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No resume file provided.',
      })
    }

    const relativeUrl = `/uploads/resumes/${req.file.filename}`

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Resume file uploaded successfully.',
      data: {
        filename: req.file.originalname,
        storedName: req.file.filename,
        contentType: req.file.mimetype,
        size: req.file.size,
        url: relativeUrl,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || 'Error uploading resume file.',
    })
  }
}

/**
 * @desc    Get All Inquiries & Career Applications
 * @route   GET /api/inquiries
 * @access  Public / Admin
 */
export const getAllInquiries = async (req, res, next) => {
  try {
    const {
      type,
      status,
      discipline,
      position,
      search,
      page = 1,
      limit = 100,
      sort = 'newest',
    } = req.query

    const filter = {}

    // Type filter: contact, career, consultation
    if (type && type.toLowerCase() !== 'all') {
      filter.type = type.toLowerCase()
    }

    // Position filter (for careers)
    if (position && position.toLowerCase() !== 'all positions' && position.toLowerCase() !== 'all') {
      filter.position = new RegExp(position.trim(), 'i')
    }

    // Status filter: New, In Progress, Resolved, Archived, Shortlisted
    if (status && status.toLowerCase() !== 'all status' && status.toLowerCase() !== 'all') {
      filter.status = new RegExp(`^${status.trim()}$`, 'i')
    }

    // Discipline / Service filter
    if (discipline && discipline.toLowerCase() !== 'all services' && discipline.toLowerCase() !== 'all') {
      filter.discipline = new RegExp(discipline.trim(), 'i')
    }

    // Search keyword
    if (search && search.trim() !== '') {
      const q = search.trim()
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { organization: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } },
        { refId: { $regex: q, $options: 'i' } },
      ]
    }

    const sortOptions = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.max(1, parseInt(limit, 10))
    const skip = (pageNum - 1) * limitNum

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Inquiry.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Inquiries retrieved successfully.',
      count: inquiries.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: inquiries,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Inquiry & Application Statistics
 * @route   GET /api/inquiries/stats
 * @access  Public / Admin
 */
export const getInquiryStats = async (req, res, next) => {
  try {
    const [
      total,
      newCount,
      inProgressCount,
      resolvedCount,
      archivedCount,
      contactCount,
      careerCount,
      careerNewCount,
      careerInProgressCount,
      careerResolvedCount,
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'New' }),
      Inquiry.countDocuments({ status: 'In Progress' }),
      Inquiry.countDocuments({ status: 'Resolved' }),
      Inquiry.countDocuments({ status: 'Archived' }),
      Inquiry.countDocuments({ type: { $in: ['contact', 'consultation'] } }),
      Inquiry.countDocuments({ type: 'career' }),
      Inquiry.countDocuments({ type: 'career', status: 'New' }),
      Inquiry.countDocuments({ type: 'career', status: 'In Progress' }),
      Inquiry.countDocuments({ type: 'career', status: 'Resolved' }),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Inquiry statistics retrieved successfully.',
      data: {
        total,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        archived: archivedCount,
        contactCount,
        careerCount,
        careerStats: {
          total: careerCount,
          new: careerNewCount,
          inProgress: careerInProgressCount,
          resolved: careerResolvedCount,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Single Inquiry by ID or RefID
 * @route   GET /api/inquiries/:id
 * @access  Public / Admin
 */
export const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params

    let inquiry = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      inquiry = await Inquiry.findById(id)
    }

    if (!inquiry) {
      inquiry = await Inquiry.findOne({ refId: id })
    }

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Inquiry not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Inquiry details retrieved successfully.',
      data: inquiry,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create / Submit a New Inquiry or Career Application
 * @route   POST /api/inquiries
 * @access  Public
 */
export const createInquiry = async (req, res, next) => {
  try {
    const {
      type = 'contact',
      fullName,
      email,
      phone,
      organization,
      discipline,
      location,
      stage,
      subject,
      message,
      source,
      position,
      experience,
      currentRole,
      noticePeriod,
      portfolioUrl,
      cv,
    } = req.body

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Full name and email are required.',
      })
    }

    // Auto generate sequential refId
    const prefix = type === 'career' ? 'DEC-CAR' : 'DEC-INQ'
    const totalCount = await Inquiry.countDocuments({ type })
    const refId = `${prefix}-${String(totalCount + 101).padStart(5, '0')}`

    // Ensure CV is written to physical file in uploads/resumes if provided as base64
    let processedCv = cv || null
    if (processedCv && processedCv.base64) {
      processedCv = saveBase64ResumeToFile(processedCv, fullName)
    }

    const newInquiry = await Inquiry.create({
      refId,
      type,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      organization: organization ? organization.trim() : '',
      discipline: discipline ? discipline.trim() : (type === 'career' ? 'Career Application' : 'Project Consultation'),
      location: location || 'Qatar',
      stage: stage || 'Concept & Permitting',
      subject: subject ? subject.trim() : (position ? `Job Application: ${position}` : 'Website Inquiry'),
      message: message ? message.trim() : '',
      source: source || (type === 'career' ? 'Website Career Page' : 'Website Contact Page'),
      position: position || '',
      experience: experience || '',
      currentRole: currentRole || '',
      noticePeriod: noticePeriod || '',
      portfolioUrl: portfolioUrl || '',
      cv: processedCv,
      status: 'New',
    })

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: type === 'career'
        ? 'Your career application has been received successfully.'
        : 'Thank you! Your project inquiry has been received by DEC Engineering.',
      data: newInquiry,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Inquiry Status / Assignment
 * @route   PATCH /api/inquiries/:id/status
 * @access  Admin
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, assignedTo, followUpDate, note } = req.body

    let inquiry = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      inquiry = await Inquiry.findById(id)
    }
    if (!inquiry) {
      inquiry = await Inquiry.findOne({ refId: id })
    }

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Inquiry not found.',
      })
    }

    if (status) {
      inquiry.status = status
    }
    if (assignedTo !== undefined) {
      inquiry.assignedTo = assignedTo
    }
    if (followUpDate !== undefined) {
      inquiry.followUpDate = followUpDate ? new Date(followUpDate) : null
    }
    if (note && note.trim()) {
      inquiry.adminNotes.push({
        note: note.trim(),
        author: 'Admin',
        createdAt: new Date(),
      })
    }

    await inquiry.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Status updated to "${inquiry.status}".`,
      data: inquiry,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete Inquiry
 * @route   DELETE /api/inquiries/:id
 * @access  Admin
 */
export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params

    let inquiry = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      inquiry = await Inquiry.findByIdAndDelete(id)
    }
    if (!inquiry) {
      inquiry = await Inquiry.findOneAndDelete({ refId: id })
    }

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Inquiry not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Inquiry deleted successfully.',
      data: { id: inquiry._id, refId: inquiry.refId },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Seed Initial Inquiries
 * @route   POST /api/inquiries/seed
 * @access  Admin / Dev
 */
export const seedInquiries = async (req, res, next) => {
  try {
    const existingCount = await Inquiry.countDocuments()
    if (existingCount > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Database already has ${existingCount} records. Use ?force=true to reseed.`,
        count: existingCount,
      })
    }

    if (req.query.force) {
      await Inquiry.deleteMany({})
    }

    const inserted = await Inquiry.insertMany(SEED_INQUIRIES)

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully seeded ${inserted.length} records.`,
      count: inserted.length,
      data: inserted,
    })
  } catch (error) {
    next(error)
  }
}

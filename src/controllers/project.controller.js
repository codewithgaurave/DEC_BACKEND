import mongoose from 'mongoose'
import Project from '../models/Project.model.js'

/**
 * Helper to compute URL safe slug
 */
const getSectorSlug = (sector) => {
  const map = {
    offices: 'offices',
    retail: 'retail',
    'f&b': 'fnb',
    hospitality: 'hospitality',
    residential: 'residential',
    industrial: 'industrial',
    medical: 'medical',
    'medical & healthcare': 'medical',
  }
  const key = (sector || '').toLowerCase().trim()
  return map[key] || key.replace(/&/g, 'and').replace(/[\s\W-]+/g, '-')
}

/**
 * @desc    Get All Projects (Search, Sector Filter, Status Filter, Pagination)
 * @route   GET /api/projects
 * @access  Public
 */
export const getAllProjects = async (req, res, next) => {
  try {
    const {
      status,
      sector,
      category,
      search,
      page = 1,
      limit = 100,
      sort = 'code',
    } = req.query

    const filter = {}

    // 1. Status Filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase()
    } else if (!status) {
      // Default: if public request, return active only
      filter.status = 'active'
    }

    // 2. Sector Filter (handle sector name or sectorSlug)
    const targetSector = sector || category
    if (targetSector && targetSector !== 'All' && targetSector !== 'all') {
      const slugVal = targetSector.toLowerCase().trim()
      filter.$or = [
        { sectorSlug: slugVal },
        { sector: new RegExp(`^${targetSector.trim()}$`, 'i') },
      ]
    }

    // 3. Search Filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      const searchConditions = [
        { name: searchRegex },
        { code: searchRegex },
        { location: searchRegex },
        { scope: searchRegex },
        { type: searchRegex },
        { tags: { $in: [searchRegex] } },
      ]

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }]
        delete filter.$or
      } else {
        filter.$or = searchConditions
      }
    }

    // 4. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100))
    const skip = (pageNum - 1) * limitNum

    // 5. Sorting
    let sortOptions = { order: 1, createdAt: -1 }
    if (sort === 'name') sortOptions = { name: 1 }
    if (sort === 'latest') sortOptions = { createdAt: -1 }
    if (sort === 'code') sortOptions = { code: 1 }

    // 6. Fast execution with count + find
    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Projects retrieved successfully.',
      count: projects.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: projects,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Project by ID or Code
 * @route   GET /api/projects/:idOrCode
 * @access  Public
 */
export const getProjectByIdOrCode = async (req, res, next) => {
  try {
    const { idOrCode } = req.params

    let query
    if (mongoose.Types.ObjectId.isValid(idOrCode)) {
      query = { _id: idOrCode }
    } else {
      query = { code: idOrCode.toUpperCase().trim() }
    }

    const project = await Project.findOne(query).lean()

    if (!project) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Project not found with identifier '${idOrCode}'.`,
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Project retrieved successfully.',
      data: project,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a New Project
 * @route   POST /api/projects
 * @access  Private (Admin)
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      code,
      name,
      sector,
      type,
      location,
      scope,
      image,
      keywords,
      tags,
      client,
      year,
      description,
      status,
      order,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Project name is required.',
      })
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Project location is required.',
      })
    }

    if (!scope || !scope.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Project scope is required.',
      })
    }

    // Auto-generate code if missing
    let finalCode = (code || '').trim().toUpperCase()
    if (!finalCode) {
      const count = await Project.countDocuments()
      finalCode = `DEC-${String(count + 1).padStart(3, '0')}`
    }

    // Check code uniqueness
    const existingCode = await Project.findOne({ code: finalCode })
    if (existingCode) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: `Project with code '${finalCode}' already exists. Please choose a different code.`,
      })
    }

    const selectedSector = sector || 'Offices'
    const sectorSlug = getSectorSlug(selectedSector)

    const newProject = await Project.create({
      code: finalCode,
      name: name.trim(),
      sector: selectedSector,
      sectorSlug,
      type: (type || '').trim(),
      location: location.trim(),
      scope: scope.trim(),
      image: (image || '').trim(),
      keywords: (keywords || '').trim(),
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      client: (client || '').trim(),
      year: (year || '2025').trim(),
      description: (description || '').trim(),
      status: (status || 'active').toLowerCase(),
      order: Number(order) || 1,
    })

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Project created successfully.',
      data: newProject,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Existing Project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin)
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid project ID format '${id}'.`,
      })
    }

    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Project not found.',
      })
    }

    const {
      code,
      name,
      sector,
      type,
      location,
      scope,
      image,
      keywords,
      tags,
      client,
      year,
      description,
      status,
      order,
    } = req.body

    // Check code uniqueness if changing
    if (code && code.trim().toUpperCase() !== project.code) {
      const duplicate = await Project.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      })
      if (duplicate) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: `Project code '${code}' is already assigned to another project.`,
        })
      }
      project.code = code.trim().toUpperCase()
    }

    if (name !== undefined) project.name = name.trim()
    if (sector !== undefined) {
      project.sector = sector
      project.sectorSlug = getSectorSlug(sector)
    }
    if (type !== undefined) project.type = type.trim()
    if (location !== undefined) project.location = location.trim()
    if (scope !== undefined) project.scope = scope.trim()
    if (image !== undefined) project.image = image.trim()
    if (keywords !== undefined) project.keywords = keywords.trim()
    if (tags !== undefined) {
      project.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []
    }
    if (client !== undefined) project.client = client.trim()
    if (year !== undefined) project.year = String(year).trim()
    if (description !== undefined) project.description = description.trim()
    if (status !== undefined) project.status = status.toLowerCase()
    if (order !== undefined) project.order = Number(order) || 1

    await project.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Project updated successfully.',
      data: project,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete Project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid project ID format '${id}'.`,
      })
    }

    const deleted = await Project.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Project not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Project '${deleted.name}' (${deleted.code}) deleted successfully.`,
      data: deleted,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle Project Active / Inactive Status
 * @route   PATCH /api/projects/:id/status
 * @access  Private (Admin)
 */
export const toggleProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid project ID format.',
      })
    }

    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Project not found.',
      })
    }

    project.status = project.status === 'active' ? 'inactive' : 'active'
    await project.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Project status changed to ${project.status}.`,
      data: {
        _id: project._id,
        code: project.code,
        name: project.name,
        status: project.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Project Portfolio Statistics
 * @route   GET /api/projects/stats
 * @access  Public
 */
export const getProjectStats = async (req, res, next) => {
  try {
    const [total, active, inactive, sectorStats] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'inactive' }),
      Project.aggregate([
        {
          $group: {
            _id: '$sector',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Project portfolio stats retrieved.',
      data: {
        total,
        active,
        inactive,
        sectors: sectorStats.map((s) => ({ sector: s._id, count: s.count })),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Seed Initial 84 Landmark Projects from Website Data
 * @route   POST /api/projects/seed
 * @access  Private (Admin)
 */
export const seedProjects = async (req, res, next) => {
  try {
    const count = await Project.countDocuments()
    const { force = false } = req.body

    if (count > 0 && !force) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Database already contains ${count} projects. Pass { force: true } if you want to re-seed.`,
      })
    }

    if (force) {
      await Project.deleteMany({})
    }

    // Dynamic import seed data
    const { SEED_PROJECTS_DATA } = await import('../data/seedProjects.js')
    const cleaned = SEED_PROJECTS_DATA.map((p, idx) => ({
      code: p.code || `DEC-${String(idx + 1).padStart(3, '0')}`,
      name: p.name,
      sector: p.sector || 'Offices',
      sectorSlug: p.sectorSlug || 'offices',
      type: p.type || '',
      location: p.location || 'Doha, Qatar',
      scope: p.scope || 'Engineering Design & Supervision',
      image: p.image
        ? p.image.replace(/^\/Projects Images\/Projects Images\//, '/uploads/projects/')
        : '',
      keywords: p.keywords || '',
      tags: p.tags || [],
      order: idx + 1,
      status: 'active',
      year: '2025',
    }))
    const inserted = await Project.insertMany(cleaned)

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully seeded ${inserted.length} landmark projects.`,
      count: inserted.length,
      data: inserted,
    })
  } catch (error) {
    next(error)
  }
}

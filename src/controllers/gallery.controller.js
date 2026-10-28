import mongoose from 'mongoose'
import Gallery from '../models/Gallery.model.js'

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
    general: 'general',
  }
  const key = (sector || '').toLowerCase().trim()
  return map[key] || key.replace(/&/g, 'and').replace(/[\s\W-]+/g, '-')
}

/**
 * @desc    Get All Gallery Visual Archive Items
 * @route   GET /api/gallery
 * @access  Public
 */
export const getAllGalleryItems = async (req, res, next) => {
  try {
    const {
      status,
      sector,
      category,
      search,
      page = 1,
      limit = 100,
      sort = 'order',
    } = req.query

    const filter = {}

    // Status filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase()
    } else if (!status) {
      filter.status = 'active'
    }

    // Sector / Category filter
    const targetSector = sector || category
    if (targetSector && targetSector !== 'All' && targetSector !== 'all') {
      const slugVal = targetSector.toLowerCase().trim()
      filter.$or = [
        { sectorSlug: slugVal },
        { sector: new RegExp(`^${targetSector.trim()}$`, 'i') },
      ]
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      const searchConditions = [
        { title: searchRegex },
        { location: searchRegex },
        { scope: searchRegex },
        { sector: searchRegex },
        { fileName: searchRegex },
      ]

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }]
        delete filter.$or
      } else {
        filter.$or = searchConditions
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100))
    const skip = (pageNum - 1) * limitNum

    let sortOptions = { order: 1, createdAt: -1 }
    if (sort === 'title') sortOptions = { title: 1 }
    if (sort === 'latest') sortOptions = { createdAt: -1 }

    const [total, items] = await Promise.all([
      Gallery.countDocuments(filter),
      Gallery.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Visual archives gallery retrieved successfully.',
      count: items.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: items,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Gallery Item by ID
 * @route   GET /api/gallery/:id
 * @access  Public
 */
export const getGalleryItemById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid gallery item ID format.',
      })
    }

    const item = await Gallery.findById(id).lean()
    if (!item) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Gallery photograph not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Gallery photograph retrieved successfully.',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a New Gallery Photo Item
 * @route   POST /api/gallery
 * @access  Private (Admin)
 */
export const createGalleryItem = async (req, res, next) => {
  try {
    const {
      title,
      image,
      sector,
      location,
      scope,
      dimensions,
      fileSize,
      status,
      order,
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Gallery item title is required.',
      })
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Gallery image URL/path is required.',
      })
    }

    const selectedSector = sector || 'Offices'
    const sectorSlug = getSectorSlug(selectedSector)
    const count = await Gallery.countDocuments()

    const newItem = await Gallery.create({
      title: title.trim(),
      image: image.trim(),
      sector: selectedSector,
      sectorSlug,
      location: (location || 'Doha, Qatar').trim(),
      scope: (scope || '').trim(),
      dimensions: (dimensions || '3840 x 2160').trim(),
      fileSize: (fileSize || '2.5 MB').trim(),
      status: (status || 'active').toLowerCase(),
      order: Number(order) || count + 1,
    })

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Photograph added to visual archives gallery successfully.',
      data: newItem,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Existing Gallery Item
 * @route   PUT /api/gallery/:id
 * @access  Private (Admin)
 */
export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid gallery item ID format.',
      })
    }

    const item = await Gallery.findById(id)
    if (!item) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Gallery item not found.',
      })
    }

    const {
      title,
      image,
      sector,
      location,
      scope,
      dimensions,
      fileSize,
      status,
      order,
    } = req.body

    if (title !== undefined) item.title = title.trim()
    if (image !== undefined) item.image = image.trim()
    if (sector !== undefined) {
      item.sector = sector.trim()
      item.sectorSlug = getSectorSlug(sector)
    }
    if (location !== undefined) item.location = location.trim()
    if (scope !== undefined) item.scope = scope.trim()
    if (dimensions !== undefined) item.dimensions = dimensions.trim()
    if (fileSize !== undefined) item.fileSize = fileSize.trim()
    if (status !== undefined) item.status = status.toLowerCase()
    if (order !== undefined) item.order = Number(order) || 1

    await item.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Gallery item updated successfully.',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete Gallery Item
 * @route   DELETE /api/gallery/:id
 * @access  Private (Admin)
 */
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid gallery item ID format.',
      })
    }

    const deleted = await Gallery.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Gallery photograph not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Photograph '${deleted.title}' deleted from visual archives.`,
      data: deleted,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle Gallery Active / Inactive Status
 * @route   PATCH /api/gallery/:id/status
 * @access  Private (Admin)
 */
export const toggleGalleryStatus = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid gallery item ID format.',
      })
    }

    const item = await Gallery.findById(id)
    if (!item) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Gallery item not found.',
      })
    }

    item.status = item.status === 'active' ? 'inactive' : 'active'
    await item.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Gallery item status changed to ${item.status}.`,
      data: {
        _id: item._id,
        title: item.title,
        status: item.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Gallery Statistics
 * @route   GET /api/gallery/stats
 * @access  Public
 */
export const getGalleryStats = async (req, res, next) => {
  try {
    const [total, active, inactive, sectorStats] = await Promise.all([
      Gallery.countDocuments(),
      Gallery.countDocuments({ status: 'active' }),
      Gallery.countDocuments({ status: 'inactive' }),
      Gallery.aggregate([
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
      message: 'Gallery archives stats retrieved.',
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
 * @desc    Seed Initial 84 Visual Archive Photographs
 * @route   POST /api/gallery/seed
 * @access  Private (Admin)
 */
export const seedGallery = async (req, res, next) => {
  try {
    const count = await Gallery.countDocuments()
    const { force = false } = req.body

    if (count > 0 && !force) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Gallery already contains ${count} items. Pass { force: true } to re-seed.`,
      })
    }

    if (force) {
      await Gallery.deleteMany({})
    }

    const { SEED_GALLERY_DATA } = await import('../data/seedGallery.js')
    const inserted = await Gallery.insertMany(SEED_GALLERY_DATA)

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully seeded ${inserted.length} visual archive photographs.`,
      count: inserted.length,
      data: inserted,
    })
  } catch (error) {
    next(error)
  }
}

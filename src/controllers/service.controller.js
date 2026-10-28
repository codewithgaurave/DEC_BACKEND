import mongoose from 'mongoose'
import Service from '../models/Service.model.js'

/**
 * Utility to generate a URL-safe, clean slug from a string
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * @desc    Get All Services (Public + Admin with Filtering & Search)
 * @route   GET /api/services
 * @access  Public
 */
export const getAllServices = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      featured,
      page = 1,
      limit = 50,
      sort = 'order',
    } = req.query

    const filter = {}

    // 1. Status Filter: if not provided or 'active', filter active. If 'all', return all
    if (status && status !== 'all') {
      filter.status = status
    } else if (!status) {
      // By default for public requests, return active services only unless admin asks for all
      filter.status = 'active'
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i')
    }

    // 3. Featured Filter
    if (featured !== undefined) {
      filter.isFeatured = featured === 'true'
    }

    // 4. Search Filter (High-speed regex on title, description, and capabilities)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { capabilities: { $in: [searchRegex] } },
      ]
    }

    // 5. Pagination Options
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
    const skip = (pageNum - 1) * limitNum

    // 6. Sorting Setup
    let sortOptions = { order: 1, createdAt: -1 }
    if (sort === 'title') sortOptions = { title: 1 }
    if (sort === 'latest') sortOptions = { createdAt: -1 }
    if (sort === 'oldest') sortOptions = { createdAt: 1 }

    // 7. Parallel Execution for Ultra-Fast Response Time
    const [total, services] = await Promise.all([
      Service.countDocuments(filter),
      Service.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Bypasses Mongoose hydration for 4x faster execution
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Services retrieved successfully.',
      count: services.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: services,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Single Service by ID or Slug
 * @route   GET /api/services/:idOrSlug
 * @access  Public
 */
export const getServiceByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params

    let query
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query = { _id: idOrSlug }
    } else {
      query = { slug: idOrSlug.toLowerCase().trim() }
    }

    const service = await Service.findOne(query).lean()

    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Service not found with identifier: '${idOrSlug}'`,
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Service details retrieved successfully.',
      data: service,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create New Service
 * @route   POST /api/services
 * @access  Private (Admin / SuperAdmin)
 */
export const createService = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      fullDescription,
      category = 'Engineering',
      icon = 'FiLayers',
      image = '/projects-gallery/01.jpg',
      capabilities = [],
      keyFeatures = [],
      order = 0,
      status = 'active',
      isFeatured = false,
      ctaText = 'Consult Engineers',
      ctaLink = '/contact',
      seo = {},
    } = req.body

    // 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Service title is required.',
      })
    }

    const effectiveDescription = description?.trim() || shortDescription?.trim()
    if (!effectiveDescription) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Service description is required.',
      })
    }

    // 2. Generate or sanitize slug
    let finalSlug = slug ? generateSlug(slug) : generateSlug(title)
    if (!finalSlug) finalSlug = `service-${Date.now()}`

    // Check slug uniqueness
    const existingSlug = await Service.findOne({ slug: finalSlug }).lean()
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`
    }

    // Merge capabilities & keyFeatures (supporting both conventions seamlessly)
    const effectiveCapabilities = Array.isArray(capabilities) && capabilities.length > 0
      ? capabilities.map((c) => c.toString().trim()).filter(Boolean)
      : Array.isArray(keyFeatures)
      ? keyFeatures.map((f) => f.toString().trim()).filter(Boolean)
      : []

    // 3. Create document
    const service = await Service.create({
      title: title.trim(),
      slug: finalSlug,
      shortDescription: shortDescription ? shortDescription.trim() : effectiveDescription,
      description: effectiveDescription,
      fullDescription: fullDescription ? fullDescription.trim() : '',
      category: category.trim(),
      icon: icon.trim(),
      image: image.trim(),
      capabilities: effectiveCapabilities,
      order: Number(order) || 0,
      status: ['active', 'inactive'].includes(status) ? status : 'active',
      isFeatured: Boolean(isFeatured),
      ctaText: ctaText.trim(),
      ctaLink: ctaLink.trim(),
      seo: {
        metaTitle: seo.metaTitle || title.trim(),
        metaDescription: seo.metaDescription || effectiveDescription.slice(0, 160),
        metaKeywords: Array.isArray(seo.metaKeywords) ? seo.metaKeywords : [],
      },
    })

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Service created successfully.',
      data: service,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Existing Service Details
 * @route   PUT /api/services/:id
 * @access  Private (Admin / SuperAdmin)
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid service ID format.',
      })
    }

    const {
      title,
      slug,
      shortDescription,
      description,
      fullDescription,
      category,
      icon,
      image,
      capabilities,
      keyFeatures,
      order,
      status,
      isFeatured,
      ctaText,
      ctaLink,
      seo,
    } = req.body

    const updates = {}

    if (title !== undefined) updates.title = title.trim()
    if (shortDescription !== undefined) updates.shortDescription = shortDescription.trim()
    if (description !== undefined) updates.description = description.trim()
    if (fullDescription !== undefined) updates.fullDescription = fullDescription.trim()
    if (category !== undefined) updates.category = category.trim()
    if (icon !== undefined) updates.icon = icon.trim()
    if (image !== undefined) updates.image = image.trim()
    if (order !== undefined) updates.order = Number(order) || 0
    if (status !== undefined && ['active', 'inactive'].includes(status)) updates.status = status
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured)
    if (ctaText !== undefined) updates.ctaText = ctaText.trim()
    if (ctaLink !== undefined) updates.ctaLink = ctaLink.trim()
    if (seo !== undefined) updates.seo = seo

    // Merge capabilities or keyFeatures
    if (capabilities !== undefined || keyFeatures !== undefined) {
      const caps = capabilities || keyFeatures || []
      updates.capabilities = Array.isArray(caps)
        ? caps.map((c) => c.toString().trim()).filter(Boolean)
        : []
    }

    // If updating slug, check uniqueness
    if (slug) {
      const cleanSlug = generateSlug(slug)
      const existingSlug = await Service.findOne({
        slug: cleanSlug,
        _id: { $ne: id },
      }).lean()

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: `The slug '${cleanSlug}' is already in use by another service.`,
        })
      }
      updates.slug = cleanSlug
    }

    const updatedService = await Service.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Service not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Service updated successfully.',
      data: updatedService,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle Service Active / Inactive Status
 * @route   PATCH /api/services/:id/status
 * @access  Private (Admin / SuperAdmin)
 */
export const toggleServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid service ID format.',
      })
    }

    const service = await Service.findById(id)
    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Service not found.',
      })
    }

    // If explicit status provided, use it; otherwise toggle
    if (status && ['active', 'inactive'].includes(status)) {
      service.status = status
    } else {
      service.status = service.status === 'active' ? 'inactive' : 'active'
    }

    await service.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Service status updated to '${service.status}'.`,
      data: {
        id: service._id,
        slug: service.slug,
        title: service.title,
        status: service.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete Service
 * @route   DELETE /api/services/:id
 * @access  Private (Admin / SuperAdmin)
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid service ID format.',
      })
    }

    const deleted = await Service.findByIdAndDelete(id).lean()
    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Service not found or already deleted.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Service '${deleted.title}' was deleted successfully.`,
      data: { id: deleted._id, slug: deleted.slug, title: deleted.title },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Exact 6 Core Engineering Disciplines as Displayed on DEC_WEBSITE Expertise Page
 */
export const SEED_SERVICES_DATA = [
  {
    slug: 'architecture',
    title: 'Architectural & Space Planning',
    shortDescription: 'Comprehensive architectural concepts, functional space planning, luxury interior fit-outs, and construction documentation complying with QCS and international codes.',
    description: 'Comprehensive architectural concepts, schematic designs, functional space planning, luxury interior fit-outs, and construction documentation complying with QCS and international codes.',
    category: 'Architecture',
    icon: 'FaCompassDrafting',
    image: '/uploads/services/architecture.jpg',
    capabilities: [
      'Concept & Detailed Architectural Design',
      'Luxury Corporate & Retail Space Planning',
      'Life Safety & NFPA Egress Strategies',
      'Exterior Facade & Envelope Engineering',
    ],
    order: 1,
    status: 'active',
    isFeatured: true,
  },
  {
    slug: 'structural',
    title: 'Civil & Structural Engineering',
    shortDescription: 'Rigorous structural analysis and design for reinforced concrete (RC), post-tensioned slabs, structural steel, and deep foundations optimized for GCC geotechnical conditions.',
    description: 'Rigorous structural analysis and design for reinforced concrete (RC), post-tensioned slabs, structural steel, PEB systems, and foundation engineering optimized for GCC geotechnical conditions.',
    category: 'Structural',
    icon: 'FiLayers',
    image: '/uploads/services/structural.jpeg',
    capabilities: [
      'Seismic, Wind & Dynamic Structural Analysis',
      'High-Rise, Commercial & Industrial Structures',
      'Foundation Design & Soil-Structure Interaction',
      'Structural Peer Review & Value Engineering',
    ],
    order: 2,
    status: 'active',
    isFeatured: true,
  },
  {
    slug: 'mechanical',
    title: 'Mechanical & HVAC Engineering',
    shortDescription: 'High-performance HVAC systems, chilled water plant integrations, smoke management, and drainage engineering engineered for extreme Gulf climates.',
    description: 'High-performance heating, ventilation, and air conditioning (HVAC) systems, chilled water plant integrations, smoke management, and building drainage engineering designed for extreme gulf climates.',
    category: 'MEP',
    icon: 'FiTool',
    image: '/uploads/services/mechanical.jpg',
    capabilities: [
      'Central Chilled Water & VRF Air Conditioning',
      'HAP Thermal Load & Energy Modeling',
      'Plumbing, Public Health & Drainage Systems',
      'Smoke Evacuation & Pressurization Systems',
    ],
    order: 3,
    status: 'active',
    isFeatured: true,
  },
  {
    slug: 'electrical',
    title: 'Electrical & Low Voltage (ELV)',
    shortDescription: 'End-to-end power distribution design, substation layouts, architectural lighting, building management systems (BMS), and security/ICT infrastructure.',
    description: 'End-to-end power generation and distribution design, substation layouts, architectural lighting design, building management systems (BMS), and comprehensive ICT/ELV infrastructure.',
    category: 'MEP',
    icon: 'FiZap',
    image: '/uploads/services/electrical.jpeg',
    capabilities: [
      'Medium & Low Voltage Power Distribution',
      'Kahramaa Substation Approvals & Compliance',
      'Dialux Architectural & Exterior Lighting',
      'ELV, CCTV, Access Control & BMS Integration',
    ],
    order: 4,
    status: 'active',
    isFeatured: true,
  },
  {
    slug: 'regulatory',
    title: 'Statutory Permitting Approvals',
    shortDescription: 'Expedited statutory permits through our certified Grade A MMUP status covering QCDD Civil Defense, MME Municipalities, Kahramaa, and BCC handovers.',
    description: 'Expedited statutory permits through our certified Grade A MMUP / UPDA consulting status, covering Qatar Civil Defense (QCD), Municipalities (MME), Kahramaa, Ashghal, and Building Completion Certificates (BCC).',
    category: 'Regulatory',
    icon: 'FiShield',
    image: '/uploads/services/regulatory.jpg',
    capabilities: [
      'Grade A MMUP / UPDA Licensed Endorsement',
      'Qatar Civil Defense (QCD) Fire Life Safety Permits',
      'Ministry of Municipality (MME) Building Permits',
      'Building Completion Certificates (BCC) Clearance',
    ],
    order: 5,
    status: 'active',
    isFeatured: true,
  },
  {
    slug: 'bim',
    title: 'BIM & Digital Twin Delivery',
    shortDescription: 'End-to-end digital engineering utilizing Autodesk Revit and Navisworks for 3D multidisciplinary coordination, eliminating on-site clashes.',
    description: 'End-to-end digital engineering utilizing Autodesk Revit and Navisworks for 3D multidisciplinary coordination, automated clash detection matrix, and seamless digital handovers.',
    category: 'Digital Engineering',
    icon: 'FiCpu',
    image: '/uploads/services/bim.png',
    capabilities: [
      'LOD 200 to LOD 500 Model Development',
      'Clash Detection & Inter-Disciplinary Coordination',
      'Automated Quantity Take-off (QTO)',
      'As-Built Asset Modeling for Facility Operations',
    ],
    order: 6,
    status: 'active',
    isFeatured: true,
  },
]

/**
 * @desc    Seed Initial Services from DEC Expertise Page
 * @route   POST /api/services/seed
 * @access  Private (Admin / SuperAdmin)
 */
export const seedServices = async (req, res, next) => {
  try {
    const { force = false } = req.query

    if (force === 'true' || force === true) {
      await Service.deleteMany({})
    } else {
      const count = await Service.countDocuments()
      if (count > 0) {
        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: `Database already contains ${count} services. Use ?force=true to overwrite.`,
        })
      }
    }

    const inserted = await Service.insertMany(SEED_SERVICES_DATA)

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully seeded ${inserted.length} core engineering disciplines.`,
      data: inserted,
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllServices,
  getServiceByIdOrSlug,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  seedServices,
}

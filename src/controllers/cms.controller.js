import Cms from '../models/Cms.model.js'

const sanitizeCmsImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return ''
  let cleaned = rawUrl.trim()
  const httpIdx = cleaned.lastIndexOf('http://')
  const httpsIdx = cleaned.lastIndexOf('https://')
  const lastProtocolIdx = Math.max(httpIdx, httpsIdx)
  if (lastProtocolIdx > 0) {
    cleaned = cleaned.substring(lastProtocolIdx)
  }
  cleaned = cleaned.replace(/^https?:\/\/[^/]+(?=\/uploads\/|\/images\/)/i, '')
  return cleaned
}

const DEFAULT_HOME_DELIVERY = {
  image: '/uploads/cms/dec_integrated_engineering.jpg',
  altText: 'DEC Integrated Multi-Discipline Engineering and 3D BIM Delivery',
  badge: 'Coordinated Engineering Leadership',
  description:
    'Delivering end-to-end design, authority approvals and site supervision across Qatar, Egypt, and Saudi Arabia.',
}

const DEFAULT_WHY_DEC_BIM = {
  image: '/uploads/cms/why_dec_bim_edge.jpg',
  altText: 'DEC 3D BIM Level 2 Coordination and Clash Detection',
  badge: 'Federated 3D Coordination',
  statusTag: 'BIM LEVEL 2 ACTIVE',
  description:
    'Synchronized Revit & Navisworks models across Architecture, Structure, HVAC & Electrical ELV.',
}

/**
 * @desc    Get Home Page CMS Content
 * @route   GET /api/cms/home
 * @access  Public
 */
export const getHomePageCms = async (req, res, next) => {
  try {
    let cms = await Cms.findOne({ page: 'home' })

    if (!cms) {
      cms = await Cms.create({
        page: 'home',
        integratedDelivery: DEFAULT_HOME_DELIVERY,
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Home CMS content retrieved successfully.',
      data: cms,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Home Page CMS Content
 * @route   PUT /api/cms/home
 * @access  Private / Authenticated Admin
 */
export const updateHomePageCms = async (req, res, next) => {
  try {
    const { integratedDelivery, sections } = req.body

    const updateFields = {}

    if (integratedDelivery) {
      if (integratedDelivery.image !== undefined) {
        updateFields['integratedDelivery.image'] = sanitizeCmsImageUrl(integratedDelivery.image)
      }
      if (integratedDelivery.altText !== undefined) {
        updateFields['integratedDelivery.altText'] = integratedDelivery.altText.trim()
      }
      if (integratedDelivery.badge !== undefined) {
        updateFields['integratedDelivery.badge'] = integratedDelivery.badge.trim()
      }
      if (integratedDelivery.description !== undefined) {
        updateFields['integratedDelivery.description'] = integratedDelivery.description.trim()
      }
    }

    if (sections !== undefined) {
      updateFields.sections = sections
    }

    const updated = await Cms.findOneAndUpdate(
      { page: 'home' },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Home CMS content updated successfully.',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reset Home Page Delivery Image / Section to Default Dummy
 * @route   POST /api/cms/home/reset
 * @access  Private / Authenticated Admin
 */
export const resetHomePageCms = async (req, res, next) => {
  try {
    const updated = await Cms.findOneAndUpdate(
      { page: 'home' },
      {
        $set: {
          integratedDelivery: DEFAULT_HOME_DELIVERY,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Home CMS content reset to default dummy assets successfully.',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get All CMS Pages
 * @route   GET /api/cms
 * @access  Public
 */
export const getAllCms = async (req, res, next) => {
  try {
    const all = await Cms.find().lean()
    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: all,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Why DEC Page CMS Content
 * @route   GET /api/cms/why-dec
 * @access  Public
 */
export const getWhyDecPageCms = async (req, res, next) => {
  try {
    let cms = await Cms.findOne({ page: 'why-dec' })

    if (!cms) {
      cms = await Cms.create({
        page: 'why-dec',
        bimCoordination: DEFAULT_WHY_DEC_BIM,
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Why DEC CMS content retrieved successfully.',
      data: cms,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Why DEC Page CMS Content
 * @route   PUT /api/cms/why-dec
 * @access  Private / Authenticated Admin
 */
export const updateWhyDecPageCms = async (req, res, next) => {
  try {
    const { bimCoordination, sections } = req.body

    const updateFields = {}

    if (bimCoordination) {
      if (bimCoordination.image !== undefined) {
        updateFields['bimCoordination.image'] = sanitizeCmsImageUrl(bimCoordination.image)
      }
      if (bimCoordination.altText !== undefined) {
        updateFields['bimCoordination.altText'] = bimCoordination.altText.trim()
      }
      if (bimCoordination.badge !== undefined) {
        updateFields['bimCoordination.badge'] = bimCoordination.badge.trim()
      }
      if (bimCoordination.statusTag !== undefined) {
        updateFields['bimCoordination.statusTag'] = bimCoordination.statusTag.trim()
      }
      if (bimCoordination.description !== undefined) {
        updateFields['bimCoordination.description'] = bimCoordination.description.trim()
      }
    }

    if (sections !== undefined) {
      updateFields.sections = sections
    }

    const updated = await Cms.findOneAndUpdate(
      { page: 'why-dec' },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Why DEC CMS content updated successfully.',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reset Why DEC Page Content to Default Dummy
 * @route   POST /api/cms/why-dec/reset
 * @access  Private / Authenticated Admin
 */
export const resetWhyDecPageCms = async (req, res, next) => {
  try {
    const updated = await Cms.findOneAndUpdate(
      { page: 'why-dec' },
      {
        $set: {
          bimCoordination: DEFAULT_WHY_DEC_BIM,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Why DEC CMS content reset to default dummy assets successfully.',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

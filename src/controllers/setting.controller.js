import Setting from '../models/Setting.model.js'

/**
 * @desc    Get Agency Profile & Portal Settings
 * @route   GET /api/settings
 * @access  Public / Private
 */
export const getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne({ key: 'agency_profile' }).lean()

    if (!setting) {
      setting = await Setting.create({ key: 'agency_profile' })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Agency settings retrieved successfully.',
      data: setting,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Agency Profile & Portal Settings
 * @route   PUT /api/settings
 * @access  Private (Authenticated Admin)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const {
      agencyName,
      agencySlogan,
      contactEmail,
      contactPhone,
      headquarters,
      commercialReg,
      taxNumber,
      currency,
    } = req.body

    const updates = {}
    if (agencyName !== undefined) updates.agencyName = agencyName.trim()
    if (agencySlogan !== undefined) updates.agencySlogan = agencySlogan.trim()
    if (contactEmail !== undefined) updates.contactEmail = contactEmail.trim()
    if (contactPhone !== undefined) updates.contactPhone = contactPhone.trim()
    if (headquarters !== undefined) updates.headquarters = headquarters.trim()
    if (commercialReg !== undefined) updates.commercialReg = commercialReg.trim()
    if (taxNumber !== undefined) updates.taxNumber = taxNumber.trim()
    if (currency !== undefined) updates.currency = currency.trim()

    const setting = await Setting.findOneAndUpdate(
      { key: 'agency_profile' },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Agency profile settings updated successfully.',
      data: setting,
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getSettings,
  updateSettings,
}

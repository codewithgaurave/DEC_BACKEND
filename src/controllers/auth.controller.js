import User from '../models/User.model.js'
import generateToken from '../utils/generateToken.js'

/**
 * @desc    Register a new Admin account
 * @route   POST /api/auth/register
 * @access  Public / Initial Setup
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, title } = req.body

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Name, email, and password are required fields.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Password must be at least 6 characters long.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 2. High-speed check for existing user using exists()
    const emailExists = await User.exists({ email: normalizedEmail })
    if (emailExists) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'An admin account with this email address already exists.',
      })
    }

    // 3. Create new Admin
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role && ['admin', 'superadmin'].includes(role) ? role : 'admin',
      phone: phone ? phone.trim() : '',
      title: title ? title.trim() : 'DEC Administrator',
      lastLogin: new Date(),
    })

    // 4. Generate JWT Token
    const token = generateToken({
      id: user._id,
      role: user.role,
      email: user.email,
    })

    // 5. Respond with sanitized profile
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Admin account created successfully.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Authenticate Admin & Get JWT Token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. Validate presence of credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Please provide both email address and password.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 2. Find user including hidden password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email address or password.',
      })
    }

    // 3. Verify password match
    const isPasswordMatch = await user.matchPassword(password)
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email address or password.',
      })
    }

    // 4. Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'This account has been deactivated. Please contact Super Admin.',
      })
    }

    // 5. Update last login timestamp asynchronously
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    // 6. Generate JWT Token
    const token = generateToken({
      id: user._id,
      role: user.role,
      email: user.email,
    })

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Authentication successful. Welcome back to DEC Admin.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Authenticated Admin Profile
 * @route   GET /api/auth/profile, GET /api/auth/me
 * @access  Private (Authenticated)
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already attached and sanitized by authenticate middleware
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Admin profile retrieved successfully.',
      data: {
        user: req.user,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Authenticated Admin Profile Details
 * @route   PUT /api/auth/profile
 * @access  Private (Authenticated)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, title, avatar, email, twoFactorAuth } = req.body
    const userId = req.user._id

    const updates = {}

    if (name && name.trim()) updates.name = name.trim()
    if (phone !== undefined) updates.phone = phone.trim()
    if (title !== undefined) updates.title = title.trim()
    if (avatar !== undefined) updates.avatar = avatar
    if (twoFactorAuth !== undefined) updates.twoFactorAuth = Boolean(twoFactorAuth)

    // If changing email, check for uniqueness
    if (email && email.trim().toLowerCase() !== req.user.email) {
      const normalizedEmail = email.trim().toLowerCase()
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      }).lean()

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: 'The requested email address is already in use by another account.',
        })
      }
      updates.email = normalizedEmail
    }

    // Perform high-speed update returning sanitized document
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .lean()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Profile details updated successfully.',
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Change Admin Password Securely
 * @route   PUT /api/auth/change-password
 * @access  Private (Authenticated)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user._id

    // 1. Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Both current password and new password are required.',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'New password must be at least 6 characters long.',
      })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'New password cannot be the same as your current password.',
      })
    }

    // 2. Fetch user with password field
    const user = await User.findById(userId).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Admin user not found.',
      })
    }

    // 3. Verify current password
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Incorrect current password. Please enter your valid current password.',
      })
    }

    // 4. Set new password (triggers pre-save bcrypt hashing)
    user.password = newPassword
    await user.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password changed successfully. Your account is now secured with the new password.',
    })
  } catch (error) {
    next(error)
  }
}

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
}

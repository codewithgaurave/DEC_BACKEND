import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

/**
 * Authentication Middleware
 * Validates JWT token and attaches user to req.user
 */
export const authenticate = async (req, res, next) => {
  let token = null

  // 1. Extract Bearer token from Authorization header or custom header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token']
  }

  // 2. Reject if no token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Access denied. Authentication token is required.',
    })
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. Fetch user using .lean() for maximum read performance
    const user = await User.findById(decoded.id).select('-password').lean()

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid session. User account no longer exists.',
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Account is deactivated or suspended. Please contact administrator.',
      })
    }

    // Attach sanitized user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Session token has expired. Please log in again.',
      })
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid authorization token.',
    })
  }
}

/**
 * Role-Based Access Control Middleware
 * @param  {...String} roles - Allowed roles (e.g. 'superadmin', 'admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] permissions.`,
      })
    }
    next()
  }
}

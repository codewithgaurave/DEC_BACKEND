import jwt from 'jsonwebtoken'

/**
 * Generate a signed JWT token
 * @param {Object} payload - User identification payload
 * @returns {String} JWT token
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment variables!')
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '365d'

  return jwt.sign(payload, secret, {
    expiresIn,
  })
}

export default generateToken

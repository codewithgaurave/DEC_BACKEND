import rateLimit from 'express-rate-limit'

/**
 * Strict Rate Limiter for Authentication Endpoints (Brute-Force Protection)
 * Limits each IP to 10 login requests per 15-minute window
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP address. Please try again in 15 minutes.',
  },
})

/**
 * General API Rate Limiter
 * Protects server against DoS and abusive automated scraping
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after a few minutes.',
  },
})

export default {
  authLimiter,
  apiLimiter,
}

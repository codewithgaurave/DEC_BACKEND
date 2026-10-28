import { Router } from 'express'
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

/**
 * Public Authentication Routes with brute-force rate limiting protection
 */
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

/**
 * Protected Admin Routes (Requires valid JWT Bearer token)
 */
router.get('/profile', authenticate, getProfile)
router.get('/me', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.put('/change-password', authenticate, changePassword)

export default router

import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/setting.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Public read access
router.get('/', getSettings)

// Protected update (Requires login token)
router.put('/', authenticate, updateSettings)

export default router

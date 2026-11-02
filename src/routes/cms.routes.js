import { Router } from 'express'
import {
  getHomePageCms,
  updateHomePageCms,
  resetHomePageCms,
  getWhyDecPageCms,
  updateWhyDecPageCms,
  resetWhyDecPageCms,
  getAllCms,
} from '../controllers/cms.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Public read endpoints
router.get('/', getAllCms)
router.get('/home', getHomePageCms)
router.get('/why-dec', getWhyDecPageCms)

// Admin management endpoints for Home Page
router.put('/home', authenticate, updateHomePageCms)
router.post('/home', authenticate, updateHomePageCms)
router.post('/home/reset', authenticate, resetHomePageCms)

// Admin management endpoints for Why DEC Page
router.put('/why-dec', authenticate, updateWhyDecPageCms)
router.post('/why-dec', authenticate, updateWhyDecPageCms)
router.post('/why-dec/reset', authenticate, resetWhyDecPageCms)

export default router

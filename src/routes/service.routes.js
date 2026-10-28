import { Router } from 'express'
import {
  getAllServices,
  getServiceByIdOrSlug,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  seedServices,
} from '../controllers/service.controller.js'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

/**
 * Public Routes (High-Speed Read Endpoints for Website & Portal)
 */
router.get('/', getAllServices)
router.get('/:idOrSlug', getServiceByIdOrSlug)

/**
 * Protected Routes (Requires JWT Token & Admin / SuperAdmin Role)
 */
router.post('/', authenticate, authorizeRoles('admin', 'superadmin'), createService)
router.put('/:id', authenticate, authorizeRoles('admin', 'superadmin'), updateService)
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'superadmin'), toggleServiceStatus)
router.delete('/:id', authenticate, authorizeRoles('admin', 'superadmin'), deleteService)

/**
 * Database Seed Route (Pre-populate with the 6 core engineering disciplines)
 */
router.post('/seed', authenticate, authorizeRoles('admin', 'superadmin'), seedServices)

export default router

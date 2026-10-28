import { Router } from 'express'
import {
  getAllProjects,
  getProjectByIdOrCode,
  getProjectStats,
  createProject,
  updateProject,
  toggleProjectStatus,
  deleteProject,
  seedProjects,
} from '../controllers/project.controller.js'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

/**
 * Public Routes (High-Speed Read Endpoints for Website & Portal)
 */
router.get('/', getAllProjects)
router.get('/stats', getProjectStats)
router.get('/:idOrCode', getProjectByIdOrCode)

/**
 * Protected Routes (Requires JWT Token & Admin / SuperAdmin Role)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  createProject
)
router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  updateProject
)
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  toggleProjectStatus
)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  deleteProject
)

/**
 * Database Seed Route (Pre-populate with the 84 landmark projects)
 */
router.post(
  '/seed',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  seedProjects
)

export default router

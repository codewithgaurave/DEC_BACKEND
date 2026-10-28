import { Router } from 'express'
import {
  getAllGalleryItems,
  getGalleryItemById,
  getGalleryStats,
  createGalleryItem,
  updateGalleryItem,
  toggleGalleryStatus,
  deleteGalleryItem,
  seedGallery,
} from '../controllers/gallery.controller.js'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

/**
 * Public Routes
 */
router.get('/', getAllGalleryItems)
router.get('/stats', getGalleryStats)
router.get('/:id', getGalleryItemById)

/**
 * Protected Routes (Requires JWT Token & Admin / SuperAdmin Role)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  createGalleryItem
)
router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  updateGalleryItem
)
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  toggleGalleryStatus
)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  deleteGalleryItem
)

/**
 * Database Seed Route
 */
router.post(
  '/seed',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  seedGallery
)

export default router

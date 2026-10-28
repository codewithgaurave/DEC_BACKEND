import { Router } from 'express'
import {
  getAllBlogs,
  getBlogStats,
  getBlogBySlugOrId,
  createBlog,
  updateBlog,
  toggleBlogStatus,
  deleteBlog,
  seedBlogs,
} from '../controllers/blog.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Public Read Routes
router.get('/', getAllBlogs)
router.get('/stats', getBlogStats)
router.get('/:slugOrId', getBlogBySlugOrId)

// Protected Admin Routes
router.post('/', authenticate, createBlog)
router.put('/:id', authenticate, updateBlog)
router.patch('/:id/status', authenticate, toggleBlogStatus)
router.delete('/:id', authenticate, deleteBlog)
router.post('/seed', authenticate, seedBlogs)

export default router

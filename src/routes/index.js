import { Router } from 'express'
import authRoutes from './auth.routes.js'
import serviceRoutes from './service.routes.js'
import projectRoutes from './project.routes.js'
import galleryRoutes from './gallery.routes.js'
import uploadRoutes from './upload.routes.js'
import blogRoutes from './blog.routes.js'
import inquiryRoutes from './inquiry.routes.js'
import settingRoutes from './setting.routes.js'

const router = Router()

// Central Route Aggregator
router.use('/auth', authRoutes)
router.use('/services', serviceRoutes)
router.use('/projects', projectRoutes)
router.use('/gallery', galleryRoutes)
router.use('/upload', uploadRoutes)
router.use('/blog', blogRoutes)
router.use('/blogs', blogRoutes)
router.use('/inquiries', inquiryRoutes)
router.use('/inquiry', inquiryRoutes)
router.use('/applications', inquiryRoutes)
router.use('/settings', settingRoutes)
router.use('/setting', settingRoutes)

export default router

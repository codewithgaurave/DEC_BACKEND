import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/index.js'
import { errorHandler } from './middlewares/error.middleware.js'
import { apiLimiter } from './middlewares/rateLimiter.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const createApp = () => {
  const app = express()

  // Serve static files from backend uploads directory (services, projects, general)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

  // Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    })
  )

  // CORS Configuration - Allow any port & any frontend origin dynamically
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allows any port (5173, 5174, 5175, 3000, 8080, etc.), localhost, IPs, and deployments
        callback(null, true)
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  )

  // Body Parsing Middlewares
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Request Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      status: 'online',
      message: 'DEC Engineering Backend REST API is running successfully',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    })
  })

  // Mount API Endpoints with API Rate Limiter
  app.use('/api', apiLimiter, apiRoutes)

  // 404 Handler for undefined API routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    })
  })

  // Global Error Handling Middleware
  app.use(errorHandler)

  return app
}

export default createApp

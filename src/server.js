import 'dotenv/config'
import { connectDB } from './config/db.js'
import { createApp } from './app.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // 1. Establish Database Connection First
    await connectDB()

    // 2. Initialize Express Application
    const app = createApp()

    // 3. Start Listening for Incoming HTTP Requests
    app.listen(PORT, () => {
      console.log(`🚀 DEC Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
      console.log(`👉 Health check URL: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

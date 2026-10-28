import mongoose from 'mongoose'

/**
 * Connect to MongoDB using Mongoose
 * Reads MONGO_URI from environment variables
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('❌ MongoDB Connection Error: MONGO_URI is not defined in .env file!')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000, // Timeout after 8s instead of hanging indefinitely
    })

    console.log(`✅ MongoDB Connected Successfully:`)
    console.log(`   Host: ${conn.connection.host}`)
    console.log(`   Database: ${conn.connection.name}`)
    console.log(`   Port: ${conn.connection.port || 'Atlas Default'}`)

    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    if (error.name === 'MongoServerSelectionError') {
      console.error('   👉 Tip: Please verify your IP address is whitelisted in MongoDB Atlas Network Access.')
    }
    process.exit(1)
  }
}

// Global Mongoose Event Listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connection state: CONNECTED')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose runtime error:', err.message)
})

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose connection disconnected.')
})

// Graceful application termination handling
const handleGracefulShutdown = async (signal) => {
  try {
    console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`)
    await mongoose.connection.close()
    console.log('🔒 MongoDB connection closed cleanly.')
    process.exit(0)
  } catch (err) {
    console.error('Error during graceful shutdown:', err)
    process.exit(1)
  }
}

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'))
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'))

export default connectDB

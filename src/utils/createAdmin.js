import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.model.js'

/**
 * Standalone Admin Creation / Reset Script
 * Creates or resets the primary Super Admin account
 */
const seedAdmin = async () => {
  const adminData = {
    name: 'DEC Super Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'superadmin',
    title: 'Chief Technical Administrator',
    phone: '+20 100 482 9182',
    status: 'active',
  }

  try {
    console.log('🔄 Connecting to MongoDB database...')
    await connectDB()

    const normalizedEmail = adminData.email.trim().toLowerCase()

    // Check if admin already exists
    let user = await User.findOne({ email: normalizedEmail })

    if (user) {
      console.log(`ℹ️  Admin with email "${normalizedEmail}" already exists. Updating credentials...`)
      user.name = adminData.name
      user.password = adminData.password // triggers pre-save bcrypt hash
      user.role = adminData.role
      user.status = 'active'
      user.title = adminData.title
      await user.save()
      console.log('✅ Admin credentials updated successfully!')
    } else {
      console.log(`✨ Creating new Super Admin account for "${normalizedEmail}"...`)
      user = await User.create(adminData)
      console.log('✅ New Super Admin created successfully!')
    }

    console.log('\n=========================================')
    console.log('🔐 DEC SUPER ADMIN CREDENTIALS')
    console.log('=========================================')
    console.log(`   Email:    ${adminData.email}`)
    console.log(`   Password: ${adminData.password}`)
    console.log(`   Role:     ${user.role}`)
    console.log(`   Status:   ${user.status}`)
    console.log(`   User ID:  ${user._id}`)
    console.log('=========================================\n')

    await mongoose.connection.close()
    console.log('🔒 Database connection closed. Done.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
    process.exit(1)
  }
}

seedAdmin()

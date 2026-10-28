import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import Service from '../models/Service.model.js'
import { SEED_SERVICES_DATA } from '../controllers/service.controller.js'

dotenv.config()

const seed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await connectDB()

    console.log('🧹 Clearing existing services...')
    await Service.deleteMany({})

    console.log(`🌱 Seeding ${SEED_SERVICES_DATA.length} core engineering disciplines...`)
    const result = await Service.insertMany(SEED_SERVICES_DATA)

    console.log(`✅ Successfully seeded ${result.length} services:`)
    result.forEach((s) => console.log(`   - [${s.order}] ${s.title} (${s.slug}) [${s.status}]`))

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during services seeding:', error)
    process.exit(1)
  }
}

seed()

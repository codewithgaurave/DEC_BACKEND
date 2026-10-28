import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import Gallery from '../models/Gallery.model.js'
import { SEED_GALLERY_DATA } from '../data/seedGallery.js'

dotenv.config()

const seed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await connectDB()

    console.log('🧹 Clearing existing gallery items...')
    await Gallery.deleteMany({})

    console.log(
      `🌱 Seeding ${SEED_GALLERY_DATA.length} visual archive photographs...`
    )

    const result = await Gallery.insertMany(SEED_GALLERY_DATA)

    console.log(
      `✅ Successfully seeded ${result.length} visual archive photographs in MongoDB!`
    )
    console.log(`   Sample: [${result[0].sector}] ${result[0].title} -> ${result[0].image}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during gallery seeding:', error)
    process.exit(1)
  }
}

seed()

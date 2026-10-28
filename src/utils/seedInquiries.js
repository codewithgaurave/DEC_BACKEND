import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Inquiry from '../models/Inquiry.model.js'
import { SEED_INQUIRIES } from '../data/seedInquiries.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DEC'

async function runSeed() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI)
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB Connected successfully.')

    const count = await Inquiry.countDocuments()
    console.log(`Current inquiries in DB: ${count}`)

    if (count > 0) {
      console.log('Deleting existing test inquiries...')
      await Inquiry.deleteMany({})
    }

    console.log(`Inserting ${SEED_INQUIRIES.length} inquiries & career applications...`)
    const result = await Inquiry.insertMany(SEED_INQUIRIES)
    console.log(`Successfully seeded ${result.length} inquiries into MongoDB!`)

    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

runSeed()

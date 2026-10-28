import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Blog from '../models/Blog.model.js'
import { SEED_BLOGS } from '../data/seedBlogs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/DEC'

async function seed() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI)
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected successfully.')

    const deleted = await Blog.deleteMany({})
    console.log(`Cleared ${deleted.deletedCount} existing blogs.`)

    const inserted = await Blog.insertMany(SEED_BLOGS)
    console.log(`Successfully seeded ${inserted.length} blog articles into MongoDB!`)

    process.exit(0)
  } catch (error) {
    console.error('Error seeding blogs:', error)
    process.exit(1)
  }
}

seed()

import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import Project from '../models/Project.model.js'
import { SEED_PROJECTS_DATA } from '../data/seedProjects.js'

dotenv.config()

const seed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await connectDB()

    console.log('🧹 Clearing existing projects...')
    await Project.deleteMany({})

    console.log(
      `🌱 Seeding ${SEED_PROJECTS_DATA.length} landmark projects from DEC website...`
    )

    const cleanedProjects = SEED_PROJECTS_DATA.map((p, idx) => ({
      code: p.code || `DEC-${String(idx + 1).padStart(3, '0')}`,
      name: p.name,
      sector: p.sector || 'Offices',
      sectorSlug: p.sectorSlug || 'offices',
      type: p.type || '',
      location: p.location || 'Doha, Qatar',
      scope: p.scope || 'Engineering Design & Supervision',
      image: p.image
        ? p.image.replace(/^\/Projects Images\/Projects Images\//, '/uploads/projects/')
        : '',
      keywords: p.keywords || '',
      tags: p.tags || [],
      order: idx + 1,
      status: 'active',
      year: '2025',
    }))

    const result = await Project.insertMany(cleanedProjects)

    console.log(`✅ Successfully seeded ${result.length} landmark projects!`)
    console.log(
      `   Sample: [${result[0].code}] ${result[0].name} (${result[0].sector})`
    )

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during projects seeding:', error)
    process.exit(1)
  }
}

seed()

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Signature from '../models/Signature.model.js'
import { generateSignatureHtml } from './signatureTemplate.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const signaturesDir = path.resolve(__dirname, '../../uploads/signatures')

if (!fs.existsSync(signaturesDir)) {
  fs.mkdirSync(signaturesDir, { recursive: true })
}

const initialData = {
  name: 'Islam Farid',
  qualifications: 'MSc, MBA, MCIOB, PMP',
  designation: 'Founding Partner & General Manager',
  mobile: '(+974) 31601117',
  telephone: '(+974) 44554383',
  email: 'islam@desentralqatar.com',
  address: 'Office 704, Manarat Lusail Tower, Qatar',
  addressUrl: 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
  website: 'www.desentralqatar.com',
  websiteUrl: 'https://desentralqatar.com/',
  linkedin: 'LinkedIn',
  linkedinUrl: 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
  disclaimer:
    'The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.',
}

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dec_db'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB for signature seeding...')

    const fileName = 'Islam_Farid.html'
    const htmlContent = generateSignatureHtml(initialData)
    const filePath = path.join(signaturesDir, fileName)
    fs.writeFileSync(filePath, htmlContent, 'utf8')
    console.log(`Saved HTML file to: ${filePath}`)

    const fileUrl = `/uploads/signatures/${fileName}`

    await Signature.deleteMany({ name: 'Islam Farid' })
    const created = await Signature.create({
      ...initialData,
      htmlContent,
      fileName,
      fileUrl,
    })

    console.log('Seeded Signature:', created.name, 'with ID:', created._id)
    process.exit(0)
  } catch (err) {
    console.error('Seeding error:', err)
    process.exit(1)
  }
}

seed()

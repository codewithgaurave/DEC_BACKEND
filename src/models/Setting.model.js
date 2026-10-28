import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'agency_profile',
      unique: true,
      index: true,
    },
    agencyName: {
      type: String,
      default: 'Desentral Engineering Consultancy (DEC)',
      trim: true,
    },
    agencySlogan: {
      type: String,
      default: 'Building a Stronger Future Together',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'info@dec-consultancy.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+974 4455 4383 / +20 2 2736 8490',
      trim: true,
    },
    headquarters: {
      type: String,
      default: 'Doha, Qatar & Cairo, Egypt',
      trim: true,
    },
    commercialReg: {
      type: String,
      default: 'CR-9847201',
      trim: true,
    },
    taxNumber: {
      type: String,
      default: 'TAX-8392019',
      trim: true,
    },
    currency: {
      type: String,
      default: 'QAR / EGP / USD',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Setting = mongoose.model('Setting', settingSchema)
export default Setting

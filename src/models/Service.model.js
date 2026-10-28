import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Service slug identifier is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
      default: 'Engineering',
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      default: 'FiLayers', // Default icon identifier (e.g. FaCompassDrafting, FiLayers, FiTool, FiZap, FiShield, FiCpu)
    },
    image: {
      type: String,
      trim: true,
      default: '/projects-gallery/01.jpg',
    },
    capabilities: {
      type: [String],
      default: [], // Specialized technical capability bullet points (shown on Expertise page)
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Consult Engineers',
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '/contact',
    },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
      metaKeywords: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Optimized Compound Indexes for maximum query performance (< 10ms)
serviceSchema.index({ status: 1, order: 1 })
serviceSchema.index({ category: 1, status: 1 })
serviceSchema.index({ title: 'text', description: 'text' })

const Service = mongoose.model('Service', serviceSchema)

export default Service

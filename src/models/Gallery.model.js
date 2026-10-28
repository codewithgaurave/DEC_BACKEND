import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Gallery image path or URL is required'],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, 'Sector category is required'],
      default: 'Offices',
      index: true,
    },
    sectorSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Doha, Qatar',
    },
    scope: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    dimensions: {
      type: String,
      trim: true,
      default: '3840 x 2160',
    },
    fileSize: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Helper pre-save hook to compute sectorSlug automatically
gallerySchema.pre('save', function () {
  if (this.sector && !this.sectorSlug) {
    const map = {
      offices: 'offices',
      retail: 'retail',
      'f&b': 'fnb',
      hospitality: 'hospitality',
      residential: 'residential',
      industrial: 'industrial',
      medical: 'medical',
      'medical & healthcare': 'medical',
      general: 'general',
    }
    const key = this.sector.toLowerCase().trim()
    this.sectorSlug =
      map[key] || key.replace(/&/g, 'and').replace(/[\s\W-]+/g, '-')
  }
})

// Search index
gallerySchema.index({
  title: 'text',
  location: 'text',
  scope: 'text',
})

const Gallery = mongoose.model('Gallery', gallerySchema)
export default Gallery

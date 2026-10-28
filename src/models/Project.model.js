import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Project code is required (e.g. DEC-001)'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
      index: true,
    },
    sector: {
      type: String,
      required: [true, 'Project sector is required'],
      enum: {
        values: [
          'Offices',
          'Retail',
          'F&B',
          'Hospitality',
          'Residential',
          'Industrial',
          'Medical',
          'Medical & Healthcare',
        ],
        message: '{VALUE} is not a valid sector',
      },
      default: 'Offices',
      index: true,
    },
    sectorSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Project location is required (e.g. Lusail, Qatar)'],
      trim: true,
      index: true,
    },
    scope: {
      type: String,
      required: [
        true,
        'Project scope is required (e.g. ARCH R&M, MEP & QCD Design & Supervision)',
      ],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    client: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      trim: true,
      default: '2025',
    },
    description: {
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Helper pre-save hook to compute sectorSlug automatically
projectSchema.pre('save', function () {
  if (this.sector && !this.sectorSlug) {
    const slugMap = {
      offices: 'offices',
      retail: 'retail',
      'f&b': 'fnb',
      hospitality: 'hospitality',
      residential: 'residential',
      industrial: 'industrial',
      medical: 'medical',
      'medical & healthcare': 'medical',
    }
    const key = this.sector.toLowerCase().trim()
    this.sectorSlug =
      slugMap[key] || key.replace(/&/g, 'and').replace(/[\s\W-]+/g, '-')
  }
  if (this.code) {
    this.code = this.code.trim().toUpperCase()
  }
})

// Search index
projectSchema.index({
  name: 'text',
  location: 'text',
  scope: 'text',
  keywords: 'text',
})

const Project = mongoose.model('Project', projectSchema)
export default Project

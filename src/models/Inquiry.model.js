import mongoose from 'mongoose'

const cvSchema = new mongoose.Schema(
  {
    filename: { type: String, default: '' },
    contentType: { type: String, default: '' },
    url: { type: String, default: '' },
    base64: { type: String, default: '' },
  },
  { _id: false }
)

const inquirySchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['contact', 'career', 'consultation'],
      default: 'contact',
      index: true,
    },
    // Contact & Common Details
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    discipline: {
      type: String,
      trim: true,
      default: 'Project Consultation',
    },
    location: {
      type: String,
      trim: true,
      default: 'Qatar',
    },
    stage: {
      type: String,
      trim: true,
      default: 'Concept & Permitting',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      default: 'Website Contact Page',
    },
    // Career Application specific details
    position: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: String,
      trim: true,
      default: '',
    },
    currentRole: {
      type: String,
      trim: true,
      default: '',
    },
    noticePeriod: {
      type: String,
      trim: true,
      default: '',
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    cv: {
      type: cvSchema,
      default: null,
    },
    // Workflow & Status
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved', 'Archived'],
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    assignedTo: {
      type: String,
      default: 'Admin',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    adminNotes: [
      {
        note: { type: String, default: '' },
        author: { type: String, default: 'Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Auto-generate reference ID before saving if not present
inquirySchema.pre('save', async function () {
  if (!this.refId) {
    const prefix = this.type === 'career' ? 'DEC-CAR' : 'DEC-INQ'
    const count = await mongoose.model('Inquiry').countDocuments()
    const num = String(count + 101).padStart(5, '0')
    this.refId = `${prefix}-${num}`
  }
})

const Inquiry = mongoose.model('Inquiry', inquirySchema)

export default Inquiry

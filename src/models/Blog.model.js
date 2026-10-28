import mongoose from 'mongoose'

const blogSectionSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    paragraphs: { type: [String], default: [] },
    bulletPoints: { type: [String], default: [] },
  },
  { _id: false }
)

const tableOfContentsSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  { _id: false }
)

const faqSchema = new mongoose.Schema(
  {
    q: { type: String, default: '' },
    a: { type: String, default: '' },
  },
  { _id: false }
)

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    leadExcerpt: {
      type: String,
      required: [true, 'Short summary / lead excerpt is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '', // Full HTML / rich text content
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Engineering & Infrastructure',
      index: true,
    },
    author: {
      name: { type: String, default: 'DEC Technical Advisory Board' },
      role: { type: String, default: 'MMUP Grade A & QCDD Certified Experts' },
      avatar: { type: String, default: '/logo.png' },
    },
    featuredImage: {
      type: String,
      default: '/projects-gallery/01.jpg',
    },
    tableOfContents: {
      type: [tableOfContentsSchema],
      default: [],
    },
    contentSections: {
      type: [blogSectionSchema],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Archived'],
      default: 'Published',
      index: true,
    },
    publishedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
    },
    viewsCount: {
      type: Number,
      default: 120,
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

blogSchema.index({
  title: 'text',
  leadExcerpt: 'text',
  content: 'text',
  category: 'text',
})

export default mongoose.model('Blog', blogSchema)

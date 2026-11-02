import mongoose from 'mongoose'

const certLogoSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    url: { type: String, required: true },
  },
  { _id: false }
)

const signatureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      required: [true, 'Designation / job title is required'],
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    telephone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: 'Office 704, Manarat Lusail Tower, Qatar',
    },
    addressUrl: {
      type: String,
      trim: true,
      default: 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
    },
    website: {
      type: String,
      trim: true,
      default: 'www.desentralqatar.com',
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: 'https://desentralqatar.com/',
    },
    linkedin: {
      type: String,
      trim: true,
      default: 'LinkedIn',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
    },
    // Dynamic Grade / Classification Controls
    showGradeBadge: {
      type: Boolean,
      default: true,
    },
    gradeType: {
      type: String,
      enum: ['image', 'text'],
      default: 'image',
    },
    gradeTextPrefix: {
      type: String,
      default: 'Grade A',
    },
    gradeTextSuffix: {
      type: String,
      default: 'Multidisciplinary Engineering Consultancy',
    },
    gradeBadgeUrl: {
      type: String,
      default: 'https://taxcaresolution.com/wp-content/uploads/2026/08/Grade-Text-New.png',
    },
    // Multiple Dynamic Certification Logos
    certLogoHeight: {
      type: Number,
      default: 28,
    },
    showCertifications: {
      type: Boolean,
      default: true,
    },
    certificationsUrl: {
      type: String,
      default: 'https://taxcaresolution.com/wp-content/uploads/2026/08/Certifications-logos-new.jpg',
    },
    certificationLogos: {
      type: [certLogoSchema],
      default: [
        { name: 'ISO 9001', url: '/uploads/signatures/assets/cert_iso_9001.png' },
        { name: 'ISO 14001', url: '/uploads/signatures/assets/cert_iso_14001.png' },
        { name: 'ISO 45001', url: '/uploads/signatures/assets/cert_iso_45001.png' },
        { name: 'GSAS Provider', url: '/uploads/signatures/assets/cert_gsas.png' },
        { name: 'Tawteen', url: '/uploads/signatures/assets/cert_tawteen.png' },
        { name: 'ICV Certified', url: '/uploads/signatures/assets/cert_icv.png' },
      ],
    },
    showCustomAuthorityLogo: {
      type: Boolean,
      default: false,
    },
    customAuthorityLogoUrl: {
      type: String,
      default: '',
    },
    companyLogoUrl: {
      type: String,
      default: 'https://taxcaresolution.com/wp-content/uploads/2026/08/DEC-new-final.jpg',
    },
    disclaimer: {
      type: String,
      default:
        'The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.',
    },
    htmlContent: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

signatureSchema.index({ name: 'text', designation: 'text', email: 'text' })

export const Signature = mongoose.model('Signature', signatureSchema)
export default Signature

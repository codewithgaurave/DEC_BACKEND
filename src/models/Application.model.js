// Job Application Model (Schema for candidates applying via DEC Career)
// import mongoose from 'mongoose'

export const applicationSchemaDefinition = {
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  experience: { type: String, required: true },
  resumeUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'shortlisted', 'rejected'],
    default: 'pending',
  },
  appliedAt: { type: Date, default: Date.now },
}

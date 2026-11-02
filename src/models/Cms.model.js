import mongoose from 'mongoose'

const cmsSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      default: 'home',
      index: true,
      trim: true,
    },
    // Home Section: One Team. Multiple Disciplines. Integrated Delivery.
    integratedDelivery: {
      image: {
        type: String,
        default: '/uploads/cms/dec_integrated_engineering.jpg',
        trim: true,
      },
      altText: {
        type: String,
        default: 'DEC Integrated Multi-Discipline Engineering and 3D BIM Delivery',
        trim: true,
      },
      badge: {
        type: String,
        default: 'Coordinated Engineering Leadership',
        trim: true,
      },
      description: {
        type: String,
        default:
          'Delivering end-to-end design, authority approvals and site supervision across Qatar, Egypt, and Saudi Arabia.',
        trim: true,
      },
    },
    // Why DEC Section: Virtual Construction Before Physical Groundbreaking (BIM Level 2 Coordination)
    bimCoordination: {
      image: {
        type: String,
        default: '/uploads/cms/why_dec_bim_edge.jpg',
        trim: true,
      },
      altText: {
        type: String,
        default: 'DEC 3D BIM Level 2 Coordination and Clash Detection',
        trim: true,
      },
      badge: {
        type: String,
        default: 'Federated 3D Coordination',
        trim: true,
      },
      statusTag: {
        type: String,
        default: 'BIM LEVEL 2 ACTIVE',
        trim: true,
      },
      description: {
        type: String,
        default:
          'Synchronized Revit & Navisworks models across Architecture, Structure, HVAC & Electrical ELV.',
        trim: true,
      },
    },
    // Extensible store for additional dynamic homepage & website sections
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Cms', cmsSchema)

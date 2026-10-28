import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an admin name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'superadmin'],
        message: '{VALUE} is not a valid admin role',
      },
      default: 'admin',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: 'DEC Administrator',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    twoFactorAuth: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Pre-save hook: Hash password automatically if created or modified (Mongoose 8/9 async hook)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

// Transform user object for response (stripping sensitive info)
userSchema.methods.toSafeObject = function () {
  const user = this.toObject()
  delete user.password
  return user
}

export const User = mongoose.model('User', userSchema)
export default User

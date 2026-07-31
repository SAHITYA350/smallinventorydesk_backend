import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    DOB: {
      type: Date,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    phoneNumber: {
      type: String,
      required: false,
      default: '',
    },
    profileImage: {
      type: String,
      required: false,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
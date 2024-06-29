import mongoose from 'mongoose'

const donationItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  pickupInstruction: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'soon available', 'not available'],
    default: 'not available',
    required: true
  },
  donatedBy: {
    type: String,
    required: true
  },
  removed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const DonationItem = mongoose.model('DonationItem', donationItemSchema)

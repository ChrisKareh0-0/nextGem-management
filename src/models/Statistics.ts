import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
  totalIncome: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
statisticsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Statistics = mongoose.models.Statistics || mongoose.model('Statistics', statisticsSchema);

export default Statistics; 
import mongoose from 'mongoose';

const monthlyIncomeSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  amount: {
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
monthlyIncomeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a compound index for year and month
monthlyIncomeSchema.index({ year: 1, month: 1 }, { unique: true });

const MonthlyIncome = mongoose.models.MonthlyIncome || mongoose.model('MonthlyIncome', monthlyIncomeSchema);

export default MonthlyIncome; 
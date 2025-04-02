import mongoose, { Model } from 'mongoose';

interface IStatistics {
  totalIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IStatisticsModel extends Model<IStatistics> {
  getOrCreate(): Promise<IStatistics>;
}

const statisticsSchema = new mongoose.Schema({
  totalIncome: {
    type: Number,
    required: true,
    default: 0,
    min: 0
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

// Ensure we have only one statistics document
statisticsSchema.static('getOrCreate', async function() {
  let stats = await this.findOne({});
  if (!stats) {
    stats = await this.create({ totalIncome: 0 });
  }
  return stats;
});

const Statistics = (mongoose.models.Statistics || mongoose.model<IStatistics, IStatisticsModel>('Statistics', statisticsSchema));

export default Statistics; 
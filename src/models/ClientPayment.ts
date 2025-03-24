import mongoose from 'mongoose';

const clientPaymentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
clientPaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ClientPayment = mongoose.models.ClientPayment || mongoose.model('ClientPayment', clientPaymentSchema);

export default ClientPayment; 
const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Auto-update status based on dates
electionSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startDate) this.status = 'upcoming';
  else if (now >= this.startDate && now <= this.endDate) this.status = 'active';
  else this.status = 'closed';
};

module.exports = mongoose.model('Election', electionSchema);

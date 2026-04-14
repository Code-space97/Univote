const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voter',
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  votes: [{
    category: String,
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    }
  }]
}, { timestamps: true });

// Unique vote per voter per election
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);

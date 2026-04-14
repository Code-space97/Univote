const express = require('express');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Voter = require('../models/Voter');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET all active elections
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    // Auto-update statuses
    await Election.updateMany({ startDate: { $lte: now }, endDate: { $gte: now } }, { status: 'active' });
    await Election.updateMany({ endDate: { $lt: now } }, { status: 'closed' });
    await Election.updateMany({ startDate: { $gt: now } }, { status: 'upcoming' });

    const elections = await Election.find().sort('-createdAt');
    res.json(elections);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single election with candidates
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const candidates = await Candidate.find({ election: req.params.id, isActive: true }).sort('category');

    // Check if voter already voted
    let hasVoted = false;
    if (req.role === 'voter') {
      const vote = await Vote.findOne({ voter: req.user._id, election: req.params.id });
      hasVoted = !!vote;
    }

    res.json({ election, candidates, hasVoted });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST submit ballot
router.post('/:id/vote', async (req, res) => {
  try {
    if (req.role !== 'voter') return res.status(403).json({ message: 'Only voters can cast votes.' });

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });
    if (election.status !== 'active') return res.status(400).json({ message: 'This election is not currently active.' });

    // Check duplicate vote
    const existing = await Vote.findOne({ voter: req.user._id, election: req.params.id });
    if (existing) return res.status(400).json({ message: 'You have already voted in this election.' });

    const { votes } = req.body; // [{ category, candidateId }]
    if (!votes || !Array.isArray(votes) || votes.length === 0)
      return res.status(400).json({ message: 'No votes submitted.' });

    // Save vote record
    const voteDoc = await Vote.create({
      voter: req.user._id,
      election: req.params.id,
      votes: votes.map(v => ({ category: v.category, candidate: v.candidateId }))
    });

    // Increment candidate vote counts
    for (const v of votes) {
      await Candidate.findByIdAndUpdate(v.candidateId, { $inc: { voteCount: 1 } });
    }

    // Track voter's participation
    await Voter.findByIdAndUpdate(req.user._id, { $addToSet: { votedIn: req.params.id } });

    res.status(201).json({ message: 'Your vote has been cast successfully! 🗳️', voteId: voteDoc._id });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already voted in this election.' });
    res.status(500).json({ message: err.message });
  }
});

// GET public results (for closed elections or if admin)
router.get('/:id/results', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const candidates = await Candidate.find({ election: req.params.id }).sort('-voteCount');
    const totalVotes = await Vote.countDocuments({ election: req.params.id });

    const byCategory = {};
    for (const c of candidates) {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    }

    res.json({ election, totalVotes, byCategory });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

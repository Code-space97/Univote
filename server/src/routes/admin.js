const express = require('express');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

// ── VOTERS ──────────────────────────────────────────────

// GET all voters
router.get('/voters', async (req, res) => {
  try {
    const voters = await Voter.find().select('-password').sort('-createdAt');
    res.json(voters);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create voter
router.post('/voters', async (req, res) => {
  try {
    const { voterId, name, email, password, department, year } = req.body;
    const voter = await Voter.create({ voterId, name, email, password, department, year });
    res.status(201).json({ message: 'Voter created.', voter: { ...voter.toObject(), password: undefined } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Voter ID or email already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT update voter
router.put('/voters/:id', async (req, res) => {
  try {
    const { name, email, department, year, isActive } = req.body;
    const voter = await Voter.findByIdAndUpdate(
      req.params.id,
      { name, email, department, year, isActive },
      { new: true }
    ).select('-password');
    if (!voter) return res.status(404).json({ message: 'Voter not found.' });
    res.json(voter);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE voter
router.delete('/voters/:id', async (req, res) => {
  try {
    await Voter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voter deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ELECTIONS ────────────────────────────────────────────

// GET all elections
router.get('/elections', async (req, res) => {
  try {
    const elections = await Election.find().sort('-createdAt');
    res.json(elections);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create election
router.post('/elections', async (req, res) => {
  try {
    const { title, description, categories, startDate, endDate } = req.body;
    const election = await Election.create({
      title, description, categories, startDate, endDate,
      createdBy: req.user._id
    });
    res.status(201).json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update election
router.put('/elections/:id', async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!election) return res.status(404).json({ message: 'Election not found.' });
    res.json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE election
router.delete('/elections/:id', async (req, res) => {
  try {
    await Election.findByIdAndDelete(req.params.id);
    await Candidate.deleteMany({ election: req.params.id });
    await Vote.deleteMany({ election: req.params.id });
    res.json({ message: 'Election and related data deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── CANDIDATES ───────────────────────────────────────────

// GET candidates for an election
router.get('/elections/:id/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.id }).sort('category');
    res.json(candidates);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add candidate
router.post('/candidates', async (req, res) => {
  try {
    const { name, election, category, department, year, manifesto } = req.body;
    const candidate = await Candidate.create({ name, election, category, department, year, manifesto });
    res.status(201).json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update candidate
router.put('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    res.json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE candidate
router.delete('/candidates/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── RESULTS ──────────────────────────────────────────────

// GET results for an election
router.get('/elections/:id/results', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const candidates = await Candidate.find({ election: req.params.id }).sort('-voteCount');
    const totalVotes = await Vote.countDocuments({ election: req.params.id });

    // Group by category
    const byCategory = {};
    for (const c of candidates) {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    }

    res.json({ election, totalVotes, byCategory });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalVoters, totalElections, activeElections, totalVotes] = await Promise.all([
      Voter.countDocuments(),
      Election.countDocuments(),
      Election.countDocuments({ status: 'active' }),
      Vote.countDocuments()
    ]);
    res.json({ totalVoters, totalElections, activeElections, totalVotes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// 1. Create a Project (Admin Only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required.' });

  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating project.' });
  }
});

// 2. Get All Projects (Accessible by Admins and Members)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving projects.' });
  }
});

module.exports = router;
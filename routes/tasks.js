const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// 1. Create a Task (Admin Only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { title, description, due_date, project_id, assigned_to } = req.body;
  if (!title || !project_id) return res.status(400).json({ message: 'Title and Project ID are required.' });

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, due_date, project_id, assigned_to) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, due_date, project_id, assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating task.' });
  }
});

// 2. Get Dashboard Tasks (Admins see all; Members see tasks assigned to them)
router.get('/', auth, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'Admin') {
      result = await pool.query(`
        SELECT t.*, p.name as project_name, u.name as assigned_user 
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.due_date ASC
      `);
    } else {
      result = await pool.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to = $1 
        ORDER BY t.due_date ASC
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error getting tasks.' });
  }
});

// 3. Update Task Status (Admin & Assigned Member can do this)
router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    // Verify permissions
    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) return res.status(404).json({ message: 'Task not found.' });

    const task = taskCheck.rows[0];
    if (req.user.role !== 'Admin' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this task.' });
    }

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating task status.' });
  }
});

// 4. Get List of Members (Admin needs this to assign tasks to users)
router.get('/members', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE role = \'Member\'');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching team members.' });
  }
});

module.exports = router;
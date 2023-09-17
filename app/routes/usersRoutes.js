const express = require('express');
const userController = require('../controllers/userController');
const { roles } = require('../models/userModel');

const router = express.Router();

router.use((req, res, next) => {
  if (req.user.role !== roles.Manager) return res.status(403).json({ error: 'Permission Denied!' });
  return next();
});

router.post('/create', userController.create);

router.put('/update/:username', userController.update);

router.get('/list', userController.list);

router.get('/list/:username', userController.getUsername);

router.delete('/:username', userController.delete);

module.exports = router;

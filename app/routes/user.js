const express = require('express');
const userController = require('../controllers/user');
const { roles } = require('../models/user');

const router = express.Router();

router.use((req, res, next) => {
  if (req.user.role !== roles.Manager) return res.status(403).json({ error: 'Permission Denied!' });
  return next();
});

router.put('/:username', userController.update);

router.get('/list', userController.list);

router.get('/list/:username', userController.getByUsername);

router.delete('/:username', userController.delete);

module.exports = router;

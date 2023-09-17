const express = require('express');
const users = require('./usersRoutes');
const userController = require('../controllers/userController');
const tasks = require('./tasksRoutes');
const passport = require('../utils/authentication');

const router = express.Router();

router.post('/login', passport.authenticate('local'), userController.login);
router.use('/users', passport.authenticate('jwt', { session: false }), users);
router.use('/tasks', passport.authenticate('jwt', { session: false }), tasks);

module.exports = router;

const express = require('express');
const users = require('./user');
const userController = require('../controllers/user');
const tasks = require('./task');
const passport = require('../utils/authentication');

const router = express.Router();

router.post('/register', userController.create);
router.post('/login', passport.authenticate('local'), userController.login);
router.use('/users', passport.authenticate('jwt', { session: false }), users);
router.use('/tasks', passport.authenticate('jwt', { session: false }), tasks);

module.exports = router;

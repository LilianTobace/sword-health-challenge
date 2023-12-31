const express = require('express');
const taskController = require('../controllers/task');

const router = express.Router();

router.post('/create', taskController.create);

router.put('/:id', taskController.update);

router.get('/list', taskController.list);

router.get('/list/:userId', taskController.listByUserId);

router.delete('/:id', taskController.delete);

module.exports = router;

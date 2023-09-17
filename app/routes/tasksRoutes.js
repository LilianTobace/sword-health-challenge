const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.post('/create', taskController.create);

router.put('/update/:id', taskController.update);

router.get('/list', taskController.list);

router.get('/:userId', taskController.listByUserId);

router.delete('/:id', taskController.delete);

module.exports = router;

const model = require('../models/taskModel');
const { roles } = require('../models/userModel');
// const messaging = require('../utils/messaging');

const checkPermissions = (user, userId) => {
  if (user.role === roles.Technician) {
    if (String(user.id) !== String(userId)) {
      return 'Permission denied: userid Incorrect!';
    }
  }
  return null;
};

module.exports = {
  create: async (req, res) => {
    try {
      const { userId, summary, datePerformed } = req.body;

      const permission = checkPermissions(req.user, userId);
      if (permission) return res.status(403).json(permission);

      if (!summary || !datePerformed || !userId) {
        return res.status(400).json({ message: '"summary", "datePerformed", "userId" fields are missing!' });
      }

      const newTask = await model.create({
        userId: req.user.id,
        summary,
        datePerformed: new Date(datePerformed),
      });
      return res.status(201).json(newTask);

      // if (isTechnicianWithPermission) {
      //   const message = `User userId #${userId} created task id #${newTask.id}`;
      //   const { channel } = await messaging.connect();
      //   console.info(message);
      //   messaging.publish(channel, 'target-queue', message);
      // }
      // } else {
      //   res.status(403).json({ error: 'Forbidden' });
      // }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  listByUserId: async (req, res) => {
    try {
      const { userId } = req.params;

      const permission = checkPermissions(req.user, userId);
      if (permission) return res.status(403).json(permission);

      const task = await model.findOne({ where: { id: userId } });
      if (task) return res.status(200).json(task);

      return res.status(404).json({ error: 'Task not found!' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { summary, datePerformed, userId } = req.body;

      const permission = checkPermissions(req.user, userId);
      if (permission) return res.status(403).json(permission);

      if (!summary || !datePerformed || !userId) {
        return res.json({ message: '"summary", "datePerformed", "userId" fields are missing!' });
      }

      const updated = await model.update({
        summary, datePerformed: new Date(datePerformed), userId,
      }, { where: { id } });
      if (updated && updated > 0) return res.status(201).json('Task updated successfully!');
      return res.status(404).json({ error: 'Task not found!' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  list: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === roles.Technician) {
        tasks = await model.findAll({ where: { userId: req.user.id } });
      } else {
        tasks = await model.findAll();
      }
      res.status(201).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role === roles.Technician) {
        return res.status(403).json('Permission denied!');
      }

      const deleted = await model.destroy({ where: { id } });
      if (deleted && deleted > 0) return res.status(201).json('User deleted successfully!');
      return res.status(404).json('Task not found');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
const db = require('../models/index');
const { roles } = require('../models/user');
const notification = require('./notification');

const checkPermissions = (user, userId) => {
  if (user.role === roles.Technician) {
    if (String(user.id) !== String(userId)) {
      return 'Permission denied!';
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

      const checkUserId = await db.Users.findOne({ where: { id: userId } });
      if (!checkUserId) return res.status(404).json('UserId not found!');

      const created = await db.Tasks.create({
        userId,
        summary,
        datePerformed: new Date(datePerformed),
      });

      if (req.user.role === roles.Technician) {
        await notification.sendNotification(created, req.user.username);
        console.log('Notification is being sent to the manager...');
      }
      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  listByUserId: async (req, res) => {
    try {
      const { userId } = req.params;

      const permission = checkPermissions(req.user, userId);
      if (permission) return res.status(403).json(permission);

      const task = await db.Tasks.findAll({ where: { userId } });
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

      if (!summary && !datePerformed && !userId) {
        return res.json({ message: '"summary", "datePerformed", "userId" fields are missing!' });
      }

      if (userId) {
        const checkUserId = await db.Users.findOne({ where: { id: userId } });
        if (!checkUserId) return res.status(401).json('This userId is incorrect!');
      }

      let newDatePerformed;
      if (datePerformed) {
        newDatePerformed = new Date(datePerformed);
      }

      const updated = await db.Tasks.update({
        summary, datePerformed: newDatePerformed, userId,
      }, { where: { id } });

      if (updated && updated > 0) {
        if (req.user.role === roles.Technician) {
          await notification.sendNotification({ id, datePerformed }, req.user.username);
          console.log('Notification is being sent to the manager...');
        }
        return res.status(201).json('Task updated successfully!');
      }
      return res.status(404).json({ error: 'Task not found!' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  list: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === roles.Technician) {
        tasks = await db.Tasks.findAll({ where: { userId: req.user.id } });
      } else {
        tasks = await db.Tasks.findAll();
      }
      res.status(200).json(tasks);
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

      const deleted = await db.Tasks.destroy({ where: { id } });
      if (deleted && deleted > 0) return res.status(201).json('Task deleted successfully!');
      return res.status(404).json('Task not found');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

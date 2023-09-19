const db = require('../models/index');
const { hashPassword } = require('../models/user');

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const verifyCredentials = await db.Users.validCredentials(username, password);

      if (verifyCredentials) {
        const token = db.Users.generateToken(verifyCredentials);
        res.status(200).json(`Welcome ${verifyCredentials.name}! Token: Bearer ${token}`);
      } else {
        res.status(401).json('The username or password are invalid!');
      }
    } catch (error) {
      res.status(400).json('Invalid credentials! ', error);
    }
  },

  create: async (req, res) => {
    try {
      const {
        role, name, username, password,
      } = req.body;

      const checkUsername = await db.Users.findOne({ where: { username } });
      if (checkUsername) return res.status(401).json('This username is already exists!');

      const created = await db.Users.create({
        role, name, username, password,
      });
      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  list: async (req, res) => {
    try {
      const users = await db.Users.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await db.Users.findOne({ where: { username } });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { username } = req.params;
      const {
        name, role, password, username: newUsername,
      } = req.body;

      if (!name && !role && !password && !newUsername) {
        return res.json({
          message: '"name", "role", "password", "username" fields are missing!',
        });
      }

      if (newUsername) {
        const checkUsername = await db.Users.findOne({ where: { username: newUsername } });
        if (checkUsername) return res.status(401).json('This username is already exists!');
      }

      let newPassword;
      if (password) newPassword = await hashPassword(password);

      const updated = await db.Users.update({
        name, role, password: newPassword, username: newUsername,
      }, { where: { username } });

      if (updated && updated > 0) return res.status(201).json('User updated!');
      return res.status(404).json('User not found!');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { username } = req.params;

      const checkUsername = await db.Users.findOne({ where: { username } });
      if (!checkUsername) return res.status(404).json('Username not found!');

      await db.Users.destroy({ where: { username } });
      return res.status(201).json('User deleted!');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

};

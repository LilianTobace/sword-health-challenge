const { userModel } = require('../models/userModel');

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const verifyCredentials = await userModel.validCredentials(username, password);
      if (verifyCredentials) {
        const token = userModel.generateToken(verifyCredentials);
        res.status(200).json(`Welcome ${verifyCredentials.name}! Token: bearer ${token}`);
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

      const checkUsername = await userModel.findOne({ where: { username } });
      if (checkUsername) return res.status(401).json('This username is already exists!');
      const newUser = await userModel.create({
        role, name, username, password,
      });
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  list: async (req, res) => {
    try {
      const users = await userModel.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await userModel.verifyUsername(username);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { username } = req.params;
      const { name } = req.body;

      if (!name) return res.json({ message: '"name" field is missing!' });
      const updated = await userModel.update({ name }, { where: { username } });
      if (updated && updated > 0) return res.status(201).json('Use updated!');
      return res.status(404).json('User not found!');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { username } = req.params;
      const deleted = await userModel.destroy({ where: { username } });
      if (deleted && deleted > 0) return res.status(201).json('User deleted!');
      return res.status(404).json('User not found!');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

};

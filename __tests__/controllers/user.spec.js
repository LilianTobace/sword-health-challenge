const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { mockRequest, mockResponse, mockedModel } = require('./__mocks__/mocks');
const userController = require('../../app/controllers/user');
const mocked = require('./__stubs__/user.input.json');
const db = require('../../app/models/index');

jest.mock('../../app/models/index', () => ({ Users: mockedModel }));

let req; let res;

describe('User Controller', () => {
  beforeEach(() => { req = mockRequest(); res = mockResponse(); });
  afterEach(() => { jest.clearAllMocks(); });

  describe('login', () => {
    it('should access the system as manager', async () => {
      expect.assertions(5);

      req.body = mocked.login[0];
      db.Users.validCredentials.mockResolvedValue({ name: mocked.login[0].username });
      await userController.login(req, res);

      expect(db.Users.validCredentials).toHaveBeenCalledTimes(1);
      expect(db.Users.generateToken).toHaveBeenCalledTimes(1);
      expect(db.Users.validCredentials).toHaveBeenCalledWith(mocked.login[0].username, mocked.login[0].password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(`Welcome ${mocked.login[0].username}! Token: Bearer 123`);
    });

    it('should access the system as technician', async () => {
      expect.assertions(5);

      req.body = mocked.login[1];
      db.Users.validCredentials.mockResolvedValue({ name: mocked.login[1].username });
      await userController.login(req, res);

      expect(db.Users.validCredentials).toHaveBeenCalledTimes(1);
      expect(db.Users.generateToken).toHaveBeenCalledTimes(1);
      expect(db.Users.validCredentials).toHaveBeenCalledWith(mocked.login[1].username, mocked.login[1].password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(`Welcome ${mocked.login[1].username}! Token: Bearer 123`);
    });

    it('should not access with a invalid username or password', async () => {
      expect.assertions(4);

      req.body = mocked.login[1];
      db.Users.validCredentials.mockResolvedValue(false);
      await userController.login(req, res);

      expect(db.Users.validCredentials).toHaveBeenCalledTimes(1);
      expect(db.Users.validCredentials).toHaveBeenCalledWith(mocked.login[1].username, mocked.login[1].password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('The username or password are invalid!');
    });

    it('should handle errors', async () => {
      expect.assertions(2);
      req.body = mocked.login[0];
      db.Users.validCredentials.mockRejectedValue(new Error('error'));
      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith('Invalid credentials! ', new Error('error'));
    });
  });

  describe('create', () => {
    it('should create a new user of role manager', async () => {
      expect.assertions(5);

      req.body = mocked.create[0];
      db.Users.create.mockResolvedValue(mocked.create[0]);
      db.Users.findOne.mockResolvedValue();
      await userController.create(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Users.create).toHaveBeenCalledTimes(1);
      expect(db.Users.create).toHaveBeenCalledWith(mocked.create[0]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mocked.create[0]);
    });

    it('should create a new user of role technician', async () => {
      expect.assertions(5);
      req.body = mocked.create[1];
      db.Users.create.mockResolvedValue(mocked.create[1]);
      db.Users.findOne.mockResolvedValue();
      await userController.create(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Users.create).toHaveBeenCalledTimes(1);
      expect(db.Users.create).toHaveBeenCalledWith(mocked.create[1]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mocked.create[1]);
    });

    it('should not create a new user with the same username', async () => {
      expect.assertions(3);
      req.body = mocked.create[0];
      db.Users.create.mockResolvedValue(mocked.create[0]);
      db.Users.findOne.mockResolvedValue(true);
      await userController.create(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('This username is already exists!');
    });

    it('should handle errors', async () => {
      expect.assertions(2);
      req.body = mocked.create[0];
      db.Users.findOne.mockRejectedValue(new Error('error'));
      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('list', () => {
    it('should list all users', async () => {
      expect.assertions(3);

      db.Users.findAll.mockResolvedValue(mocked.create[0]);
      await userController.list(req, res);

      expect(db.Users.findAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mocked.create[0]);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      db.Users.findAll.mockRejectedValue(new Error('error'));
      await userController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('getByUsername', () => {
    it('should list by username', async () => {
      expect.assertions(3);

      req.params = mocked.create[0];
      db.Users.findOne.mockResolvedValue(mocked.create[0]);
      await userController.getByUsername(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mocked.create[0]);
    });

    it('should handle errors', async () => {
      expect.assertions(2);
      req.params = mocked.create[0];
      db.Users.findOne.mockRejectedValue(new Error('error'));
      await userController.getByUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('update', () => {
    it('should update the user', async () => {
      expect.assertions(5);

      req.params = mocked.create[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(false);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(mocked.create[0].password);
      db.Users.update.mockResolvedValue([1]);
      await userController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(bcrypt.hashSync).toHaveBeenCalledTimes(1);
      expect(db.Users.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('User updated!');
    });

    it('should not update with username is already exists', async () => {
      expect.assertions(3);

      req.params = mocked.create[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(true);
      await userController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('This username is already exists!');
    });

    it('should not update with the old username is invalid', async () => {
      expect.assertions(5);

      req.params = mocked.create[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(false);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(mocked.create[0].password);
      db.Users.update.mockResolvedValue([]);
      await userController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(bcrypt.hashSync).toHaveBeenCalledTimes(1);
      expect(db.Users.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('User not found!');
    });

    it('should not update without required fields', async () => {
      expect.assertions(1);

      req.params = mocked.create[0];
      req.body = {};
      await userController.update(req, res);

      expect(res.json)
        .toHaveBeenCalledWith({ message: '"name", "role", "password", "username" fields are missing!' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);
      req.params = mocked.create[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockRejectedValue(new Error('error'));
      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('delete', () => {
    it('should delete the user', async () => {
      expect.assertions(5);

      req.params = mocked.create[0];
      db.Users.findOne.mockResolvedValue(true);
      db.Users.destroy.mockResolvedValue([1]);
      await userController.delete(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Users.destroy).toHaveBeenCalledTimes(1);
      expect(db.Users.destroy).toHaveBeenCalledWith({ where: { username: mocked.create[0].username } });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('User deleted!');
    });

    it('should not delete the user if pass an invalid username', async () => {
      expect.assertions(3);

      req.params = mocked.create[0];
      db.Users.findOne.mockResolvedValue(false);
      await userController.delete(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Username not found!');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.params = mocked.create[0];
      db.Users.findOne.mockRejectedValue(new Error('error'));
      await userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });
});

const { mockRequest, mockResponse, mockedModel } = require('./__mocks__/mocks');
const taskController = require('../../app/controllers/task');
const notificationController = require('../../app/controllers/notification');
const mocked = require('./__stubs__/task.input.json');
const db = require('../../app/models/index');

jest.mock('../../app/models/index', () => ({ Tasks: mockedModel, Users: mockedModel }));

describe('Task Controller', () => {
  let req; let res;
  beforeEach(() => { req = mockRequest(); res = mockResponse(); });
  afterEach(() => { jest.clearAllMocks(); });

  describe('create', () => {
    it('should create a new task as manager permission', async () => {
      expect.assertions(5);

      req.user = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(true);
      db.Tasks.create.mockResolvedValue(mocked.create[0]);
      await taskController.create(req, res);

      const input = mocked.create[0];
      input.datePerformed = new Date(mocked.create[0].datePerformed);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Tasks.create).toHaveBeenCalledTimes(1);
      expect(db.Tasks.create).toHaveBeenCalledWith(input);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mocked.create[0]);
    });

    it('should not create a new task for different user as technician permission', async () => {
      expect.assertions(2);

      req.user = mocked.user[1];
      req.body = mocked.create[0];
      await taskController.create(req, res);

      const input = mocked.create[0];
      input.datePerformed = new Date(mocked.create[0].datePerformed);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith('Permission denied!');
    });

    it('should not create a task with an invalid userId', async () => {
      expect.assertions(3);

      req.user = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(false);
      await taskController.create(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('UserId not found!');
    });

    it('should create a new task as technician permission', async () => {
      expect.assertions(6);

      req.user = mocked.user[1];
      req.body = mocked.create[1];
      db.Users.findOne.mockResolvedValue(true);
      db.Tasks.create.mockResolvedValue(mocked.create[1]);
      jest.spyOn(notificationController, 'sendNotification').mockResolvedValue(true);

      await taskController.create(req, res);

      const input = mocked.create[1];
      input.datePerformed = new Date(mocked.create[1].datePerformed);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Tasks.create).toHaveBeenCalledTimes(1);
      expect(db.Tasks.create).toHaveBeenCalledWith(input);
      expect(
        notificationController.sendNotification(mocked.create[1], mocked.user[1].username),
      ).resolves.toEqual(true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mocked.create[1]);
    });

    it('should not create a new task without all required fields', async () => {
      expect.assertions(2);

      req.user = mocked.user[0];
      req.body = '';
      await taskController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '"summary", "datePerformed", "userId" fields are missing!' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.user = mocked.user[1];
      req.body = mocked.create[1];
      db.Tasks.create.mockRejectedValue(new Error('error'));
      await taskController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('list', () => {
    it('should list all users as manager permission', async () => {
      expect.assertions(2);

      req.user = mocked.user[0];
      db.Tasks.findAll.mockResolvedValue();
      await taskController.list(req, res);

      expect(db.Tasks.findAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should list all users as technician permission', async () => {
      expect.assertions(3);

      req.user = mocked.user[1];
      db.Tasks.findAll.mockResolvedValue();
      await taskController.list(req, res);

      expect(db.Tasks.findAll).toHaveBeenCalledTimes(1);
      expect(db.Tasks.findAll).toHaveBeenCalledWith({ where: { userId: mocked.user[1].id } });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.user = mocked.user[0];
      db.Tasks.findAll.mockRejectedValue(new Error('error'));
      await taskController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('listByUserId', () => {
    it('should list all tasks as manager permission', async () => {
      expect.assertions(3);

      req.user = mocked.user[0];
      req.params = mocked.create[0];
      db.Tasks.findAll.mockResolvedValue(mocked.create[0]);
      await taskController.listByUserId(req, res);

      expect(db.Tasks.findAll).toHaveBeenCalledTimes(1);
      expect(db.Tasks.findAll).toHaveBeenCalledWith({ where: { userId: mocked.user[0].id } });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should list all tasks as technician permission', async () => {
      expect.assertions(3);

      req.user = mocked.user[1];
      req.params = mocked.create[1];
      db.Tasks.findAll.mockResolvedValue(mocked.create[1]);
      await taskController.listByUserId(req, res);

      expect(db.Tasks.findAll).toHaveBeenCalledTimes(1);
      expect(db.Tasks.findAll).toHaveBeenCalledWith({ where: { userId: mocked.user[1].id } });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should not list all tasks if there is no task', async () => {
      expect.assertions(4);

      req.user = mocked.user[1];
      req.params = mocked.create[1];
      db.Tasks.findAll.mockResolvedValue();
      await taskController.listByUserId(req, res);

      expect(db.Tasks.findAll).toHaveBeenCalledTimes(1);
      expect(db.Tasks.findAll).toHaveBeenCalledWith({ where: { userId: mocked.user[1].id } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found!' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.user = mocked.user[1];
      req.params = mocked.create[1];
      req.user = mocked.user[0];
      db.Tasks.findAll.mockRejectedValue(new Error('error'));
      await taskController.listByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('update', () => {
    it('should not update the task with invalid id', async () => {
      expect.assertions(4);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(true);
      db.Tasks.update.mockResolvedValue([]);
      await taskController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Tasks.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found!' });
    });

    it('should update the task as manager permission', async () => {
      expect.assertions(4);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue(true);
      db.Tasks.update.mockResolvedValue([1]);
      await taskController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Tasks.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('Task updated successfully!');
    });

    it('should update the task as technician permission', async () => {
      expect.assertions(5);

      req.user = mocked.user[1];
      req.params = mocked.user[1];
      req.body = mocked.create[1];
      db.Users.findOne.mockResolvedValue(true);
      db.Tasks.update.mockResolvedValue([1]);
      jest.spyOn(notificationController, 'sendNotification').mockResolvedValue(true);
      await taskController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(db.Tasks.update).toHaveBeenCalledTimes(1);
      expect(
        notificationController.sendNotification(mocked.create[1], mocked.user[1].username),
      ).resolves.toEqual(true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('Task updated successfully!');
    });

    it('should not update the task for a different userId as technician permission', async () => {
      expect.assertions(2);

      req.user = mocked.user[1];
      req.params = mocked.user[1];
      req.body = mocked.create[0];
      await taskController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith('Permission denied!');
    });

    it('should not update a task without requireds fields', async () => {
      expect.assertions(1);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.user[0];
      await taskController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: '"summary", "datePerformed", "userId" fields are missing!' });
    });

    it('should not update a task with invalid userId', async () => {
      expect.assertions(3);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockResolvedValue();
      await taskController.update(req, res);

      expect(db.Users.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('This userId is incorrect!');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Users.findOne.mockRejectedValue(new Error('error'));
      await taskController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  describe('delte', () => {
    it('should delete a task as manager permission', async () => {
      expect.assertions(4);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Tasks.destroy.mockResolvedValue([1]);
      await taskController.delete(req, res);

      expect(db.Tasks.destroy).toHaveBeenCalledTimes(1);
      expect(db.Tasks.destroy).toHaveBeenCalledWith({ where: { id: mocked.user[0].id } });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('Task deleted successfully!');
    });

    it('should not delete a task as technician permission', async () => {
      expect.assertions(2);

      req.user = mocked.user[1];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      await taskController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith('Permission denied!');
    });

    it('should not delete an invalid task', async () => {
      expect.assertions(4);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Tasks.destroy.mockResolvedValue();
      await taskController.delete(req, res);

      expect(db.Tasks.destroy).toHaveBeenCalledTimes(1);
      expect(db.Tasks.destroy).toHaveBeenCalledWith({ where: { id: mocked.user[0].id } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Task not found');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      req.user = mocked.user[0];
      req.params = mocked.user[0];
      req.body = mocked.create[0];
      db.Tasks.destroy.mockRejectedValue(new Error('error'));
      await taskController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });
});

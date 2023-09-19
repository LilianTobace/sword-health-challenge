const notificationController = require('../../app/controllers/notification');
const mocked = require('./__stubs__/task.input.json');

describe('Notification Controller', () => {
  it('should send a notification', async () => {
    expect.assertions(1);

    const task = mocked.create[1];
    const username = mocked.user[1].username;
    await expect(notificationController.sendNotification(task, username))
      .resolves.toBe(undefined);
  });
});

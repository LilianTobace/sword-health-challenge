module.exports = {
  // Notification didn't block any http request
  sendNotification: async (task, username) => new Promise((resolve, reject) => {
    console.log(`The tech ${username} performed the task ${task.id} on date ${task.datePerformed}`);
    resolve();
  }),
};

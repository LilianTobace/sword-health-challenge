# Maintenance Task Management System

The application is a maintenance task management system for a company. It allows users to create, update, and delete tasks. There are two types of users: managers and technicians.
Managers have the ability to update, list, and delete users. They can also view all tasks, delete tasks, and be notified when a task is executed. 
Technicians can only view, create, and update their own tasks.
Both users can create their registration to access the system just to facilitate access, but I recommend blocking user creation for security reasons and making the manager the only one who can do this.

## Features

The project includes the following features:

- Docker and docker-compose for containerization and deployment.
- Express.js server to handle API requests.
- Sequelize-cli used to manage the Sequelize migrations with MySQL.
- JSON Web Tokens for authentication and authorization.
- Bcryptjs used for password hashing.
- Jest used to test the functions.

## Installation
To get started with the project, you will need to run theis command:

```shell
$ npm run build
```
It'll build the image and project, install all dependencies and configure the database.

## The application exposes the following routes:

Public routes
```shell
GET /register - Create a new user
GET /login    - Access the system
```

Users
```shell
GET /users/list           - Returns a list of all users
GET /users/list/:username - List the user by username
PUT /users/:username            - Updates an existing user
DELETE /users/:username         - Deletes an existing user
```

Task
```shell
POST /tasks/create      - Create a new task
GET /tasks/list         - Returns a list of all tasks
GET /tasks/list/:userId - List tasks by userId
PUT /tasks/:id          - Updates an existing task
DELETE /tasks/:id       - Deletes an existing task
```

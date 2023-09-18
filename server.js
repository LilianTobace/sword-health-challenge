require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./app/routes');
const passport = require('./app/utils/authentication');

module.exports.handler = async () => {
  try {
    const app = express();
    app.use(bodyParser.json());
    app.use(session({
      secret: process.env.SESSION_CLIENT_SECRET,
      // resave: false,
      // saveUninitialized: false,
    }));
    app.use(passport.initialize());

    const router = express.Router();
    app.use('/', router);
    app.use(routes);

    app.listen(process.env.PORT);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports.handler();

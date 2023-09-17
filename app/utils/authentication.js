const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { userModel } = require('../models/userModel');

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const userValidated = await userModel.validCredentials(username, password);
      if (!userValidated) { return done(null, false); }
      return done(null, userValidated);
    } catch (error) {
      console.error(error);
      return done(error);
    }
  },
));

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(new JwtStrategy(opts, (async (payload, done) => {
  try {
    const userValidated = await userModel.findOne({ where: { id: payload.id } });
    if (userValidated) return done(null, userValidated);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
})));

passport.serializeUser((user, done) => { done(null, user.id); });

passport.deserializeUser(async (id, done) => {
  userModel.findOne(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;

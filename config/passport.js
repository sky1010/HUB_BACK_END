const Strategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/userModel");
const config = require("./keys");

const applyPassportStrat = (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.passport.secret;

  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      User.findOne({
        where: { id: jwt_payload.id },
      })
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
};

module.exports = applyPassportStrat;

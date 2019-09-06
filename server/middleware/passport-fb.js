const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');

// Load User model
const User = mongoose.model('Userok');

module.exports = function(passport) {
  const fbCreds = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
  };
  passport.use(
    new FacebookStrategy(fbCreds, async (accessToken, refreshToken, profile, cb) => {
      // console.log('accessToken', accessToken);
      // console.log('refreshToken', refreshToken);
      // console.log('profile', profile);
      // User.findOrCreate({ googleId: profile.id }, function(err, user) {
      //   return cb(err, user);
      // });
      try {
        const isEmailExist = await User.findOne({ email: profile.emails[0].value });
        console.log('GOTCHA', isEmailExist);
        if (isEmailExist) {
          // We already have user with this email - update exist user
          const updatedUser = await User.updateOne(
            { email: profile.emails[0].value },
            { $set: { facebookData: profile } }
          );
          console.log('We already have user with this email - update exist user');
          cb(null, updatedUser);
          console.log('UPD_USER', { isEmailExist, updatedUser });
          return;
        }
        // We do not have user yet! So create
        const newUser = new User({
          email: profile.emails[0].value,
          facebookData: profile,
        });
        await newUser.save();
        console.log('We do not have user yet! So create');
        cb(null, newUser);
        console.log('NEW_USER', newUser);
        // creating token
      } catch (error) {
        console.log('Final error', error);
        cb(error, null);
      }
    })
  );

  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));
};

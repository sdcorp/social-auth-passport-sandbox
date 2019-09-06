const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

// Load User model
const User = mongoose.model('Userok');

module.exports = function(passport) {
  const googleCreds = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  };
  passport.use(
    new GoogleStrategy(googleCreds, async (accessToken, refreshToken, profile, cb) => {
      // console.log('accessToken', accessToken);
      // console.log('refreshToken', refreshToken);
      // console.log('profile', profile);
      // User.findOrCreate({ googleId: profile.id }, function(err, user) {
      //   return cb(err, user);
      // });
      try {
        console.log('Got here');
        const isEmailExist = await User.findOne({ email: profile.emails[0].value });
        if (isEmailExist || isEmailExist.googleData.id === profile.id) {
          // We already have user with this email - update exist user
          const updatedUser = await User.updateOne(
            { email: profile.emails[0].value },
            { $set: { googleData: profile } }
          );
          console.log('We already have user with this email - update exist user');
          cb(null, updatedUser);
          console.log('UPD_USER', { isEmailExist, updatedUser });
          return;
        }
        // We do not have user yet! So create
        const newUser = new User({
          email: profile.emails[0].value,
          googleData: profile,
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

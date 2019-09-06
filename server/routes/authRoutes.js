const express = require('express');
const { body, query } = require('express-validator');
const passport = require('passport');

const { catchAsyncErrors } = require('../helpers/errorHandlers');
const { login, register, checkToken, checkExistEmail, googleAuth, fbAuth } = require('../controllers/authController');

const router = express.Router();

router
  .route('/register')
  .post(
    [
      body('email', 'Please include a valid email').isEmail(),
      body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    catchAsyncErrors(register)
  );

router.route('/login').post(
  [
    body('email', 'Email is required')
      .not()
      .isEmpty(),
    body('password', 'Password is required')
      .not()
      .isEmpty(),
  ],
  login
);

router.route('/checkToken').get(checkToken);

router.route('/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }));
router
  .route('/google_callback')
  .get(passport.authenticate('google', { failureRedirect: '/api/v1/auth/auth_failure' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/api/v1/auth/auth_success');
  });

router.route('/facebook').get(passport.authenticate('facebook', { scope: 'email' }));
router
  .route('/facebook_callback')
  .get(passport.authenticate('facebook', { failureRedirect: '/api/v1/auth/auth_failure' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/api/v1/auth/auth_success');
  });

router.route('/auth_success').get((req, res) => res.json({ msg: 'You logged in', user: req.user }));
router.route('/auth_failure').get((req, res) => res.json({ msg: 'Failure login, pls try again' }));

router.route('/checkExistEmail').get([query('email').isEmail()], catchAsyncErrors(checkExistEmail));

module.exports = router;

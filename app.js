/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.primary' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
//const apiController = require('./controllers/api');
const teamController = require('./controllers/team');
const challengeController = require('./controllers/challenge');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/faqs', homeController.getFaqs);
app.get('/scoreboard', homeController.getScoreboard);
app.get('/challenge/:cnum', passportConfig.isAuthenticated, passportConfig.isJoined, challengeController.getChallengePage);
app.post('/challenge/:cnum', passportConfig.isAuthenticated, passportConfig.isJoined, challengeController.postChallengePage);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get('/join', passportConfig.isAuthenticated, teamController.getJoin);
app.post('/join', passportConfig.isAuthenticated, teamController.postJoin);
app.get('/create', passportConfig.isAuthenticated, teamController.getCreate);
app.post('/create', passportConfig.isAuthenticated, teamController.postCreate);
app.get('/finish', passportConfig.isAuthenticated, homeController.getFinish);
app.get('/closed', passportConfig.isAuthenticated, homeController.getClosed);

app.get('/code/mS955sz7Xef642x1', challengeController.getChallengeCode);
app.get('/code/5O3GJ4A2kkvREKB2', challengeController.getChallengeCode);
app.get('/code/1yfz5kJZ4e8X37r3', challengeController.getChallengeCode);
app.get('/code/t1lC74N7kX21K3c4', challengeController.getChallengeCode);
app.get('/code/j745v8fV66OHrIh5', challengeController.getChallengeCode);
app.get('/code/BFYjSr2yVjCSWdJ6', challengeController.getChallengeCode);
app.get('/code/KhEexAL4159lTcy7', challengeController.getChallengeCode);
app.get('/code/63cU6cf8x13h8pf8', challengeController.getChallengeCode);
app.get('/code/p5HQz3vP98Rd1yD9', challengeController.getChallengeCode);
app.get('/code/W261a4dK6i159yj10', challengeController.getChallengeCode);

/**
 * OAuth authentication routes. (Sign in) Uses YorkU PPY i.e. GOOGLE
 */
//app.get('/auth/google', passport.authenticate('google', { scope: 'profile email'}));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email', hostedDomain: 'yorku.ca' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
//app.use(errorHandler());

app.get('*', function(req, res){
    req.flash('errors', { msg: 'Error 404 - Not Found' });
    return res.redirect('/');
});

// // development error handler
// // will print stacktrace
// if (process.env.DEV === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;

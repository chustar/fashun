/**
 * Module dependencies.
*/
var azure     = require('azure'),
	express   = require('express'),
	http      = require('http'),
	nconf     = require('nconf'),
	passport  = require('passport'),
	path      = require('path');

var	controllers = require('./controllers'),
	users 		= require('./controllers/user');

nconf.env()
    .file({ file: 'config.json'});

var tableName    = nconf.get("TABLE_NAME"),
    partitionKey = nconf.get("PARTITION_KEY"),
    accountName  = nconf.get("STORAGE_NAME"),
    accountKey   = nconf.get("STORAGE_KEY");

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
	app.use(express.cookieParser()); 
	//app.use(express.session({ secret: 'secret' }));
	app.use(express.session({cookie: { path: '/', httpOnly: true, maxAge: null }, secret:'eeuqram'}));

	app.use(passport.initialize());
	app.use(passport.session());

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

var UserModel = require('./models/user');
var userModel = new UserModel(
		azure.createTableService(accountName, accountKey),
		"users",
		partitionKey);

var FashunModel = require('./models/fashun');
var fashunModel = new FashunModel(
		azure.createTableService(accountName, accountKey),
		azure.createBlobService(accountName, accountKey),
		tableName,
		partitionKey);

var FashunController = require('./controllers/fashun');
var fashunController = new FashunController(fashunModel);

var UserController = require('./controllers/user');
var userController = new UserController(fashunModel);


// Setup passport.
var facebookStrategy = require('passport-facebook').Strategy;

passport.use(new facebookStrategy({
		clientID: nconf.get("FB_APP_ID"),
		clientSecret: nconf.get("FB_APP_SECRET"),
		callbackURL: "http://localhost:3000/auth/facebook/callback"
	},
	function(req, accessToken, refreshToken, profile, done) {
		userModel.createUserIfNotExists(profile, done);
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.profileId);
});

passport.deserializeUser(function(profileId, done) {
	userModel.findById(profileId, function(err, user) {
		done(err, user);
	});
});

app.get( '/', 						controllers.index);

//app.get( '/fashuns', 				fashunController.getFashuns.bind(fashunController));
app.get( '/fashuns/popular', 		fashunController.getPopularFashuns.bind(fashunController));
app.get( '/fashuns/add', 		    fashunController.addFashunGet.bind(fashunController));
app.post('/fashuns/add',			fashunController.addFashunPost.bind(fashunController));
app.post('/fashuns/update/:rowkey', fashunController.updateFashun.bind(fashunController));
app.get( '/fashuns/:rowkey',		fashunController.getFashun.bind(fashunController));

app.get('/users/me',				userController.getMe.bind(userController));
app.get('/users/:rowkey',		    userController.getUser.bind(userController));

app.get('/auth/facebook',		   passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', 					function(req, res){ req.logout(); res.redirect('/'); });

app.configure('development', function(){
    app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

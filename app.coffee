# External dependencies.
azure     = require 'azure'
express   = require 'express'
http      = require 'http'
nconf     = require 'nconf'
passport  = require 'passport'
path      = require 'path'

# Internal dependencies.
controllers = require './controllers'
users 		= require './controllers/user'

nconf.env().file({file: 'config.json'})

partitionKey = nconf.get 'PARTITION_KEY'
accountName  = nconf.get 'STORAGE_NAME'
accountKey   = nconf.get 'STORAGE_KEY'

app = express()

app.configure ->
    app.set 'port', process.env.PORT || 3000
    app.set 'views', __dirname + '/views'
    app.set 'view engine', 'jade'
    app.use express.logger('dev')
    app.use express.bodyParser()
    app.use express.methodOverride()
	app.use express.cookieParser()
	#app.use express.session({ secret: 'secret' }));
	app.use express.session({cookie: { path: '/', httpOnly: true, maxAge: null }, secret:'eeuqram'})

	app.use passport.initialize()
	app.use passport.session()

	app.use app.router
	app.use express.static(path.join(__dirname, 'public'))

UserModel = require('./models/user')
userModel = new UserModel(
	azure.createTableService(accountName, accountKey),
    nconf.get('USER_TABLE_NAME'),
	partitionKey
)

FashunModel = require('./models/fashun')
fashunModel = new FashunModel(
	azure.createTableService(accountName, accountKey),
	azure.createBlobService(accountName, accountKey),
	nconf.get('FASHUN_TABLE_NAME'),
	partitionKey
)

TagModel = require('./models/tag')
tagModel = new TagModel(
	azure.createTableService(accountName, accountKey),
	nconf.get('TAG_TABLE_NAME'),
	partitionKey
)

FashunController = require('./controllers/fashun')
fashunController = new FashunController(fashunModel, tagModel)

TagController = require('./controllers/tag')
tagController = new TagController(tagModel)

UserController = require('./controllers/user')
userController = new UserController(fashunModel)


#setup passport.
facebookStrategy = require('passport-facebook').Strategy

passport.use(new facebookStrategy({
		clientID: nconf.get("FB_APP_ID"),
		clientSecret: nconf.get("FB_APP_SECRET"),
		callbackURL: "/auth/facebook/callback"
	},
	(req, accessToken, refreshToken, profile, done) ->
		userModel.createUserIfNotExists(profile, done)
	)
)

passport.serializeUser((user, done) ->
  done(null, user.profileId)
)

passport.deserializeUser((profileId, done) ->
	userModel.findById(profileId, (err, user) ->
		done(err, user)
	)
)

app.get  '/', 						controllers.index

app.get  '/fashuns/popular', 		fashunController.getPopularFashuns.bind(fashunController)
app.get  '/fashuns/add', 		    fashunController.addFashunGet.bind(fashunController)
app.post '/fashuns/add',			fashunController.addFashunPost.bind(fashunController)
app.post '/fashuns/update/:rowkey', fashunController.updateFashun.bind(fashunController)
app.get  '/fashuns/:rowkey',		fashunController.getFashun.bind(fashunController)

app.post '/tags/add',				tagController.addTag.bind(tagController)
app.post '/tags/get/:rowkey',		tagController.getTag.bind(tagController)
app.post '/tags/get/:fashunRowKey',	tagController.getLinkedTags.bind(tagController)

app.get '/users/me',				userController.getMe.bind(userController)
app.get '/users/:rowkey',		    userController.getUser.bind(userController)

app.get '/auth/facebook',		    passport.authenticate('facebook')
app.get '/auth/facebook/callback',  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' })

app.get '/logout', 					(req, res) ->
	req.logout()
	res.redirect('/')

app.configure 'development', -> app.use(express.errorHandler())

http.createServer(app).listen(app.get('port'), -> console.log("Express server listening on port " + app.get('port')))


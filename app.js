/**
 * Module dependencies.
*/
var azure = require('azure'),
    nconf = require('nconf');

nconf.env()
    .file({ file: 'config.json'});

var tableName = nconf.get("TABLE_NAME"),
    partitionKey = nconf.get("PARTITION_KEY"),
    accountName = nconf.get("STORAGE_NAME"),
    accountKey = nconf.get("STORAGE_KEY");

var express = require('express'),
	controllers = require('./controllers'),
	user = require('./controllers/user'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

var FashunController = require('./controllers/fashun');
var FashunModel = require('./models/fashun_model');
var fashunModel = new FashunModel(
		azure.createTableService(accountName, accountKey),
		azure.createBlobService(accountName, accountKey),
		tableName,
		partitionKey);
var fashunController = new FashunController(fashunModel);


//app.get('/', controllers.index);
app.get('/', fashunController.getFashuns.bind(fashunController));
app.get('/fashun/:rowKey', fashunController.getFashun.bind(fashunController));
app.get('/users', controllers.user.list);
app.post('/addfashun', fashunController.addFashun.bind(fashunController));

app.configure('development', function(){
    app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

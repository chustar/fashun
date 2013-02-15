var azure = require('azure'),
	async = require('async');

module.exports = UserController;

function UserController(fashunModel) {
	this.fashunModel = fashunModel;
}

UserController.prototype.getMe = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName).where('userRowKey eq ?', req.user.RowKey);

	self.fashunModel.find(query, function itemsFound(err, fashuns) {
		console.log(fashuns);
		res.render('user', {user: req.user, title: req.user.displayName, fashuns: fashuns});
	});
}

UserController.prototype.getUser = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName).where('RowKey eq ?', req.params.rowkey);

	self.fashunModel.find(query, function itemsFound(err, users) {
	//	res.render('user', {user: req.user, user: users[0]});
	});
}

UserController.prototype.getUsers = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName);

	self.fashunModel.find(query, function itemsFound(err, users) {
		res.render('users', {user: req.user, title: 'Users', users: users});
	});
}

UserController.prototype.getPopularUsers = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName);

	self.fashunModel.find(query, function itemsFound(err, users) {
		res.render('users', {user: req.user, title: 'Popular Users', users: users});
	});
}

UserController.prototype.addUser = function(req,res) {
	var self = this;
	var userObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
	};
	self.fashunModel.addItem(userObj, function itemAdded(err) {
		if(err) throw err;

		res.redirect('/');
	});
}

UserController.prototype.updateUser = function(req,res) {
	var self = this;
	var userObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
	};
	self.fashunModel.addItem(userObj, function itemAdded(err) {
		if(err) throw err;

		res.redirect('/');
	});
}

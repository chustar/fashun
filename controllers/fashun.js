var azure = require('azure'),
	async = require('async');

module.exports = FashunController;

function FashunController(fashunModel) {
	this.fashunModel = fashunModel;
}

FashunController.prototype.getFashun = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName).where('RowKey eq ?', req.params.rowkey);

	self.fashunModel.find(query, function itemsFound(err, fashuns) {
		res.render('fashun', {user: req.user, title: fashuns[0].name, fashun: fashuns[0]});
	});
}

FashunController.prototype.getFashuns = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName);

	self.fashunModel.find(query, function itemsFound(err, fashuns) {
		res.render('fashuns', {user: req.user, title: 'Fashuns', fashuns: fashuns});
	});
}

FashunController.prototype.getPopularFashuns = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName);

	self.fashunModel.find(query, function itemsFound(err, fashuns) {
		res.render('fashuns', {user: req.user, title: 'Popular Fashuns', fashuns: fashuns});
	});
}

FashunController.prototype.addFashunGet = function(req,res) {
	self = this;
	if (!req.user) res.redirect('/');

	res.render('addfashun', {user: req.user, title: 'Add New Fashun'});
}

FashunController.prototype.addFashunPost = function(req,res) {
	var self = this;
	if (!req.user) res.redirect('/');

	var fashunObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
		"userRowKey": req.user.RowKey,
		"userDisplayName": req.user.displayName,
	};
	self.fashunModel.addItem(fashunObj, function itemAdded(err, rowkey) {
		if(err) throw err;

		res.redirect('/fashuns/' + rowkey);
	});
}

FashunController.prototype.updateFashun = function(req,res) {
	var self = this;
	var fashunObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
	};
	self.fashunModel.addItem(fashunObj, function itemAdded(err) {
		if(err) throw err;

		res.redirect('/');
	});
}

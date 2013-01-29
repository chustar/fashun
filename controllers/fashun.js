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
		console.log(fashuns);
		res.render('fashun', {user: req.user, fashun: fashuns[0]});
	});
}

FashunController.prototype.getFashuns = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.fashunModel.tableName);

	self.fashunModel.find(query, function itemsFound(err, fashuns) {
		res.render('fashuns', {user: req.user, title: 'Fashuns', fashuns: fashuns});
	});
}

FashunController.prototype.addFashun = function(req,res) {
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

var azure = require('azure'),
	async = require('async');

module.exports = FashunController;

function FashunController(Fashun) {
	this.Fashun = Fashun;
}

FashunController.prototype.getFashun = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.Fashun.tableName).where('RowKey eq ?', req.params.rowKey);

	self.Fashun.find(query, function itemsFound(err, fashuns) {
		res.render('fashun', {fashun: fashuns[0]});
	});
}

FashunController.prototype.getFashuns = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.Fashun.tableName);

	self.Fashun.find(query, function itemsFound(err, fashuns) {
		res.render('index', {title: 'Fashuns', fashuns: fashuns});
	});
}

FashunController.prototype.addFashun = function(req,res) {
	var self = this;
	var fashunObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
	};
	self.Fashun.addItem(fashunObj, function itemAdded(err) {
		if(err) throw err;

		res.redirect('/');
	});
}

var azure = require('azure'),
	async = require('async');

module.exports = TagController;

function TagController(tagModel) {
	this.tagModel = tagModel;
}

TagController.prototype.getTag = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.tagModel.tableName).where('RowKey eq ?', req.params.rowkey);

	self.tagModel.find(query, function itemsFound(err, tags) {
		res.render('tag', {tag: tags[0]});
	});
}

TagController.prototype.getLinkedTags = function(req, res) {
	self = this;
	var query = azure.TableQuery.select().from(self.tagModel.tableName).where('fashunRowKey eq ?', req.params.fashunRowKey);

	self.tagModel.find(query, function itemsFound(err, tags) {
		res.render('tags', {tags: tags});
	});
}

TagController.prototype.addTag = function(req,res) {
	var self = this;
	if (!req.user) {
		res.writeHead(301);
		res.end();
	} else {
		var tagObj = JSON.parse(req.body.tag);
		tagObj.userDisplayName = req.user.userDisplayName;
		self.tagModel.addItem(tagObj, function itemAdded(err, rowkey) {
			if(err) throw err;
			res.writeHead(200);
			res.end();
		});
	}
}

TagController.prototype.updateTag = function(req,res) {
	var self = this;
	var tagObj = {
		"name": req.body.name,
		"imageName": req.files.image.name,
		"imagePath": req.files.image.path,
	};
	self.tagModel.addItem(tagObj, function itemAdded(err) {
		if(err) throw err;

		res.redirect('/');
	});
}

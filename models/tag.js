var azure = require('azure'),
uuid = require('node-uuid');

module.exports = TagModel;


function TagModel(storageClient, tableName, partitionKey) {
	this.storageClient = storageClient;
	this.tableName = tableName;
	this.partitionKey = partitionKey;


	this.storageClient.createTableIfNotExists(tableName,
		function tableCreated(err) {
			if(err) {
				throw err;
			}
		});
}

TagModel.prototype = {
	find: function(query, callback) {
		self = this;
		self.storageClient.queryEntities(query,
			function entitiesQueried(err, entities){
				if(err) {
					callback(err);
				} else {
					callback(null, self.filter(entities));
				}
			});
	},

	addItem: function(item, callback) {
		self = this;

		item.RowKey = item.guid;
		item.PartitionKey = self.partitionKey;
		self.storageClient.insertEntity(self.tableName, item,
			function entityInserted(error) {
				callback(error, item.RowKey);
			});
	},

	updateItem: function(item, callback) {
		self = this;
		self.storageClient.queryEntity(self.tableName, self.partitionKey, item,
			function entityQueried(err, entity) {
				if(err) {
					callback(err);
				}
				entity.completed = true;
				self.storageClient.updateEntity(self.tableName, entity,
					function entityUpdated(err) {
						if(err) {
							callback(err);
						}
						callback(null);
					});
			});
	},

	filter: function(items) {
		self = this;
		
		var res = [];
		for (var i = 0; i < items.length; i++) {
			res.push({
				startX: items[i].startX,
				startY: items[i].startY,
				endX: items[i].endX,
				endY: items[i].endY,
				text: items[i].text,
				rider: items[i].rider,
				guid: items[i].guid,
				fashunRowKey: items[i].fashunRowKey,
				userDisplayName: items[i].userDisplayName
			});
		}
		return res;
	}
}

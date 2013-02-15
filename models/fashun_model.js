var azure = require('azure'),
uuid = require('node-uuid');

module.exports = FashunModel;


function FashunModel(storageClient, blobService, tableName, partitionKey) {
	this.storageClient = storageClient;
	this.blobService = blobService;
	this.tableName = tableName;
	this.partitionKey = partitionKey;


	this.storageClient.createTableIfNotExists(tableName,
		function tableCreated(err) {
			if(err) {
				throw err;
			}
		});

	this.blobService.createContainerIfNotExists("fashuns",
		{ publicAccessLevel : 'blob' },
		function blobCreated(err) {
			if(err){
				throw err;
			}
		});
}

FashunModel.prototype = {
	find: function(query, callback) {
		self = this;
		self.storageClient.queryEntities(query,
			function entitiesQueried(err, entities){
				if(err) {
					callback(err);
				} else {
					callback(null, entities);
				}
			});
	},

	addItem: function(item, callback) {
		self = this;
		//upload the image to blob store.
		console.log(item);
		this.blobService.createBlockBlobFromFile("fashuns", item.imageName, item.imagePath, function (err, blob) {
			if (err) callback(err);

			item.RowKey = uuid();
			item.PartitionKey = self.partitionKey;
			item.imageURL = self.blobService.getBlobUrl(blob.container, blob.blob).url();
			self.storageClient.insertEntity(self.tableName, item,
				function entityInserted(error) {
					callback(error, item.RowKey);
				});
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
	}
};

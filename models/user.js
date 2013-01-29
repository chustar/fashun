var azure = require('azure'),
uuid = require('node-uuid');

module.exports = UserModel;


function UserModel(storageClient, tableName, partitionKey) {
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

UserModel.prototype = {
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
	
	findById: function(id, callback) {
		self = this;
		var query = azure.TableQuery.select().from(self.tableName).where('id eq ?', id);

		self.find(query, function(err, entities) {
			console.log(entities);
			callback(err, entities[0]);
		});
	},

	createUserIfNotExists: function(profile, done) {
		self = this;
		var query = azure.TableQuery.select().from(self.tableName).where('id eq ?', profile.id);

		self.find(query, function(err, entities) {
			if (err) done(err);
			if (entities.length > 0) {
				done(null, user.RowKey);
			} else {
				var item = {
					'RowKey': uuid(),
					'PartitionKey': self.partitionKey,
					'id': profile.id
				}
				self.storageClient.insertEntity(self.tableName, item,
					function entityInserted(err) {
						debugger;
						if (err) {
							done(err);
						}
						done(null, item);
					});
			}
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

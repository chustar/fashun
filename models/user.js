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
	
	findById: function(profileId, callback) {
		self = this;
		query = azure.TableQuery.select().from(self.tableName).where('profileId eq ?', profileId);
		
		self.find(query, function(err, entities) {
			callback(err, entities[0]);
		});
	},

	createUserIfNotExists: function(profile, done) {
		self = this;
		self.findById(profile.id, function(err, entities) {
			if (err) {
				done(err);
			} else if (entities && entities.length > 0) {
				done(null, entities);
			} else {
				var item = {
					'RowKey'       : uuid(),
					'PartitionKey' : self.partitionKey,
					'profileId'    : profile.id,
					'displayName'  : profile.displayName,
					'profile'	   : profile._raw
				}
				self.storageClient.insertEntity(self.tableName, item, function (err) {
					if (err) {
						done(err);
					} else {
						done(null, item);
					}
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

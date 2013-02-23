azure = require("azure")
uuid  = require("node-uuid")

class UserModel
    constructor: (storageClient, tableName, partitionKey) ->
        @storageClient = storageClient
        @tableName = tableName
        @partitionKey = partitionKey
        @storageClient.createTableIfNotExists tableName, tableCreated = (err) ->
            throw err if err

    find: (query, callback) ->
        @storageClient.queryEntities query, entitiesQueried = (err, entities) ->
            if err
                callback err
            else
                callback null, entities


    findById: (profileId, callback) ->
        query = azure.TableQuery.select().from(@tableName).where("profileId eq ?", profileId)
        @find query, (err, entities) -> callback err, entities[0]


    createUserIfNotExists: (profile, done) ->
        self = this
        @findById profile.id, (err, entities) =>
            if err
                done err
            else if entities and entities.length > 0
                done null, entities
            else
                item =
                    RowKey: uuid()
                    PartitionKey: @partitionKey
                    profileId: profile.id
                    displayName: profile.displayName
                    profile: profile._raw

                @storageClient.insertEntity @tableName, item, (err) ->
                    if err
                        done err
                    else
                        done null, item

    updateItem: (item, callback) ->
        self = this
        @storageClient.updateEntity @tableName, entity, entityUpdated = (err) ->
            if err
                callback err
            else
                callback null

module.exports = UserModel

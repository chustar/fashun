azure = require "azure"
uuid  = require "node-uuid"

class FashunModel
    constructor: (storageClient, blobService, tableName, partitionKey) ->
        @storageClient = storageClient
        @blobService = blobService
        @tableName = tableName
        @partitionKey = partitionKey

        @storageClient.createTableIfNotExists tableName, (err) ->
            throw err if err

        @blobService.createContainerIfNotExists "fashuns",
            publicAccessLevel: "blob", (err) ->
                throw err if err

    find: (query, callback) ->
        @storageClient.queryEntities query, (err, entities) ->
            if err
                callback err
            else
                callback null, entities

    addItem: (item, callback) ->
        #upload the image to blob store.
        @blobService.createBlockBlobFromFile "fashuns", item.imageName, item.imagePath, (err, blob) =>
            if err
                callback err
            else
                item.RowKey = uuid()
                item.PartitionKey = @partitionKey
                item.imageURL = @blobService.getBlobUrl(blob.container, blob.blob).url()
                @storageClient.insertEntity @tableName, item, (err) ->
                    callback err, item.RowKey

    updateItem: (item, callback) ->
        @storageClient.queryEntity @tableName, @partitionKey, item, (err, entity) =>
            if err
                callback err
            else
                entity.completed = true
                @storageClient.updateEntity @tableName, entity, (err) ->
                    if err
                        callback err
                    else
                        callback null

module.exports = FashunModel

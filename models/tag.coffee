azure = require("azure")
uuid = require("node-uuid")

class TagModel
    constructor: (storageClient, tableName, partitionKey) ->
        @storageClient = storageClient
        @tableName = tableName
        @partitionKey = partitionKey

        @storageClient.createTableIfNotExists tableName, tableCreated = (err) ->
            throw err if err

    find: (query, callback) ->
      @storageClient.queryEntities query, entitiesQueried = (err, entities) =>
        if err
          callback err
        else
          callback null, @filter(entities)


    addItem: (item, callback) ->
        item.RowKey = item.guid
        item.PartitionKey = @partitionKey
        @storageClient.insertEntity @tableName, item, (err) ->
            callback err, item.RowKey

    updateItem: (item, callback) ->
      @storageClient.queryEntity @tableName, @partitionKey, item, entityQueried = (err, entity) =>
          callback err  if err
          entity.completed = true
          @storageClient.updateEntity @tableName, entity, (err) =>
              if err
                  callback err
              else
                  callback null

    filter: (items) ->
        res = []
        i = 0

        while i < items.length
            res.push
                startX: items[i].startX
                startY: items[i].startY
                endX: items[i].endX
                endY: items[i].endY
                text: items[i].text
                rider: items[i].rider
                guid: items[i].guid
                fashunRowKey: items[i].fashunRowKey
                userDisplayName: items[i].userDisplayName
            i++
        res

module.exports = TagModel

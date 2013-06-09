azure = require("azure")
async = require("async")

class TagController
    constructor: (tagModel) ->
        @tagModel = tagModel

    getTag: (req, res) ->
        query = azure.TableQuery.select().from(@tagModel.tableName).where("RowKey eq ?", req.params.rowkey)
        @tagModel.find query, (err, tags) ->
            res.render "tag", tag: tags[0]

    getLinkedTags: (req, res) ->
        query = azure.TableQuery.select().from(@tagModel.tableName).where("fashunRowKey eq ?", req.params.fashunRowKey)
        @tagModel.find query, (err, tags) ->
            res.render "tags", tags: tags

    addTag: (req, res) ->
        self = this
        if req.user
            tagObj = JSON.parse(req.body.tag)
            tagObj.userDisplayName = req.user.displayName
            @tagModel.addItem tagObj, (err, rowkey) ->
                throw err if err
                res.writeHead 200
                res.end()
        else
            res.writeHead 301
            res.end()


    updateTag: (req, res) ->
        self = this
        tagObj =
            name: req.body.name
            imageName: req.files.image.name
            imagePath: req.files.image.path

        @tagModel.addItem tagObj, itemAdded = (err) ->
            throw err if err
            res.redirect "/"

    module.exports = TagController

azure = require("azure")
async = require("async")

class FashunController
    constructor: (fashunModel, tagModel) ->
        @fashunModel = fashunModel
        @tagModel = tagModel

    getFashun: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName).where("RowKey eq ?", req.params.rowkey)
        @fashunModel.find query, itemsFound = (err, fashuns) =>
            query = azure.TableQuery.select().from(@tagModel.tableName).where("fashunRowKey eq ?", req.params.rowkey)
            @tagModel.find query, itemsFound = (err, tags) =>
                res.render "fashun",
                    user: req.user
                    title: fashuns[0].name
                    fashun: fashuns[0]
                    tags: tags

    getFashuns: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName)
        @fashunModel.find query, itemsFound = (err, fashuns) ->
            res.render "fashuns",
                user: req.user
                title: "Fashuns"
                fashuns: fashuns

    getPopularFashuns: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName)
        @fashunModel.find query, itemsFound = (err, fashuns) ->
            res.render "fashuns",
                user: req.user
                title: "Popular Fashuns"
                fashuns: fashuns

     addFashun: (req, res) ->
         if req.user
             fashunObj =
                 name: req.body.name
                 imageName: req.files.file.filename
                 imagePath: req.files.file.path
                 userRowKey: req.user.RowKey
                 userDisplayName: req.user.displayName

             @fashunModel.addItem fashunObj, itemAdded = (err, rowkey) ->
                 throw err  if err
                 res.writeHead 200
                 res.write "/fashuns/" + rowkey
                 res.end()
         else
             res.writeHead 301
             res.end()


    updateFashun: (req, res) ->
        fashunObj =
            name: req.body.name
            imageName: req.files.image.name
            imagePath: req.files.image.path

        @fashunModel.addItem fashunObj, itemAdded = (err) ->
            throw err  if err
            res.redirect "/"

module.exports = FashunController

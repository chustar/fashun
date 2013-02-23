azure = require('azure')
async = require('async')

class UserController
    constructor: (fashunModel) ->
        @fashunModel = fashunModel

    getMe: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName).where('userRowKey eq ?', req.user.RowKey)
        @fashunModel.find query, (err, fashuns) ->
            console.log req.user
            res.render 'user',
                user: req.user
                title: req.user.displayName
                fashuns: fashuns

    getUser: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName).where('RowKey eq ?', req.params.rowkey)
        @fashunModel.find query, (err, users) ->
            res.render 'user',
                user: req.user
                title: req.user.displayName
                fashuns: fashuns

    getPopularUsers: (req, res) ->
        query = azure.TableQuery.select().from(@fashunModel.tableName)
        @fashunModel.find query, (err, users) ->
            res.render 'users',
                user: req.user
                title: 'Popular Users'
                users: users

    addUser = (req, res) ->
        userObj =
            name: req.body.name
            imageName: req.files.image.name
            imagePath: req.files.image.path

        @fashunModel.addItem userObj, (err) ->
            throw err if err
            res.redirect '/'

    updateUser = (req, res) ->
        userObj =
            name: req.body.name
            imageName: req.files.image.name
            imagePath: req.files.image.path

        @fashunModel.addItem userObj, (err) ->
            throw err if err
            res.redirect '/'

module.exports = UserController

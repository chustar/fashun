# GET home page

exports.index = (req, res) ->
	res.render 'index',
        user: req.user,
        title: 'fashun',
        index: ''

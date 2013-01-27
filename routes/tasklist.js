var azure = require('azure'),
	async = require('async');


module.exports = TaskList;


function TaskList(task) {
	this.task = task;
}

TaskList.prototype = {
	showTasks: function(req, res) {
		self = this;
		var query = azure.TableQuery
		.select()
		.from(self.task.tableName)
		.where('completed eq ?', 'false');
		self.task.find(query, function itemsFound(err, items) {
			res.render('index',{title: 'My ToDo List ', tasks: items});
		});
	},


	addTask: function(req,res) {
		var self = this;
		var item = req.body.item;
		self.task.addItem(item, function itemAdded(err) {
			if(err) {
				throw err;
			}
			res.redirect('/');
		});
	},


	completeTask: function(req,res) {
		var self = this;
		var completedTasks = Object.keys(req.body);
		async.forEach(completedTasks, function taskIterator(completedTask, callback){
			self.task.updateItem(completedTask, function itemsUpdated(err){
				if(err){
					callback(err);
				} else {
					callback(null);
				}
			});
		}, function(err){
			if(err) {
				throw err;
			} else {
				res.redirect('/');
			}
		});
	}
};
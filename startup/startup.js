if(Meteor.isServer && Tasks.find().count()===0){
	var tasks = [
				{'text': "Profit","isCompleted": true, "isEditing": false, "index":6},
				{'text': "Swipe R to L to delete", "isCompleted": false, "isEditing": false, "index":5},
				{'text': "Swipe L to R to complete", "isCompleted": false, "isEditing": false, "index":4},
				{'text': "Touch and Hold to drag - mobile only","isCompleted": false, "isEditing": false, "index":3},
				{'text': "Touch text to edit - mobile only","isCompleted": false, "isEditing": false, "index":2},
				{'text': "Pull down to add task - mobile only","isCompleted": false, "isEditing": false, "index":1},
				{'text': "Famo.us and Meteor Todo App","isCompleted": false, "isEditing": false, "index":0},
	             ];

	_.each(tasks, function(task){
		Tasks.insert(task);
	});	
}
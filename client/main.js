Meteor.startup(function(){
  var taskList  = Tasks.find({}, {sort: { index: 1 }});
  var Engine = Famous('famous/core/Engine');
  var mainContext = Engine.createContext();
  mainContext.setPerspective(250);
  var taskListView = new TaskListView({
    collection: taskList
  });
  mainContext.add(taskListView);  
});










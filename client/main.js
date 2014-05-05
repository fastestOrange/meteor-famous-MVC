Meteor.startup(function(){
  Meteor.autorun(function(){
    var taskList  = Tasks.find();//.fetch();
    once(taskList);
  });
});

var once = _.once(function(taskList){
        var Engine = Famous('famous/core/Engine');
        
        var mainContext = Engine.createContext();
        
        mainContext.setPerspective(250);
        
        var pageView = new PageView({
            collection: taskList
        });


     
        mainContext.add(pageView);  
        
});







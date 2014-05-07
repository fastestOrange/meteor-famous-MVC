Meteor.startup(function(){
    var taskList  = Tasks.find();

    var Engine = Famous('famous/core/Engine');
    
    var mainContext = Engine.createContext();
    
    mainContext.setPerspective(250);
    
    var pageView = new PageView({
        collection: taskList
    });
    // Deps.autorun(function(){
    //     Tasks.find();
    // });

    mainContext.add(pageView);  
});










Template.index.rendered = function(){
    var Engine = Famous('famous/core/Engine');
    
    var mainContext = Engine.createContext();
    
    mainContext.setPerspective(250);


    if(Meteor.isServer && Tasks.find().count()===0){
        var fixtures = [
            {text: "this is a task", isCompleted: false},
            {text: "drink up johnny", isCompleted: false},
            {text: "be the ball be the ball", isCompleted: false},
            {text: "no man is an island most of the time", isCompleted: false},
            {text: "boogie woogie oogie snoogie", isCompleted: false},
            {text: "front end back end whats the difference", isCompleted: false}
            ];

        console.log("LOL");
                
    } 

    _.each(fixtures, function(item){
        Tasks.insert(item, function(){
            console.log(item);
        });
    });
 

    var pageView = new PageView({

    });
 
    mainContext.add(pageView);  

    Meteor.subscribe('tasks').ready();

    
};




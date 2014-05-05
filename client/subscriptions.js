 Meteor.startup(function(){
      var sub = Meteor.subscribe('tasks');

      if (sub.ready()){
      	console.log('ready now');
      }else{
      	console.log('not ready');
      }
    });

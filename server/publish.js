Meteor.publish('tasks', function () {
  console.log('publish');
  return Tasks.find({});
});



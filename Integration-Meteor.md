#Lessons from using Famo.us-Meteor


##Overview
The document give more attention to some of the key elements of the Famo.us integration with Meteor. This application’s view layer and eventing system is almost entirely in Famo.us. Meteor handles all collection operations.  

###Application Structure
Meteor uses naming conventions for folders like `/server` and `/collections`, all of which are  packaged and loaded at runtime in a predefined order. Developers experienced with Meteor will be familiar with the application structure used here.  All Famo.us code resides in the `/client` folder. In contrast to a pure Meteor application, there is only one short `.html` file with the three small templates. The view layer heavy lifting takes place in the `TaskListView` and `TaskView` JavaScript files. 

The famo.us libraries are located within the `/lib` folder. During development, it proved more practical to use a browserify-ed famo.us library and make the different modules accessible through the Famous variable. Other methods of integration have used the famono  and  famous-components Meteorite packages with success. Thus the standard Famo.us convention of

```
var Surface = require('famous/core/Surface');
```
becomes

```
var Surface = Famous('famous/core/Surface');
``` 

When Meteor irons out their  third-party package system and/or Famo.us provides an easier way to include the library from CDN or otherwise, this issue will evaporate. 

###Meteor Templates with Famo.us Surfaces/Views
It’s important to note that no templates are inserted into the DOM by Meteor. 

In `index.html`:

```
<body>
</body>

<template name="index">
	{{> TaskListView}}
</template>

<template name="TaskListViewView">
	{{> taskView}}
</template>

```

Playing nice with Famo.us means leaving all DOM manipulation or querying to Famo.us. ( To understand more about how the Famo.us render tree works:  http://famo.us/guides/dev/render-tree.html. ) The templates are used to take advantage of Meteor’s reactive data-binding from within the Famo.us surfaces using Zoltan Olah’s extension - `Reactive Surface`. 

In place of static text or html as a value for the `content` property,the data_driven  `data` and `template` are used instead.The template is defined in `index.html` and data is a function which return one from the collection Tasks.  Also, the context is bound to the individual TaskView view in the typical Famo.us pattern with `.bind(this)`. 

In `TaskView`, 

```
function _addText(){
  this.text = new ReactiveSurface({
    template: Template.taskView,
    data: function() {return Tasks.findOne(this.model._id)}.bind(this),
    properties: {
      color: this.model.isCompleted ? this.options.fGrey : 'white',
      fontSize: '16px',
   
      …
    }
  });
```


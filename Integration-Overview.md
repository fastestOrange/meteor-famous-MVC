#Integration Overview
The goal of the following document is to compare and contrast the integration of Famo.us with the following MVC frameworks:
- Angular
- Backbone
- Meteor

##Which to choose? 
For developers who have already learned Famo.us or have a Backbone or Meteor background, Backbone or Meteor could be the best choice. Famo.us view logic integrated with Backbone or Meteor is also easier to reuse in other frameworks (except for Angular). 

Developers coming from an Angular background who have not learned Famo.us may find Ang.us the easiest because it allows for the view to be defined declaratively. The other frameworks require the use of Famo.us's render tree structure instead, which is more difficult to internalize, especially with larger apps. The challenge of using Famo.us with Angular is that it requires learning a wrapper library.

Overall, if the team/project does not necessitate a particular MVC framework, it's recommended that an experienced Angular developer look at Ang.us first, and that others look at Backbone and Meteor first. 

##Backbone
Backbone is very easy to integrate with Famo.us. The general guideline is to replace all Backbone view logic with Famo.us logic. 

#Meteor
The integration is the tightest of the three. Reactive surfaces means that Meteor templates provide the data for the view layer with Famo.us controlling all layout, event handling and animation.

##Angular
Angular is more difficult because it requires learning a wrapper library called Ang.us. A good starting point is internalizing that Famo.us render nodes and css properties are encapsulated in directives, and that Famo.us logic can be used inside controllers.

Ang.us is in alpha, so it's a great opportunity to shape the library as well. Like any new library, make sure to be aware of the latest changes to ensure code compatibility. 


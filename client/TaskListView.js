
var Engine = Famous('famous/core/Engine');
var View = Famous('famous/core/View');
var Surface = Famous('famous/core/Surface');
var InputSurface = Famous('famous/surfaces/InputSurface');
var Transform = Famous('famous/core/Transform');
var StateModifier = Famous('famous/modifiers/StateModifier');
var Modifier = Famous('famous/core/Modifier');
var HeaderFooterLayout = Famous('famous/views/HeaderFooterLayout');
var Utility = Famous('famous/utilities/Utility');
var ScrollView = Famous('famous/views/Scrollview');
var RenderNode = Famous('famous/core/RenderNode');
var Transitionable = Famous('famous/transitions/Transitionable');
var EventHandler = Famous('famous/core/EventHandler');
var EventMapper = Famous('famous/events/EventMapper');
var EventFilter = Famous('famous/events/EventFilter');

TaskListView = function(){
  var args = [].slice.call(arguments, 1);
  View.apply(this, arguments);
  this.cursor = this.options.collection;
  _addLayout.call(this);
  _addContent.call(this);
  _addHeader.call(this);
  _addFooter.call(this);
  _addBlankTask.call(this);
  _addEventListeners.call(this);
  _handleCompleteButton.call(this);
  _addCollectionEvents.call(this);
  _observeCursor.call(this);
}

TaskListView.DEFAULT_OPTIONS = {
  headerFooterZ: 0,
  scrollViewZ: -1,
  blankTaskZ: -2,
  taskHeight: 50,
  headerSize: 34,
  footerSize: 50,
  fRed: '#FA5C4F',
  fGrey: '#878785',
  fDarkGrey: '#404040',
  fLighGrey: '#F0EEE9',
  fWhite: '#FFFFFF',
  fGreen: '#259959',
  fonts: '"Avenir Next W01 Light", Helvetica, sans-serif'
};
	     
TaskListView.prototype = Object.create(View.prototype);
TaskListView.prototype.constructor = TaskListView;

TaskListView.prototype.reIndex = function (argument) {
  for(var i = 0; i < this.taskNodes.getLength(); i++){
    var view = this.taskNodes.getViewAt(i)
    view.setIndex(i);
    view.setLength(this.taskNodes.getLength());
  }
};

function _observeCursor(){
  var updated = new EventHandler();
  var added = false;
  this.cursor.observe({
	  addedAt: function(document, atIndex, before) {	
	    if(document.index > this.taskNodes.getLength()){
	      document.index = this.taskNodes.getLength();
	      Tasks.update({_id: document._id}, document);
	    }
		var task = new TaskView({
	      model: document,
	      animIndex: 0,
	      updateHandler: updated,
	      messages: this.taskMessages
	    });

	    this.taskNodes.splice(document.index, 0, task);
		task._eventOutput.pipe(this._eventInput);
	    this.reIndex();
	    added = true;

	    setTimeout(function(){
	      added = false;
	    }, 2000);
	    }.bind(this),

	  changedAt: function(newDocument, oldDocument, atIndex) {
	    if((newDocument.isCompleted && !oldDocument.isCompleted) || (!newDocument.isCompleted && oldDocument.isCompleted)){
	  		updated.emit('done', newDocument, oldDocument, atIndex);
	    }
	    if(!newDocument.isEditing && oldDocument.isEditing){
	  		updated.emit('btnStartEdit', newDocument, oldDocument, atIndex);
	    }
	  }.bind(this),

	  removedAt: function(oldDocument, atIndex) {	
	    this.taskNodes.removeElement(oldDocument.index, {duration: 300, curve: 'easeIn'}, function () {
	      for(var i = atIndex; i < this.taskNodes.getLength(); i++){
		    this.taskNodes.getViewAt(i).setIndex(i);
		  }
	    }.bind(this));
	  }.bind(this),

	  movedTo: function(document, fromIndex, toIndex, before) {
	    if(added){
	      return;
	    }
		if(this.taskNodes.getViewAt(toIndex).model._id!== document._id && this.taskNodes.getViewAt(fromIndex).model._id===document._id){
		  this.taskNodes.moveFromAtoB(fromIndex, toIndex, {duration: 500, curve: "easeIn"});
		}
	  }.bind(this)
  });
}
	  
function _addLayout(){
  this.layout = new HeaderFooterLayout({
    headerSize: this.options.headerSize,
    footerSize: this.options.footerSize
  });
  this.add(this.layout)
}


function _addHeader(){
  this.layout.header.add(new StateModifier({
    transform: Transform.translate(0,0, this.options.headerFooterZ)
  })).add(new Surface({
    properties: {
      backgroundColor: commonVars.fDarkGrey,
      textAlign: 'center'
   }
  }));

  this.hText = new Surface({
    content: 'My Tasks',
      size: [undefined,20],
      properties: {
         textAlign: 'center',
         color: 'white',
         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
         fontWeight: '200',
         fontSize: '16px'
      }
  });

  this.layout.header.add(new StateModifier({
    origin: [0.5,0.5],
	transform: Transform.translate(0,0, this.options.headerFooterZ)
  })).add(this.hText);
}

function _addFooter(){
  this.layout.footer.add(new StateModifier({
    origin: [0.5,0.5],
	transform: Transform.translate(0,0, this.options.headerFooterZ)
  })).add(new Surface({
    properties: {
	  backgroundColor: this.options.fDarkGrey,
	  textAlign: 'center'
	}
  }));

  this.textInput = new InputSurface({
    size: [window.innerWidth - 20, 30],
    properties: {
      textAlign: 'center',
      color: this.options.fDarkGrey,
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontWeight: '200',
      fontSize: '20px',
      outline: 'none',
      backgroundColor: this.options.fLightGrey,
      background: this.options.fLightGrey,
      border: '0'
    }
  });

  this.layout.footer.add(new StateModifier({
    origin: [0.5,0.5],
    transform: Transform.translate(0,0, this.options.headerFooterZ)
  })).add(this.textInput);

  this.textInput.on('keyup', function(event){
    var taskNodesLength = this.taskNodes.getLength();
    if(event.keyCode === 13 && this.textInput._currTarget.value.trim() !== ''){
      Tasks.insert({
        text: this.textInput._currTarget.value.trim(),
        isCompleted: false,
        isEditing: false,
        index: taskNodesLength
      });
      this.textInput._currTarget.value = '';
    }
  }.bind(this));

  this.textInput.on('blur', function(event){
    if(this.textInput._currTarget.value.trim() !== ''){
      Tasks.insert({
        text: this.textInput._currTarget.value.trim(),
        isCompleted: false,
        isEditing: false,
        index: taskNodesLength
      });

      this.textInput._currTarget.value = '';
    }
  }.bind(this));
}

function _addBlankTask(){
  var blankTask = new View({
    size: [undefined,this.options.taskHeight],
    origin: [0.5, 0]
  });
  var blankSurface = new Surface({
    size: [undefined,this.options.taskHeight],
    origin: [0.5, 0],
    properties: {
      boxShadow: '0 1px 0px rgba(255,255,255,0.1) inset, 0 -1px 0px rgba(0,0,0,0.1) inset',
      backgroundColor: this.options.fRed
    }
  });
  var blankModUp = new StateModifier({
    origin: [0.5, 0],
    size: [undefined, this.options.taskHeight],
    transform: Transform.translate(0, -16, -0.01)
  });
  var blankTransform = new Modifier({
    origin: [0.5, 0],
    size: [undefined, this.options.taskHeight]
  });
  var blankRotation = new Modifier({
    origin: [0.5, 1]
  });

  //todo - can't get this to work
  blankTransform.transformFrom(function(){
    var x = this.scrollView.getPosition();
    if(x >= 0){
      return Transform.translate(0, 0, 0);
    }
    return Transform.translate(0, -x, 0);
  }.bind(this));

  blankTransform.opacityFrom(function(){
    var x = this.scrollView.getPosition();
    if(x >= 0){
      return 0.00001;
    }
    if( x < -51){
      return 1;// * this.isTouching;
    }
    return Math.max(0.75, -x/this.options.taskHeight);// * this.isTouching;
  }.bind(this));

  blankRotation.transformFrom(function(){
    var x = this.scrollView.getPosition();
    if(x >= 0){
      return Transform.rotateX(Math.PI/2);
    }
    if(x < -this.options.taskHeight){
      return Transform.rotateX(0);
    }
    return Transform.rotateX(Math.PI/2 - ((Math.PI/2) * (-x/this.options.taskHeight)));
  }.bind(this));

  this.add(blankTransform).add(blankModUp).add(blankTask);
  blankTask.add(blankRotation).add(blankSurface);
}

function _addCollectionEvents(){
  this._startEdit = function(model){
    var firstVisibleIndex = this.scrollView._node.index;
	var scrollTop = Math.min(0, this.scrollView.getPosition());
	var index;
    var taskNodesLength = this.taskNodes.getLength();
    for (var i = 0; i < taskNodesLength; i++) {
	  var view = this.taskNodes.getViewAt(i); 
	  if(view.model._id !== model._id){
	     view.fadeOut();
	  }else {
	     index=i;
	  }
  }
  this.scrollMod.setTransform(
    Transform.translate(0, (index - firstVisibleIndex) * -this.options.taskHeight + scrollTop, 0), 
    {duration: 300, curve: 'easeIn'})
  }.bind(this);

  this._endEdit = function(){
    var node = this.taskNodes;
	var taskNodesLength = this.taskNodes.getLength();
    for (var i = 0; i < taskNodesLength; i++) {
	   this.taskNodes.getViewAt(i).fadeIn();
	}
    this.scrollMod.setTransform(
	  Transform.translate(0, 0, 0),
	    {duration: 300, curve: 'easeOut'}
	  )
	}.bind(this);

	this._moveUp = function(model){
	  var index = model.index;
      var tempViewSequence = this.taskNodes;
      if(index > 0){
	    for (var i = 0; i < index; i++) {
	      tempViewSequence = tempViewSequence.getNext();
	     }
	     tempViewSequence.moveUp(index-1, {duration: 200, curve:'easeIn'});
	        this.reIndex();
	    }
     }.bind(this);


	this._moveDown = function(model){
	  var index = model.index;
      var tempViewSequence = this.taskNodes;
      if(index < this.taskNodes.getLength()-1){
	     for (var i = 0; i < index; i++) {
	       tempViewSequence = tempViewSequence.getNext();
	     }
	     tempViewSequence.moveDown(index+1, {duration: 200, curve:'easeIn'});
	     this.reIndex();
	  }
    }.bind(this);

	this._moveToBottom = function(model){
      var index = model.index;
      this.taskNodes.moveToBottom(index, {duration: 200, curve:'easeIn'}, function () {
    	this.reIndex();
    }.bind(this));
}.bind(this);

	this.taskMessages.on('startEdit', this._startEdit);
	this.taskMessages.on('endEdit', this._endEdit);
	this.taskMessages.on('moveToBottom', this._moveToBottom);
	this.taskMessages.on('moveUp', this._moveUp);
	this.taskMessages.on('moveDown', this._moveDown);
}
	   

function _addEventListeners(){
  this.smarterEvents = new EventHandler();
  this._eventInput.on('touchstart', function(evt){
    this.smarterEvents.emit('touchstart', evt);
    var startTouches = Array.prototype.map.call(evt.touches, function(touch){return {pageX : touch.pageX, pageY: touch.pageY};});
  
    var moveHandler = function (evtM){
      evtM.starter = startTouches
      this.smarterEvents.emit('touchmove', evtM);
    }.bind(this);

    var endHandler = function (evtM){
      evtM.starter = startTouches
      this.smarterEvents.emit('touchend', evtM);
      this._eventInput.removeListener('touchmove', moveHandler);
      this._eventInput.removeListener('touchend', endHandler);
    }.bind(this);

    this._eventInput.on('touchmove', moveHandler);
    this._eventInput.on('touchend', endHandler);
  }.bind(this))

  var scrollFilter = new EventFilter(function(type, data){
    if(type === 'touchmove'){
      this.showBlank = true;
	  return data.touches.length === 1;
    }else {
      if(type === 'touchend'){
        var scrollPos = this.scrollView.getPosition();
	    if(scrollPos < -50){
	      Tasks.insert({
	        text: 'New Task',
	        isCompleted: false,
	        isEditing: false,
	        index: 0
	      });
	    this.scrollView.setPosition(scrollPos + 50);
	    this.showBlank = false;
	   }
     }
	 return true;
    }
   }.bind(this));

  this.smarterEvents.pipe(scrollFilter).pipe(this.scrollView);

  var engineFilter = new EventFilter(function(type, data){
    return type !== 'touchstart' &&
	  type !== 'touchmove'  &&
	  type !== 'touchend'   &&
	  type !== 'mousedown'  &&
	  type !== 'mousemove'  &&
	  type !== 'mouseup';
	});

	Engine.pipe(engineFilter).pipe(this.scrollView);
}

function _addContent(){
  this.taskMessages = new EventHandler();
  this.scrollView = new ScrollView({
    direction : Utility.Direction.Y
  });
  this.transitionable = new Transitionable(0);
  this.taskNodes = new DraggableViewSequence();
  this.taskNodes.bootstrap();
  this.scrollView.sequenceFrom(this.taskNodes);
  this.scrollMod = new Modifier();
  this.layout.content.add(this.scrollMod).add(this.scrollView);
  this.scrollView._eventInput.on('touchstart', function(){
    this.isTouching = true;
  }.bind(this));
  this.scrollView._eventInput.on('touchend', function(){
	this.isTouching = false;
  }.bind(this));
}

function _handleCompleteButton(){
	var that = this;
    Template.button.events({
      'click .done': function(){
    	 that.taskNodes.getViewAt(this.index).completeTask();
      }
    });

    Template.button.events({
      'click .delete': function(){
    	 that.taskNodes.getViewAt(this.index).deleteTask();
      }
    });

   Template.button.events({
    'click .edit': function(){
    	that.taskNodes.getViewAt(this.index).startEdit();
    }
  });   
}




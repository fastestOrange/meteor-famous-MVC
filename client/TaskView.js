var Engine = Famous('famous/core/Engine');
var View = Famous('famous/core/View');
var Context = Famous('famous/core/Context');
var Surface = Famous('famous/core/Surface');
var Transform = Famous('famous/core/Transform');
var Modifier = Famous('famous/core/Modifier');
var StateModifier = Famous('famous/modifiers/StateModifier');
var RenderNode = Famous('famous/core/RenderNode');
var Draggable = Famous('famous/modifiers/Draggable');
var Easing = Famous('famous/transitions/Easing');
var ImageSurface = Famous('famous/surfaces/ImageSurface');
var InputSurface = Famous('famous/surfaces/InputSurface');
var Transitionable = Famous('famous/transitions/Transitionable');
var SpringTransition = Famous('famous/transitions/SpringTransition');
var TouchSync = Famous('famous/inputs/TouchSync');
var EventFilter = Famous('famous/events/EventFilter');


Transitionable.registerMethod('spring', SpringTransition);

TaskView = function TaskView() {
  View.apply(this, arguments);
  this.model = this.options.model;
  if(this.options.animIndex !== undefined){
    this.transitionable = new Transitionable(window.innerWidth*1.2);
    this.transitionable.set(window.innerWidth*1.1, {duration: (this.options.animIndex * 50), curve: 'linear'});
    this.transitionable.set(0, {duration: 1700, curve: Easing.outElastic});
  } else {
    this.transitionable = new Transitionable(0);
  }
  this.horizontalTrans = new Transitionable(0);
  this.verticalTrans = new Transitionable(0);
  this.scaleTrans = new Transitionable(1);
  this.showIcons = false;
  this.disabled = false;
  _createNode.call(this);
  _createBackground.call(this);
  _addInput.call(this);
  _addText.call(this);
  _addEventHandlers.call(this);
  _addIcons.call(this);
}


TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.prototype.setIndex = function (index) {
  this.model.index = index;
  Tasks.update({_id : this.model._id}, this.model);
};

TaskView.prototype.setLength = function (len) {
  this.totalLength = len;
};

TaskView.prototype.makeRed = function(){
  this.background.setProperties({backgroundColor: this.options.fRed, boxShadow: this.options.boxShadow});
  this.text.setProperties({color: this.options.fWhite});
  this.backMod.setOpacity(1);
};

TaskView.prototype.makeGreen = function(){
  this.background.setProperties({backgroundColor: this.options.fGreen, boxShadow: this.options.boxShadow});
  this.text.setProperties({color: this.options.fWhite});
  this.backMod.setOpacity(1);
};

TaskView.prototype.makeBlack = function(){ 
  this.background.setProperties({ boxShadow: 'none' });
  this.backMod.setOpacity(0.0001, {period: 100, curve: 'easeOut'});
  this.text.setProperties({color: this.options.fGrey});
};

TaskView.prototype.deleteTask = function(id){
  this.horizontalTrans.set(-window.innerWidth*1.3, {method: 'spring', period: 400, dampingRatio: 0.8}, function(){
    Tasks.remove({_id: this.model._id});
  }.bind(this));
}

TaskView.prototype.completeTask = function(){
  this.horizontalTrans.set(0, {method: 'spring', period: 100, dampingRatio: 0.9}, function(){
    this.model.isCompleted = !this.model.isCompleted;
      Tasks.update({_id: this.model._id}, this.model);
      if(this.model.isCompleted){
        this.options.messages.emit('moveToBottom', this.model);
      }
  }.bind(this));
}

TaskView.prototype.startEdit = function(){
  if(this.disabled){
    this.options.messages.emit('endEdit');
    return;
  }else {
    if(!!this.input && !!this.input._currTarget) {
        this.input._currTarget.disabled = false;
    }
    this.editing = true;
    this.options.messages.emit('startEdit', this.model);
    this.input.setValue(this.model.text);
    this.inputModifier.setTransform(
      Transform.translate(0,0,2)
    );
    this.textModifier.setOpacity(0, {duration: 500, curve: 'linear'});
    this.inputModifier.setOpacity(1, {duration: 500, curve: 'linear'}, function(){
      this.input.focus();
    }.bind(this));
  }
};

TaskView.prototype.endEdit = function(){
  this.input.blur();
  if(this.input._currTarget!==null){
    this.input._currTarget.disabled = true;
  }
  this.inputModifier.setOpacity(0, {duration: 500, curve: 'linear'}, function(){
    this.inputModifier.setTransform(
      Transform.translate(0,0,-100)
    );
  }.bind(this));
  this.textModifier.setOpacity(1, {duration: 500, curve: 'linear'}, function(){
     if(this.editing){
       this.options.messages.emit('endEdit', this.model);
       this.editing = false
     }
     if(this.model.text.trim()===''){
       setTimeout(function(){
        this.deleteTask();
       }.bind(this), 200);
     }
  }.bind(this));
}

TaskView.prototype.fadeOut = function(){
  this.disabled = true;
  if(this.input.disabled){
    this.input._currTarget.disabled = true;
  }
  this.input.blur();
  this.mod.setOpacity(0.2, {duration: 500, curve: 'linear'});
}

TaskView.prototype.fadeIn = function(){
   this.input.blur();
   this.mod.setOpacity(0.9999, {duration: 500, curve: 'linear'});
   this.editing = false;
   this.inputModifier.setOpacity(0, {duration: 500, curve: 'linear'}, function(){
     this.inputModifier.setTransform(
       Transform.translate(0,0,-100)
     );
     this.disabled = false;
     if(!!this.input && !!this.input._currTarget) {
       this.input._currTarget.disabled = false;
     }
   }.bind(this));
   this.textModifier.setOpacity(1, {duration: 500, curve: 'linear'});
}

TaskView.prototype.moveUp = function(){
  this.options.messages.emit('moveUp', this.model);
}

TaskView.prototype.moveDown = function(){
  this.options.messages.emit('moveDown', this.model);
}


TaskView.DEFAULT_OPTIONS = {
  iconSize: [25,25],
  taskHeight: 50,
  iconSpace: 45,
  boxShadow: '0 1px 0px rgba(255,255,255,0.1) inset, 0 -1px 0px rgba(0,0,0,0.1) inset',
  zTranslation: -1,
  fRed: '#FA5C4F',
  fGrey: '#878785',
  fDarkGrey: '#404040',
  fLighGrey: '#F0EEE9',
  fWhite: '#FFFFFF',
  fGreen: '#259959',
  fonts: '"Avenir Next W01 Light", Helvetica, sans-serif'
};

function _createNode(){
  this.mod = new Modifier({size: [undefined, this.options.taskHeight]});
  this.mod.transformFrom(function(){
    var x = this.horizontalTrans.get();
    var y = this.verticalTrans.get();
    var z = y === 0 ? 0 : 0.9999;
    return Transform.translate(x, y, z);
  }.bind(this));

  this.mod2 = new Modifier({size: [undefined, this.options.taskHeight]});
  this.mod2.transformFrom(function(){
    var x = this.scaleTrans.get();
    return Transform.scale(x, x);
  }.bind(this));

  this.node = this.add(this.mod).add(this.mod2);
}

function _createBackground(){
  this.background = new Surface({
    properties: {
      backgroundColor: this.options.fRed,
      boxShadow: this.options.boxShadow
    }
  });
  this.backMod = new StateModifier({transform: Transform.behind});
  this.node.add(this.backMod).add(this.background);
  if(this.model.isCompleted){
    this.backMod.setOpacity(0.0001);
  }
}

function _addInput(){
  this.input = new InputSurface({
    value: (this.model.text || ''),
    placeholder: 'Add a new task',
    classes: ['task'],
    properties: {
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      fontFamily: this.options.fonts,
      textAlign: 'left',
      //match up text of input surface and text surface
      padding: '15px 15px 16px'
    }
  });
  _setInputProps.call(this);
  this.inputModifier = new Modifier({
    origin: [.5, .5],
    opacity: 0,
    transform: Transform.translate(0, 0, -100)
  });
  this.node
    .add(this.inputModifier)
    .add(this.input);
  this.input.on('blur', this.endEdit.bind(this));
  this.input.on('keyup', function(evt){
    if(evt.keyCode === 13){
      this.endEdit();
    }else{
      Tasks.update(this.model._id, {$set: {text: this.input.getValue().trim()}});
    }
  }.bind(this));

  this.options.updateHandler.on('done', function(newDocument, oldDocument, atIndex){
    if(this.model._id!==newDocument._id){
      return;
    }
    this.model = newDocument;
    this.text.setContent(this.model.text);
    if(this.model.isCompleted){
      this.makeBlack();
    }else{
      this.makeRed();
    }
  }.bind(this));
}

function _setInputProps(){
  if(this.model.text.length > window.innerWidth/8){
    this.input.setProperties({fontSize: '12px'});
    this.input.setProperties({padding: '12px 15px 16px'});
  }else{
    this.input.setProperties({fontSize: '16px'});
    this.input.setProperties({padding: '15px 15px 16px'});
  }
}

function _addText(){
  this.text = new ReactiveSurface({
    template: Template.taskView,
    data: function() {return Tasks.findOne(this.model._id)}.bind(this),
    properties: {
      color: this.model.isCompleted ? this.options.fGrey : 'white',
      fontSize: '16px',
      fontWeight: '500',
      fontFamily: this.options.fonts,
      textAlign: 'left',
      padding: '15px'
    }
  });

  this.textModifier = new StateModifier({
    origin: [.5, .5],
  });

  this.node
    .add(this.textModifier)
    .add(this.text);
  this.scroll = true;
  var touchFilter = new EventFilter(function(type, data){
    return this.scroll;
  }.bind(this));
  this.text.pipe(touchFilter).pipe(this._eventOutput);
}

function _addEventHandlers(){
  this.text.on('touchstart', function(evt){
    var touch = evt.targetTouches[0];
    var startX = touch.clientX;
    var startY = touch.clientY;
    var startTransX = this.horizontalTrans.get();
    var startTransY = 0;
    var completedVal = this.model.isCompleted;
    var shouldTest = true;
    var isMoving = false;
    var isDragging = false;
    var crossedFive = false;
    var end = false;
    var singleTouch = evt.touches.length === 1;
    var startTime = Date.now().valueOf();
    setTimeout(function (argument) {
      if(!crossedFive && !end){
        isMoving = true;
        isDragging = true;
        shouldTest = false;
        this.showIcons = false;
        this.scroll = false;
        this.scaleTrans.set(1.15, {duration: 300, curve: 'easeIn'});
        this._eventOutput.emit('touchend', evt);
      }
    }.bind(this), 500);
    this.showIcons = true;

    var moveHandler = function (evtM){
    var mTouch = evtM.targetTouches[0];
    var currentX = mTouch.clientX;
    var currentY = mTouch.clientY;
    var curTransX = startTransX + currentX - startX;
    var curTransY = startTransY + currentY - startY;
      if(!isMoving && Date.now().valueOf() - startTime > 500 && !isDragging){
        isMoving = true;
        isDragging = true;
        shouldTest = false;
        this.showIcons = false;
        this.scroll = false;
        this.scaleTrans.set(1.15, {duration: 300, curve: 'easeIn'});
        this._eventOutput.emit('touchend', evtM);
      }
      if(Math.abs(currentY - startY) > 5 && shouldTest){
        this.horizontalTrans.set(0);
        this.text.removeListener('touchmove', moveHandler);
        this.text.removeListener('touchend', endHandler);
        this.showIcons = false;
        isMoving = true;
        crossedFive = true;
            return;
      }
      if(Math.abs(currentX - startX) > 5){
        this._eventOutput.emit('touchend', evtM);
        this.scroll = false;
        isMoving = true;
        shouldTest = false;
        crossedFive = true;
      }
      if(!isDragging){
        if(curTransX > window.innerWidth/3){
          if(completedVal){
            this.makeRed();
          } else {
            this.makeGreen();
          }
          this.horizontalTrans.set(window.innerWidth/3 + (curTransX - window.innerWidth/3)/5, 0);
        } else {
          if(curTransX < -window.innerWidth/3){
            this.horizontalTrans.set(-(window.innerWidth/3 + (-curTransX - window.innerWidth/3)/5), 0);
          } else {
            this.horizontalTrans.set(curTransX, 0);
          }
          if(!completedVal){
            this.makeRed();
          } else {
            this.makeBlack();
          }
        }
      }else{
        if(curTransY - startTransY > 25 && 
          this.model.index < this.totalLength - 1){
          this.moveDown();
          startY += 50;
          curTransY = startTransY + currentY - startY;
        }else if(curTransY - startTransY < -25 && 
          this.model.index > 0){
          this.moveUp();
          startY -= 50;
          curTransY = startTransY + currentY - startY;
        }
          this.horizontalTrans.set(curTransX, 0);
          this.verticalTrans.set(curTransY, 0);
      }
    }.bind(this);

    var endHandler = function (evtE){
      end = true;
      var endPos = this.horizontalTrans.get();
      this.text.removeListener('touchmove', moveHandler);
      this.text.removeListener('touchend', endHandler);
      if(!isMoving && Date.now().valueOf() - startTime < 500){
        this.startEdit();
      }
      if(!isDragging){
        if(endPos < -window.innerWidth/3){
          this.deleteTask();
        } else {
          if(endPos > window.innerWidth/3){
          this.completeTask();
          } else {
            this.horizontalTrans.set(0, {method: 'spring', period: 300, dampingRatio: 0.9});
          }
        }
      } else {
        this.horizontalTrans.set(0, {duration: 300, curve: 'easeIn'});
        this.verticalTrans.set(0, {duration: 300, curve: 'easeIn'});
        this.scaleTrans.set(1, {duration: 300, curve: 'easeIn'});
      }
      this.scroll = true;
      this._eventOutput.emit('touchend', evtE);
    }.bind(this);

      this.text.on('touchmove', moveHandler);
      this.text.on('touchend', endHandler);
  }.bind(this));
}

  
function _addIcons(){
    _addDeleteIcon.call(this);
    _addCompleteIcon.call(this);
}

function _addDeleteIcon(){
    var deleteTaskMod = new Modifier({origin: [1, 0.5], size: this.options.iconSize});
    deleteTaskMod.transformFrom(function(){
      var x = this.horizontalTrans.get();
      var y = this.verticalTrans.get();
      if(x > -this.options.iconSpace && x < 0) { return Transform.translate( -x - 10, 0, -1); }
      return Transform.translate( this.options.iconSpace - 10, y, -1);
    }.bind(this));
    deleteTaskMod.opacityFrom(function(){
      var x = this.horizontalTrans.get();
      if(x > 0 || !this.showIcons) {
        return 0;
      }
      return Math.min(1, (-x/(window.innerWidth/6)));
    }.bind(this));
    var deleteTaskIcon = new ImageSurface({
        content: 'close-round.svg'
    });
    this.node.add(deleteTaskMod).add(deleteTaskIcon);
}

function _addCompleteIcon(){
    //this.node already has a modifier on it
    var completeTaskMod = new Modifier({origin: [0, 0.5], size: this.options.iconSize});
    completeTaskMod.transformFrom(function(){
      var x = this.horizontalTrans.get();
      var y = this.verticalTrans.get();
      if(x < this.options.iconSpace && x >= 0) { return Transform.translate( -x + 10 , 0, -1); }
      return Transform.translate( -this.options.iconSpace + 10, y, -1);
    }.bind(this));
    completeTaskMod.opacityFrom(function(){
      var x = this.horizontalTrans.get();
      if(x < 0 || !this.showIcons) {
        return 0;
      }
      return Math.min(1, (x/(window.innerWidth/6)));
    }.bind(this));
    var completeTaskIcon = new ImageSurface({
        content: 'checkmark-round.svg'
    });
    this.node.add(completeTaskMod).add(completeTaskIcon);
}





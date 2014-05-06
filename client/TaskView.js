  var PI = Math.PI;
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


  var Transitionable = Famous('famous/transitions/Transitionable');
  var SpringTransition = Famous('famous/transitions/SpringTransition');
  var TouchSync = Famous('famous/inputs/TouchSync');
  var EventFilter = Famous('famous/events/EventFilter');

  var commonVars = {
      fRed: '#FA5C4F',
      fGrey: '#878785',
      fDarkGrey: '#404040',
      fLighGrey: '#F0EEE9',
      fWhite: '#FFFFFF',
      fGreen: '#259959',
      fonts: '"Avenir Next W01 Light", Helvetica, sans-serif'
    };

  Transitionable.registerMethod('spring', SpringTransition);

  /*
   * @name TaskView
   * @constructor
   * @description
   */
   TaskView = function TaskView() {
     View.apply(this, arguments);
     this.model = this.options.model;
     if(this.options.animIndex !== undefined){
       this.transitionable = new Transitionable(window.innerWidth*1.2);
       // Timer
       this.transitionable.set(window.innerWidth*1.1, {duration: (this.options.animIndex * 50), curve: 'linear'});
       this.transitionable.set(0, {duration: 1700, curve: Easing.outElastic});
     } else {
       this.transitionable = new Transitionable(0);
     }

     this.isTouching = 0;
     this.mod = new Modifier({size: [undefined, this.options.taskHeight]});
     this.mod.transformFrom(function(){
       var x = this.transitionable.get();
       return Transform.translate(x, 0, 0);
     }.bind(this));

     this.node = this.add(this.mod);
     _addIcons.call(this);
     _createBackground.call(this);

     if(this.model) {
       _addText.call(this);
       _addEventHandlers.call(this);
     }
   }


  TaskView.prototype = Object.create(View.prototype);
  TaskView.prototype.constructor = TaskView;

 TaskView.prototype.makeRed = function(){
    this.background.setProperties({backgroundColor: commonVars.fRed, boxShadow: this.options.boxShadow});
    this.text.setProperties({color: commonVars.fWhite});
    this.backMod.setOpacity(1);
  };

  TaskView.prototype.makeGreen = function(){
    //make a new surface of green.
    this.background.setProperties({backgroundColor: commonVars.fGreen, boxShadow: this.options.boxShadow});
    this.text.setProperties({color: commonVars.fWhite});
    this.backMod.setOpacity(1);
  };

  TaskView.prototype.makeBlack = function(){
    this.background.setProperties({ boxShadow: 'none' });
    this.backMod.setOpacity(0, {period: 100, curve: 'easeOut'});
    this.text.setProperties({color: commonVars.fGrey});
  };

  TaskView.prototype.deleteTask = function(id){
    this.transitionable.set(-window.innerWidth*1.3, {method: 'spring', period: 400, dampingRatio: 0.8}, function(){
      this.mod.setSize([,0.00001], {duration:250, curve:'easeIn'}, function(){
        Tasks.remove({_id: this.model._id});
      }.bind(this));
    }.bind(this));
  }

  TaskView.prototype.completeTask = function(){
    this.transitionable.set(0, {method: 'spring', period: 100, dampingRatio: 0.9}, function(){
      Tasks.update(this.model._id, {$set: {isCompleted: false}});
    }.bind(this));
  }

  TaskView.DEFAULT_OPTIONS = {
    iconSize: [25,25],
    taskHeight: 50,
    //number of pixels task moves before icon moves with it
    iconSpace: 45,
    boxShadow: '0 1px 0px rgba(255,255,255,0.1) inset, 0 -1px 0px rgba(0,0,0,0.1) inset',
    zTranslation: -1,
    inputPre: '<input type="text" class="task" value="',
    inputPost: '" disabled/>'
  };

  function _createBackground(){
    this.background = new Surface({
      properties: {
        backgroundColor: commonVars.fRed,
        boxShadow: this.options.boxShadow
      }
    });
    this.backMod = new StateModifier({transform: Transform.behind});
    var render = this.node.add(this.backMod);
    render.add(this.background);
    this.background.pipe(this._eventOutput);
  }

  function _addText(){
    this.text = new Surface({
      content: this.model.text,
      properties: {
        color: 'white',
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: commonVars.fonts,
        textAlign: 'left',
        padding: '15px'
      }
    });

    var textModifier = new StateModifier({
      origin: [.5, .5],
    });

    this.node
    .add(textModifier)
    .add(this.text);

    //this.isTouching...  ...View Sequence
    this.scroll = true;
    var touchFilter = new EventFilter(function(type, data){
      return this.scroll;
    }.bind(this));
    
    this.text.pipe(touchFilter).pipe(this._eventOutput);
  }

  function _addEventHandlers(){

    this.text.on('touchstart', function(evt){
      var shouldTest = true;
      var touch = evt.targetTouches[0];
      var startX = touch.clientX;
      var startY = touch.clientY;

      var startPos = this.transitionable.get();
      var completedVal = this.model.isCompleted;
      this.isTouching = 1;

      var moveHandler = function (evtM){
        var mTouch = evtM.targetTouches[0];
        var currentX = mTouch.clientX;
        var currentY = mTouch.clientY;
        var curPos = startPos + (currentX - startX);

        //user is attempting to move vertically
        if(Math.abs(currentY - startY) > 5 && shouldTest){
          this.transitionable.set(0);
          this.text.removeListener('touchmove', moveHandler);
          this.text.removeListener('touchend', endHandler);
          this.isTouching = 0;
          //early termination to not do the logic of move if the touch is moving vertically
          return;
        }

        //user is attempting to move horizontally
        if(Math.abs(currentX - startX) > 5){
          this._eventOutput.emit('touchend', evtM);
          shouldTest = false;
          this.scroll = false;
        }

        if(curPos > window.innerWidth/3){
          if(completedVal){
            this.makeRed();
          } else {
            this.makeGreen();
          }
          this.transitionable.set(window.innerWidth/3 + (curPos - window.innerWidth/3)/5, 0);
        } else {
          if(curPos < -window.innerWidth/3){
            this.transitionable.set(-(window.innerWidth/3 + (-curPos - window.innerWidth/3)/5), 0);
          } else {
            this.transitionable.set(curPos, 0);
          }
          if(!completedVal){
            this.makeRed();
          } else {
            this.makeBlack();
          }
        }
      }.bind(this);

      var endHandler = function (evtE){
        var endPos = this.transitionable.get();

        // Less memory, less bugs to worry about.
        this.text.removeListener('touchmove', moveHandler);
        this.text.removeListener('touchend', endHandler);

        //move task to the left to delete
        if(endPos < -window.innerWidth/3){
          this.deleteTask();
        } else {
          if(endPos > window.innerWidth/3){
            this.completeTask();
          } else {
            this.transitionable.set(0, {method: 'spring', period: 300, dampingRatio: 0.9});
          }
        }

        this.scroll = true;
        //Let scrollview know that touch has ended
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
      var x = this.transitionable.get();
      if(x > -this.options.iconSpace && x < 0) { return Transform.translate( -x - 10, 0, -1); }
      return Transform.translate( this.options.iconSpace - 10, 0, -1);
    }.bind(this));
    deleteTaskMod.opacityFrom(function(){
      var x = this.transitionable.get();
      if(x > 0 || this.isTouching === 0) {
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
      var x = this.transitionable.get();
      if(x < this.options.iconSpace && x >= 0) { return Transform.translate( -x + 10 , 0, -1); }
      return Transform.translate( -this.options.iconSpace + 10, 0, -1);
    }.bind(this));
    completeTaskMod.opacityFrom(function(){
      var x = this.transitionable.get();
      if(x < 0 || this.isTouching === 0) {
        return 0;
      }
      return Math.min(1, (x/(window.innerWidth/6)));
    }.bind(this));
    var completeTaskIcon = new ImageSurface({
        content: 'checkmark-round.svg'
    });
    this.node.add(completeTaskMod).add(completeTaskIcon);
  }








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
	  var PI = Math.PI;

	  var commonVars = {
	      fRed: '#FA5C4F',
	      fGrey: '#878785',
	      fDarkGrey: '#404040',
	      fLighGrey: '#F0EEE9',
	      fWhite: '#FFFFFF',
	      fGreen: '#259959',
	      fonts: '"Avenir Next W01 Light", Helvetica, sans-serif'
	    };


		PageView = function(){
	      var args = [].slice.call(arguments, 1);
	      View.apply(this, arguments);
	      this.cursor = this.options.collection;
	      _observeCursor.call(this);
	      _addLayout.call(this);
	      _addContent.call(this);
	      _addHeader.call(this);
	      _addFooter.call(this);
	      _addBlankTask.call(this);
	      _addEventListeners.call(this);
	      _handleCompleteButton.call(this);
	      // _addPageEvents.call(this);
	      // _addCollectionEvents.call(this);

	    }


	    PageView.DEFAULT_OPTIONS = {
	      headerFooterZ: 0,
	      scrollViewZ: -1,
	      blankTaskZ: -2,
	      taskHeight: 50,
	      headerSize: 34,
	      footerSize: 50
	    };
	    
	    PageView.prototype = Object.create(View.prototype);
	    PageView.prototype.constructor = PageView;

	  function _observeCursor(){
	  	this.cursor.observe({
		    addedAt: function(document, atIndex, before) {
		    	var task = new TaskView({
		    	  model: document,
		    	  animIndex: 0
		    	});
		    	var node = new RenderNode();
		    	var taskMod = new StateModifier();
		    	this.taskMods.splice(atIndex, 0, taskMod);
		    	this.taskViews.splice(atIndex, 0, task);
		    	node.add(taskMod).add(task);
		    	this.tasks.splice(atIndex, 0, node);
		    	task._eventOutput.pipe(this.scrollView);

		    }.bind(this),
		    changedAt: function(newDocument, oldDocument, atIndex) {
		        if(newDocument.isCompleted){
		        	this.taskViews[atIndex].makeBlack();
		        } else {
		        	this.taskViews[atIndex].makeRed();
		        }
		 
		    }.bind(this),
		    removedAt: function(oldDocument, atIndex) {
		    	this.taskMods.splice(atIndex, 1);
		    	this.tasks.splice(atIndex, 1);
		    }.bind(this),
		    movedTo: function(document, fromIndex, toIndex, before) {
		      // var item = data.splice(fromIndex, 1)[0];
		      // data.splice(toIndex, 0, item);
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

	  //**********************
	  // #### ADD HEADER ####

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
	       size: [,20],
	       properties: {
	         textAlign: 'center',
	         color: 'white',
	         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
	         fontWeight: '200',
	         fontSize: '16px'
	       }
	     });

	     this.layout.header.add(new StateModifier({
	       origin: [.5,.5],
	       transform: Transform.translate(0,0, this.options.headerFooterZ)
	     })).add(this.hText);
	   }

	   //**********************
	  // #### ADD FOOTER ####

	   function _addFooter(){
	    this.layout.footer.add(new StateModifier({
	      origin: [.5,.5],
	      transform: Transform.translate(0,0, this.options.headerFooterZ)
	    })).add(new Surface({
	      properties: {
	        backgroundColor: commonVars.fDarkGrey,
	        textAlign: 'center'
	      }
	    }));

	    this.textInput = new InputSurface({
	      size: [window.innerWidth - 20, 30],
	      properties: {
	        textAlign: 'center',
	        color: commonVars.fDarkGrey,
	        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
	        fontWeight: '200',
	        fontSize: '20px',
	        outline: 'none',
	        backgroundColor: commonVars.fLightGrey,
	        background: commonVars.fLightGrey,
	        border: '0'
	      }
	    });

	    this.layout.footer.add(new StateModifier({
	      origin: [.5,.5],
	      transform: Transform.translate(0,0, this.options.headerFooterZ)
	    })).add(this.textInput);

	    this.textInput.on('keyup', function(event){
	      if(event.keyCode === 13 && this.textInput._currTarget.value.trim() !== ''){
	         Tasks.insert({
	          text: this.textInput._currTarget.value.trim(),
	          isCompleted: false
	        });
	        this.textInput._currTarget.value = '';
	      }
	    }.bind(this));

	    this.textInput.on('blur', function(event){
	      if(this.textInput._currTarget.value.trim() !== ''){
	        Tasks.insert({
	          text: this.textInput._currTarget.value.trim(),
	          isCompleted: false
	        });
	        this.textInput._currTarget.value = '';
	      }
	    }.bind(this));
	  }

	  //**********************
	  // #### ADD BLANK TASK ####

	  function _addBlankTask(){
	      var blankTask = new View({
	        size: [,50],
	        origin: [0.5, 0]
	      });
	      var blankSurface = new Surface({
	        size: [,50],
	        origin: [0.5, 0],
	        properties: {
	          boxShadow: '0 1px 0px rgba(255,255,255,0.1) inset, 0 -1px 0px rgba(0,0,0,0.1) inset',
	          backgroundColor: commonVars.fRed
	        }
	      });
	      var blankModUp = new StateModifier({
	        origin: [0.5, 0],
	        size: [,50],
	        transform: Transform.translate(0, -16, -0.01)
	      });
	      var blankTransform = new Modifier({
	        origin: [0.5, 0],
	        size: [, 50]
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
	        if(x >= 0 || this.isPinching){
	          return 0.00001;
	        }
	        if( x < -51){
	          return 1;// * this.isTouching;
	        }
	        return Math.max(0.75, -x/50);// * this.isTouching;
	      }.bind(this));

	      blankRotation.transformFrom(function(){
	        var x = this.scrollView.getPosition();
	        if(x >= 0){
	          return Transform.rotateX(PI/2);
	        }
	        if(x < -50){
	          return Transform.rotateX(0);
	        }
	        return Transform.rotateX(PI/2 - ((PI/2) * (-x/50)));
	      }.bind(this));

	      this.add(blankTransform).add(blankModUp).add(blankTask);
	      blankTask.add(blankRotation).add(blankSurface);
	    }

	    //**********************
	  // #### ADD EVENT LISTENER ####

	  function _addEventListeners(){
	    // map everything through a smarter event Handler for constant access to start position.
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


	    // SHould actually work with Event Mapper. But Event Mapper seems to be broken right now.
	    var scrollFilter = new EventFilter(function(type, data){
	      if(type === 'touchmove'){
	        return data.touches.length === 1;
	      } else {
	        return true;
	      }
	    });

	    var pinchFilter = new EventFilter(function(type, data){
	      if(type === 'touchstart'){
	        return data.touches.length === 2;
	      }
	      //return true
	      return data.starter.length === 2;
	    }.bind(this));

	    this.pinchHandler = new EventHandler();

	    this.smarterEvents.pipe(scrollFilter).pipe(this.scrollView);
	    this.smarterEvents.pipe(pinchFilter).pipe(this.pinchHandler);

	    this.pinchHandler.on('touchstart', function(evt){
	      this.isPinching = true;
	    }.bind(this));

	    this.pinchHandler.on('touchmove', function(evt){
	      var center = (evt.starter[0].pageY + evt.starter[1].pageY)/2;
	      var scrollTop = this.scrollView.getPosition();
	      center += scrollTop;
	      var index = Math.round(center/50);

	      this.hText.setContent(index);

	      var touchTop = (evt.starter[0].pageY < evt.starter[1].pageY) ? 0 : 1;
	      var touchBottom = (touchTop === 0) ? 1 : 0;

	      var diffTop = evt.touches[touchTop].pageY - evt.starter[touchTop].pageY;
	      var diffBottom = evt.touches[touchBottom].pageY - evt.starter[touchBottom].pageY;

	      if( (diffBottom - diffTop) < 0){
	        diffBottom = 0;
	        diffTop = 0;
	      }

	      for(var i = 0; i < this.taskMods.length; i++){
	        if(i < index){
	          this.taskMods[i].setTransform(Transform.translate(0, diffTop, 0));
	        } else {
	          this.taskMods[i].setTransform(Transform.translate(0, diffBottom, 0));
	        }
	      }

	      //this.hText.setContent( evt.touches[0].pageY + " - " + evt.starter[0].pageY + " - " + evt.touches[1].pageY + " - " + evt.starter[1].pageY);
	    }.bind(this));

	    this.pinchHandler.on('touchend', function(evt){
	      this.isPinching = false;
	    }.bind(this));
	  }

	  //**********************
	  // #### ADD CONTENT ####

	  function _addContent(){

	    this.scrollView = new ScrollView({
	      direction : Utility.Direction.Y
	    });
	    this.transitionable = new Transitionable(0);

	    this.tasks = [];	
	    this.taskMods = [];
	    this.taskViews = [];

	    this.scrollView.sequenceFrom(this.tasks);

	    this.layout.content.add(this.scrollView);

	    this.scrollView._eventInput.on('touchstart', function(){
	      this.isTouching = true;
	    }.bind(this));

	    this.scrollView._eventInput.on('touchend', function(){
	      this.isTouching = false;
	    }.bind(this));

	  }

function _handleCompleteButton(){
  Template.button.events({
    'click': function(){
        Tasks.update(this._id, {$set: {isCompleted: !this.isCompleted}});
    }
  });
}




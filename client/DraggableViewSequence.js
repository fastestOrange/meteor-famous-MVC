var ViewSequence = Famous('famous/core/ViewSequence');
var Modifier = Famous('famous/core/Modifier');
var Surface = Famous('famous/core/Surface');
var RenderNode = Famous('famous/core/RenderNode');
var Transitionable = Famous('famous/transitions/Transitionable');
var Transform = Famous('famous/core/Transform');


// Subclass of View Sequence where every renderable is wrapped in a RenderNode + Modifier
// The modifiers can then be used for fine grained control of individual Renderables
DraggableViewSequence = function(options) {
    var args = Array.prototype.slice.call(arguments, 1);
    if(Array.isArray(options)){
        options = options.map(function (option) {
            var node = new RenderNode();
            node.add(new Modifier()).add(view);
            return node;
        });
    } else if(typeof options === 'object' && Array.isArray(options.array)){
        options.array = options.array.map(function (option) {
            var node = new RenderNode();
            node.add(new Modifier()).add(view);
            return node;
        });
    }
    args.unshift(options);
    ViewSequence.apply(this, args);
}

DraggableViewSequence.prototype = Object.create(ViewSequence.prototype);
DraggableViewSequence.prototype.constructor = DraggableViewSequence;

//expects an array
DraggableViewSequence.Backing = function (array){
    ViewSequence.Backing.apply(this, arguments);
};

// DraggableViewSequence.Backing = ViewSequence.Backing;
DraggableViewSequence.Backing.prototype = Object.create(ViewSequence.Backing.prototype);
DraggableViewSequence.Backing.prototype.constructor = DraggableViewSequence.Backing;

DraggableViewSequence.prototype.push = function (view) {
    var node = new RenderNode();
    node.add(new Modifier()).add(view);
    ViewSequence.prototype.push.call(this, node);
};

// Similar to swap. Takes index of element to be swapped with.
// As long as the index is currentIndex - 1, does an animated swap
DraggableViewSequence.prototype.moveUp = function (index, transitionObj) {
    var that = this.getNext();
    var mod = that.getModifierAt(index);
    var size = that.getSize()[1];
    that.swap(that.getPrevious());
    mod.setTransform(Transform.translate(0,-size,0));
    mod.setTransform(Transform.translate(0,0,0), transitionObj);
};


// Similar to swap. Takes index of element to be swapped with.
// As long as the index is currentIndex + 1, does an animated swap
DraggableViewSequence.prototype.moveDown = function (index, transitionObj) {
    var that = this.getNext();
    var mod = that.getModifierAt(index);
    var size = that.getSize()[1];
    that.swap(that.getNext());
    mod.setTransform(Transform.translate(0,size,0));
    mod.setTransform(Transform.translate(0,0,0), transitionObj);
};

DraggableViewSequence.prototype.bootstrap = function () {
    var node = new RenderNode();
    node.add(new Modifier({size: [,0.0001]})).add(new Surface());
    this.unshift(node);
    this._.bootstrapped = true;
};

DraggableViewSequence.prototype.unshift = function (view) {
    var node = new RenderNode();
    node.add(new Modifier()).add(view);
    //ViewSequence.prototype.unshift.call(this, node);
    ViewSequence.prototype.splice.call(this, 1, 0, node);
};

DraggableViewSequence.prototype.splice = function (index, howMany, view) {
    index++;
    if(!!view){
        var node = new RenderNode();
        node.add(new Modifier()).add(view);
        ViewSequence.prototype.splice.call(this, index, howMany, node);
    } else {
        ViewSequence.prototype.splice.apply(this, arguments);
    }
};

DraggableViewSequence.prototype.getLength = function () {
    return this._.array.length - 1;
};

DraggableViewSequence.prototype.getModifierAt = function (index) {
    index++;
    if(index < this._.array.length) {
        return this._.array[index]._child._object;
    } else {
        return null;
    }
};

DraggableViewSequence.prototype.getViewAt = function (index) {
    index++;
    return this._.array[index]._child._child._object;
};

DraggableViewSequence.prototype.forEachMod = function (startIndex, endIndex, callback) {
    startIndex = startIndex || 0;
    endIndex = endIndex || this.getLength() - 1;

    for(var i = startIndex; i <= endIndex; i++){
        callback(this.getModifierAt(i));
    }
};

DraggableViewSequence.prototype.forEachView = function (startIndex, endIndex, callback) {
    startIndex = startIndex || 0;
    endIndex = endIndex || this.getLength() - 1;

    for(var i = startIndex; i <= endIndex; i++){
        callback(this.getViewAt(i));
    }
};

DraggableViewSequence.prototype.removeElement = function (index, transitionObj, callback) {
    var trans = new Transitionable(0);
    //get height of element
    var size = this.getViewAt(index).getSize()[1];

    //link elements to transitionable 
    this.forEachMod(index + 1, undefined, function(mod){
        mod.transformFrom(function(){
            return Transform.translate(0, trans.get(), 0);
        });
    });

    //animate elements up into empty space, then remove transitionable
    trans.set(-size, transitionObj, function(){
        this.splice(index, 1);

      //have to pass a transition object parameter for trans.set to work
      trans.set(0, {duration: 0.0001});
      if(callback){
        callback();
      }
    }.bind(this));
};

DraggableViewSequence.prototype.moveFromAtoB = function(indexA, indexB, transitionObj) {
    if(indexA === indexB || indexA >= this.getLength() || indexB >= this.getLength()){
        callback();
        return;
    }

    var sign = (indexB - indexA)/Math.abs(indexB - indexA);
    // will be a +1 for it going down, -1 for up.

    var view = this.getViewAt(indexA);
    var size = view.getSize()[1];

    this.splice(indexA, 1);
    this.splice(indexB, 0, view);

    this.getModifierAt(indexB).setTransform(Transform.translate(0, (indexA - indexB) * 50, 0), 0);
    this.getModifierAt(indexB).setTransform(Transform.translate(0, 0, 0), transitionObj);

    for(var i = indexA + sign; (i*sign) < (indexB*sign); i += sign){
        this.getModifierAt(i).setTransform(Transform.translate(0, sign * 50, 0), 0);
        this.getModifierAt(i).setTransform(Transform.translate(0, 0, 0), transitionObj);
    }

};

DraggableViewSequence.prototype.moveToBottom = function (index, transitionObj, callback){
    var trans = new Transitionable(0);
    var mod = this.getModifierAt(index);
    var view = this.getViewAt(index);
    var size = view.getSize()[1];
    var elementsBelow = this.getLength() - index;

    //link elements to transitionable 
    this.forEachMod(index + 1, undefined, function(mod){
        mod.transformFrom(function(){
            return Transform.translate(0, trans.get(), 0);
        });
    });
    mod.transformFrom(function(){

        return Transform.translate(0, -trans.get() * elementsBelow, 0);
    });

    //animate elements up into empty space, then remove transitionable
    trans.set(-size, transitionObj, function(){
      this.splice(index, 1);
      this.push(view);

      //have to pass a transition object parameter for trans.set to work
      trans.set(0, {duration: 0.0001});
      if(callback){
        callback();
      }
    }.bind(this));

};
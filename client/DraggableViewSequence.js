    var ViewSequence = Famous('famous/core/ViewSequence');
    var Modifier = Famous('famous/core/Modifier');
    var RenderNode = Famous('famous/core/RenderNode');
    var Transitionable = Famous('famous/transitions/Transitionable');
    var Transform = Famous('famous/core/Transform');

    DraggableViewSequence = function(options) {
        ViewSequence.apply(this, arguments);
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

    //DraggableViewSequence methods
    // function shift(data) {
    //     if (data.newIndex === this.node.index) {
    //         this.node = this.node.find(data.oldIndex);
    //     } else if (data.oldIndex === this.node.index) {
    //         this.node = this.node.find(data.oldIndex + 1);
    //     }
    //     this.node.find(data.oldIndex).moveTo(data.newIndex);
    //     var currentNode = this.node.find(0);
    //     while (currentNode) {
    //         currentNode.array[currentNode.index].taskItem.index = currentNode.index;
    //         currentNode.setPosition([0,0]);
    //         currentNode = currentNode.getNext();
    //     }
    // }

    DraggableViewSequence.prototype.push = function (view) {
        var node = new RenderNode();
        node.add(new Modifier()).add(view);
        ViewSequence.prototype.push.call(this, node);
    };

    DraggableViewSequence.prototype.moveUp = function (index, transitionObj) {
        var mod = this.getModifierAt(index);
        var size = this.getSize()[1];
        this.swap(this.getPrevious());
        mod.setTransform(Transform.translate(0,-size,0));
        mod.setTransform(Transform.translate(0,0,0), transitionObj);
    };

    DraggableViewSequence.prototype.moveDown = function (index, transitionObj) {
        var mod = this.getModifierAt(index);
        var size = this.getSize()[1];
        this.swap(this.getNext());
        mod.setTransform(Transform.translate(0,size,0));
        mod.setTransform(Transform.translate(0,0,0), transitionObj);
    };

    DraggableViewSequence.prototype.unshift = function (view) {
        var node = new RenderNode();
        node.add(new Modifier()).add(view);
        ViewSequence.prototype.unshift.call(this, node);
    };

    DraggableViewSequence.prototype.splice = function (index, howMany, view) {
        if(!!view){
            var node = new RenderNode();
            node.add(new Modifier()).add(view);
            ViewSequence.prototype.splice.call(this, index, howMany, node);
        } else {
            ViewSequence.prototype.splice.apply(this, arguments);
        }
    };

    DraggableViewSequence.prototype.getLength = function () {
        return this._.array.length;
    };

    DraggableViewSequence.prototype.getModifierAt = function (index) {
        return this._.array[index]._child._object;
    };

    DraggableViewSequence.prototype.getViewAt = function (index) {
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

    DraggableViewSequence.prototype.removeElement = function (index, transitionObj) {
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
        }.bind(this));  
        // this.splice(index, 1);
    };
    

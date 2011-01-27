/**
 * CSS class configured for annotation DIVs
 */ 
var ANN_BOX_CLASS = 'annotation-box';
var ANN_LABEL_CLASS = 'annotation-label';
var ANNOTATIONS = {};
var ANN_COUNT = 0;

/**
 * Default annotation box width. Used when the width is undefined
 */
var ANN_DEFAULT_W = 10;

/**
 * Default annotation box height. Used when the height is undefined
 */
var ANN_DEFAULT_H = 10;

/**
 * In order to put the image inside a DIV, I have to know the image's dimensions.
 * The problem is that you don't have this information until the image is fully
 * loaded. To bypass that, I enqueue all 'annotate' operations on different stacks
 * for each image, then changes the images' 'onload' parameter to point to a
 * function that dequeues and executes each function.
 */
var Annotate_op_queue = {};

/**
 * Shortcut for 'document.getElementById'
 */ 
function $(id) {
    return document.getElementById(id);
}

/**
 * Pushes an operation 'fn' in the operation stack identified by 'id'
 */
function _enqueue_operation(id, fn) {
    if(Annotate_op_queue[id] == undefined) {
       Annotate_op_queue[id] = new Array(); 
    }
    Annotate_op_queue[id].push(fn);
} 

function _flush_operation_queue(id) {
    if(Annotate_op_queue[id] != undefined) {
        while(Annotate_op_queue[id].length > 0) {
            Annotate_op_queue[id].pop()(); // Yeah, it's actually a stack. Sue me.
        }
    }
}

function _annotate(id, params) {
    var annotation_id = "ann" + ANN_COUNT;

    var container = _get_container(id);
    var node = $(id);
   
    var ax = params['x'] ? parseInt(params['x']) : 0;
    var ay = params['y'] ? parseInt(params['y']) : 0;
    var aw = params['w'] ? parseInt(params['w']) : ANN_DEFAULT_W;
    var ah = params['h'] ? parseInt(params['h']) : ANN_DEFAULT_H;
    var text = params['text'];

    // Attaching box to container and updating mouse functions
    var box = create_annotation_box(annotation_id, ax, ay, aw, ah);

    container.appendChild(box);
    container.onmouseover = function(){_show_annotations(container.id)};
    container.onmouseout = function(){_hide_annotations(container.id)};

    // Attaching label to container and updating mouse functions
    var label = create_annotation_label(annotation_id, ax, ay, aw, ah, text);

    if(label) {
        box.title = text;
        box.alt = text;
        box.onmouseover = function(){$(label.id).style.display = 'block'};
        box.onmouseout = function(){$(label.id).style.display = 'none'};
        
        container.appendChild(label);
    }

    ANNOTATIONS[annotation_id] = true;
    ANN_COUNT++;
}

function create_annotation_box(id, ax, ay, aw, ah) {
    annotation = document.createElement('div');        
    
    annotation.id = id;
    annotation.className = ANN_BOX_CLASS; 
    annotation.style.display = 'none';
    annotation.style.position = 'absolute';

    annotation.style.left = ax + "px";
    annotation.style.top = ay + "px";
    annotation.style.width = aw + "px";
    annotation.style.height = ah + "px";
    annotation.style.zIndex = 'auto';

    return annotation;
}

function create_annotation_label(id, ax, ay, aw, ah, text) {
    if(text) {
        var label = document.createElement("div");
        label.id = id + "_label";
        label.className = ANN_LABEL_CLASS;

        label.style.display = 'none';
        label.style.position = 'absolute';
        label.style.left = (ax + 5) + "px";
        label.style.top = (ay + ah + 5) + "px";
        label.style.zIndex = 'auto';

        label.innerHTML = text;

        return label;
    }

    return undefined;
}
    
function _show_annotations(container_id) {
    var children = $(container_id).childNodes;
    for(var i = 0; i < children.length; i++) {
        if(ANNOTATIONS[children[i].id]) {
            children[i].style.display = 'block';
        }
    }
}

function _hide_annotations(container_id) {
    var children = $(container_id).childNodes;
    for(var i = 0; i < children.length; i++) {
        if(ANNOTATIONS[children[i].id]) {
            children[i].style.display = 'none';
        }
    }
}

function _get_container(id) {
    var cid = "#" + id;
    var container = $(cid);     

    if(container == undefined) {
        var node = $(id);

        container = document.createElement('div');
        container.id = cid;
        container.style.position = 'relative';
        container.style.display = 'block';
        container.style.backgroundImage = 'url(' + node.src + ')';
        container.style.width = node.width;
        container.style.height = node.height;

        node.parentNode.replaceChild(container, node);
    }

    return container;
}


function annotate(id, params) {       
    _enqueue_operation(id, function(){_annotate(id, params)});
    $(id).onload = function(){_flush_operation_queue(id)};
}

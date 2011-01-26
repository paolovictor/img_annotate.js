/**
 * CSS class configured for annotation DIVs
 */ 
var ANN_BOX_CLASS = 'annotation';

/**
 * Default annotation box width. Used when the width is undefined
 */
var ANN_DEFAULT_W = 10;

/**
 * Default annotation box height. Used when the height is undefined
 */
var ANN_DEFAULT_H = 10;

/**
 * Number of annotations, used to define the annotation id. This will be
 * changed when annotation input is implemented
 */
var ANN_COUNT = 0;

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

function _annotate(id, annotation_id, params) {        
    var container = _get_container(id);
    var node = $(id);
   
    annotation = document.createElement('div');        
    
    annotation.id = annotation_id;
    annotation.className += " " + ANN_BOX_CLASS; 
    annotation.style.position = 'relative';

    if(params['x']) {
        annotation.style.left = params['x'];
    }
    
    if(params['y']) {
        annotation.style.top = params['y'];
    }

    annotation.style.width = params['w'] ? params['w'] : ANN_DEFAULT_W;
    annotation.style.height = params['h'] ? params['h'] : ANN_DEFAULT_H;

    if(params['text']) {
        annotation.title = params['text'];
        annotation.alt = params['text'];
    }
               
    container.appendChild(annotation);
}

function _get_container(id) {
    var cid = "#" + id;
    var container = $(cid);     

    if(container == undefined) {
        var node = $(id);

        container = document.createElement('div');
        container.id = cid;
        container.style.backgroundImage = 'url(' + node.src + ')';
        container.style.width = node.width;
        container.style.height = node.height;            

        node.parentNode.replaceChild(container, node);
    }

    return container;
}

function annotate(id, params) {       
    _enqueue_operation(id, function(){_annotate(id, ANN_COUNT, params)});
    $(id).onload = function(){_flush_operation_queue(id)};

    ANN_COUNT++;
}

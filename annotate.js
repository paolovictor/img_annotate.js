/**
 * CSS class configured for annotation DIVs
 */ 
var Annotate_ANNOTATION_CLASS = 'annotation';

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
    annotation.setAttribute('class', Annotate_ANNOTATION_CLASS); 
    annotation.style.display = 'none';
    annotation.style.position = 'absolute';

    if(params['x']) {
        annotation.style.left = params['x'];
    }
    
    if(params['y']) {
        annotation.style.top = params['y'];
    }

    if(params['w']) {
        annotation.style.width = params['w'];
    }

    if(params['h']) {
        annotation.style.height = params['h'];
    }
    
    if(params['text']) {
        annotation.innerHTML = params["text"];
        annotation.alt = params["text"];
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

        container.onmouseover = function(){_show_annotations(cid)};
        container.onmouseout = function(){_hide_annotations(cid)};

        node.parentNode.replaceChild(container, node);
    }

    return container;
}

function _show_annotations(container_id) {
    children = $(container_id).childNodes;
    for(var i = 0; i < children.length; i++) {
        children[i].style.display = 'block';
    }
}

function _hide_annotations(container_id) {
    var children = $(container_id).childNodes;
    for(var i = 0; i < children.length; i++) {
        children[i].style.display = 'none';
    }
}

function annotate(id, annotation_id, params) {       
    _enqueue_operation(id, function(){_annotate(id, annotation_id, params)});
    $(id).onload = function(){_flush_operation_queue(id)};
}

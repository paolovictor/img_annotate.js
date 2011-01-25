var Annotate_ANNOTATION_CLASS = 'annotation';
var Annotate_op_queue = {};

function $(id) {
    return document.getElementById(id);
}

function _enqueue_operation(id, fn) {
    if(Annotate_op_queue[id] == undefined) {
       Annotate_op_queue[id] = new Array(); 
    }
    Annotate_op_queue[id].push(fn);
}

function _flush_operation_queue(id) {
    if(Annotate_op_queue[id] != undefined) {
        while(Annotate_op_queue[id].length > 0) {
            Annotate_op_queue[id].pop()();
        }
    }
}

function _annotate(id, annotation_id, message, width, height) {
    annotate(id, annotation_id, message, width, height, 0, 0);
}

function _annotate(id, annotation_id, message, width, height, x, y) {        
    container = _get_container(id);
    node = $(id);
   
    annotation = document.createElement('div');        
    
    annotation.id = annotation_id;
    annotation.setAttribute('class', Annotate_ANNOTATION_CLASS); 
    
    annotation.style.display = 'none';
    annotation.style.position = 'absolute';
    annotation.style.left = x;
    annotation.style.top = y;
    annotation.style.width = width;
    annotation.style.height = height;
    //annotation.style.zIndex = container.childNodes.length + 1;
    
    annotation.innerHTML = message;
    annotation.alt = message;
               
    container.appendChild(annotation);
}

function _get_container(id) {
    cid = "#" + id;
    container = $(cid);     

    if(container == undefined) {
        container = document.createElement('div');
        container.id = cid;
        container.style.backgroundImage = 'url(' + node.src + ')';
        container.style.width = node.width;
        container.style.height = node.height;            

        container.onmouseover = function(){_show_annotations(cid)};
        container.onmouseout = function(){_hide_annotations(cid)};

        node = $(id);
        node.parentNode.replaceChild(container, node);
    }

    return container;
}

function _show_annotations(container_id) {
    var children = $(container_id).childNodes;
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

function annotate(id, annotation_id, message, width, height) {       
    _enqueue_operation(id, function(){_annotate(id, annotation_id, message, width, height)});
    $(id).onload = function(){_flush_operation_queue(id)};
}

function annotate(id, annotation_id, message, width, height, x, y) {
    _enqueue_operation(id, function(){_annotate(id, annotation_id, message, width, height, x, y)});
    $(id).onload = function(){_flush_operation_queue(id)};
}
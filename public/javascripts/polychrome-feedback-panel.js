/**
 * @author Karthik Badam
 * created in March 2014
 */
 
var screenCount = 1;
var screenIndex = 1;
var myclick = false;
var deviceId = "";

/* define event capture state */
var eventCapture = {};
eventCapture.click = true;
eventCapture.touchstart = true;
eventCapture.touchmove = true;
eventCapture.touchend = true;
eventCapture.mousedown = true; 
eventCapture.mousemove = true; 
eventCapture.mouseup = true;

/* parse page URL to get peerId and screen details*/
var selfUrl = document.URL;
var idCheck = /[?&]peerId=([^&]+)/i;
var spaceCheck = /[?&]spaceConfig=([^&]+)/i;
var displayCheck = /[?&]displayConfig=([^&]+)/i;

/* get peerId */
var match = idCheck.exec(selfUrl);
if (match != null) {
    deviceId = match[1];
} else {
    deviceId = randomString(10);
}

var isMouseDown = false; 

/* get peer configurations */
match = spaceCheck.exec(selfUrl);
if (match != null) {
    screenCount = parseInt(match[1]);
} else {
    screenCount = 1;
}

match = displayCheck.exec(selfUrl);
if (match != null) {
    screenIndex = parseInt(match[1]);
} else {
    screenIndex = 1;
}

/* arraylist of all connections */
var connections = [];

/* generate a random string if no ID is present */
function randomString(len, charSet) {
	charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
}

/* default event options */
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

/* event types */
var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}

/* simulate the Mouse event */
function simulateMouseEvent(element, eventType, options)
{
    var oEvent = null; 

    if (document.createEvent)
    {
        oEvent = document.createEvent("MouseEvents");
        
        /* recognize that this is PolyChrome event */
        oEvent.isPolyChrome = true; 
        oEvent.initMouseEvent(eventType, options.bubbles, options.cancelable, document.defaultView,
        1, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        element.dispatchEvent(oEvent);
        return true; 

    } else {
    
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        evt.isPolyChrome = true; 
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventType, oEvent);
        return true; 
    }
    return false;
}

/* simulate the HTML event */
function simulateHTMLEvent(element, eventType, options)
{
    var oEvent = null; 

    if (document.createEvent)
    {
        oEvent = document.createEvent("HTMLEvents");
        oEvent.isPolyChrome = true; 
        oEvent.initEvent(eventType, options.bubbles, options.cancelable);
        element.dispatchEvent(oEvent);
        return true; 

    } else {
    
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        evt.isPolyChrome = true; 
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventType, oEvent);
        return true; 
    }
    return false;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

/* Method to execute an event */
var executeEventOnPosition = function (eventType, eventName, posX, posY, targetName) {

    var pageX = posX - window.pageXOffset;
    var pageY = posY - window.pageYOffset;
    var elem = document.elementFromPoint(pageX, pageY);

    if (elem === null) {
        var items = document.getElementsByTagName("*");
        for (var i = items.length; i--; ) {
            var temp_elem = items[i];
            var rect = temp_elem.getBoundingClientRect();
            var rect_width = rect.right - rect.left;
            var rect_height = rect.bottom - rect.top;
            if (Math.abs(pageX - rect.left) <= rect_width && Math.abs(pageY - rect.top) <= rect_height && temp_elem.nodeName === targetName) {
                elem = temp_elem;
            }
        }
    }

    if (eventName == "HTMLEvents") {
        /* copying the defaultOptions */
        var options = new Object();
        options = extend(options, defaultOptions);
        simulateHTMLEvent(elem, eventType, options);
    } else {
        /* copying the defaultOptions */
        var options = new Object();
        options = extend(options, defaultOptions);
        options.pointerX = pageX;
        options.pointerY = pageY;
        simulateMouseEvent(elem, eventType, options);
    }
}

function makeMessage(eventType, message) {
	var data = new Object();

	//message for click events 
	if (eventType == "click") {
		data.eventType = "click";
		data.message = message;
	}

	//message for scroll events
	if (eventType == "scroll") {
		data.eventType = "scroll";
	}
	return data;
}

/* Method for adding event details to UI */
var addEventFeedback = function(connectedClientId, eventType, posX, posY) {
      $('#polychrome-events-dump').prepend('<div class="polychrome-event-element">'+eventType+' for '+connectedClientId+' at '+posX+", "+posY+' </div>');
}

/* Method to add new peer details to the UI when connected */
var addNewPeer = function(connectedPeer) {
    $('#polychrome-events-list').append('<div class="polychrome-event-button" id="polychrome-'+connectedPeer+'-tab">'+connectedPeer+'</div>');
    $('#polychrome-display-list').append('<div class="polychrome-display-button" id="polychrome-'+connectedPeer+'-tab">'+connectedPeer+'</div>');
}

/* handle received event */
function onData(connectedDeviceId, data) {
    var eventType = null;
    var eventName = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(data.eventType)) { 
            eventType = data.eventType;
            eventName = name;
            break; 
        }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (eventType && eventName) {
        var targetName = data.target;
		var posX = data.posX;
		var posY = data.posY;
        
        executeEventOnPosition(eventType, eventName, posX, posY, targetName); 
        addEventFeedback(connectedDeviceId, eventType, posX, posY); 

    } else {
        /* It is not an event but a message*/
    
    }
}

//on connection 
function connect(conn) {
	conn.on('open', function() {
		connections.push(conn);
		//alert("Now connected to " + conn.peer);
        addNewPeer(conn.peer);
	});

	conn.on('data', function(data) {
		if (data != null)
			onData(conn.peer, data);

	});
}

var peer = new Peer(deviceId, {
	host: 'localhost',
	port: '8000'    
});

peer.on('open', function(id, clientIds) {
	$('#polychrome-id').text("CLIENT ID: "+id);
	
    console.log(clientIds);
    if (clientIds) {
	    var peer1 = clientIds.split(",");
	    peer1.forEach(function(peerid) {
		    var conn = peer.connect(peerid);
		    conn.on('open', function() {
			    connections.push(conn);
			    addNewPeer(conn.peer);
		    });

		    conn.on('data', function(data) {
			    if (data != null)
				    onData(conn.peer, data);
		    });
	    });
    }
});

/* make sure that peerjs connections are handled by the connect function */
peer.on('connection', connect);


/* sockets to connect to server */
var socket = io.connect('http://localhost:3000');

/* socket handle incoming messages */
socket.on('MouseEvents', function (data) {
    console.log('mouse event received');
});


/* on document load */
$(document).ready(function () {

    var eventHandler = function (evt) {
        if (evt.isPolyChrome) {
            return;
        } else if (evt.target.id.indexOf('polychrome') == -1) {
            if (evt.type == "mousemove") {
                if (!isMouseDown) {
                    return;
                }
            }

            var elem = document.elementFromPoint(evt.pageX, evt.pageY);
            var toSend = new Object();
            toSend.eventType = evt.type;
            toSend.target = evt.target.nodeName;
            toSend.posX = evt.pageX;
            toSend.posY = evt.pageY;
            toSend.deviceId = deviceId;


            /* send event to other peers */
            if (eventCapture[evt.type]) {
                addEventFeedback(deviceId, toSend.eventType, toSend.posX, toSend.posY);

                connections.forEach(function (connection) {
                    connection.send(toSend);
                });

                /* also send the event to server */
                socket.emit('MouseEvents', toSend);

                /* execute the event on current machine */
                onData(deviceId, toSend);
            }

            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();

            if (evt.type == "mousedown") {
                isMouseDown = true;
            }

            if (evt.type == "mouseup") {
                isMouseDown = false;
            }
        }
    };

    var eventHandler1 = function (evt) {
        if (evt.isPolyChrome) {
            return;
        } else if (evt.target.id.indexOf('polychrome') == -1) {
            if (evt.type == "mousemove") {
                if (!isMouseDown) {
                    return;
                }
            }

            var elem = document.elementFromPoint(evt.pageX, evt.pageY);
            var toSend = new Object();
            toSend.eventType = evt.type;
            toSend.target = evt.target.nodeName;
            toSend.posX = evt.pageX;
            toSend.posY = evt.pageY;
            toSend.deviceId = deviceId;


            /* send event to other peers */
            if (eventCapture[evt.type]) {
                addEventFeedback(deviceId, toSend.eventType, toSend.posX, toSend.posY);

                connections.forEach(function (connection) {
                    connection.send(toSend);
                });

                /* also send the event to server */
                socket.emit('MouseEvents', toSend);

                /* execute the event on current machine */
                //onData(deviceId, toSend);
            }

            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.stopImmediatePropagation();

            if (evt.type == "mousedown") {
                isMouseDown = true;
            }

            if (evt.type == "mouseup") {
                isMouseDown = false;
            }
        }
    };


    document.addEventListener("click", eventHandler1);
    document.addEventListener("mousedown", eventHandler1);
    document.addEventListener("mousemove", eventHandler);
    document.addEventListener("mouseup", eventHandler1);
    document.addEventListener("touchstart", eventHandler);
    document.addEventListener("touchmove", eventHandler);
    document.addEventListener("touchend", eventHandler);

    //mousedown mousemove mouseup touchmove touchstart touchend

    /* toggle to open up PolyChrome feedback */
    $("#polychrome-toggle").click(function () {
        $('#polychrome-toggle').toggleClass('active');
        $("#polychrome-actions").slideToggle("slow");
    });

    /* change display configuration based on read value */
    if (screenCount == 1) {

    } else if (screenCount == 2) {
        if (screenIndex == 1) {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 1)",
                "-webkit-transform-origin": "0% 0%"
            });
        } else {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 1)",
                "-webkit-transform-origin": "100% 0%"
            });
        }
    } else if (screenCount == 4) {
        if (screenIndex == 1) {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 2)",
                "-webkit-transform-origin": "0% 0%"
            });
        } else if (screenIndex == 2) {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 2)",
                "-webkit-transform-origin": "100% 0%"
            });
        } else if (screenIndex == 3) {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 2)",
                "-webkit-transform-origin": "0% 100%"
            });
        } else {
            $('#chrome_body').css({
                "-webkit-transform": "scale(2, 2)",
                "-webkit-transform-origin": "100% 100%"
            });
        }
    }





    /* handle checkbox changes */
    $('#polychrome-checkbox-click').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.click = true;
        } else {
            eventCapture.click = false;
        }
    });

    $('#polychrome-checkbox-mousedown').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.mousedown = true;
        } else {
            eventCapture.mousedown = false;
        }
    });

    $('#polychrome-checkbox-mousemove').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.mousemove = true;
        } else {
            eventCapture.mousemove = false;
        }
    });

    $('#polychrome-checkbox-mouseup').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.mouseup = true;
        } else {
            eventCapture.mouseup = false;
        }
    });

    $('#polychrome-checkbox-touchstart').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.touchstart = true;
        } else {
            eventCapture.touchstart = false;
        }
    });

    $('#polychrome-checkbox-touchmove').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.touchmove = true;
        } else {
            eventCapture.touchmove = false;
        }
    });

    $('#polychrome-checkbox-touchend').change(function () {
        var $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            eventCapture.touchend = true;
        } else {
            eventCapture.touchend = false;
        }
    });
});
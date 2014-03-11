/**
 * @author Karthik Badam
 * created in March 2014
 */
 
var screenCount = 1;
var screenIndex = 1;
var myclick = false;
var deviceId = "";

/* parse url to get peerId and screen details*/
var selfUrl = document.URL;
var id_check = /[?&]peerId=([^&]+)/i;
var match = id_check.exec(selfUrl);
if (match != null) {
    deviceId = match[1];
} else {
    deviceId = randomString(10);
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

    console.log("Propagated event found for " + elem.nodeName);

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


$(function () {

    var eventHandler = function (evt) {
        if (evt.isPolyChrome) {
            return;
        } else if (evt.target.id.indexOf('polychrome') == -1) {
            console.log(evt.target.id);
            var elem = document.elementFromPoint(evt.pageX, evt.pageY);
            var toSend = new Object();
            toSend.eventType = evt.type;
            toSend.target = evt.target.nodeName;
            toSend.posX = evt.pageX;
            toSend.posY = evt.pageY;
            connections.forEach(function (connection) {
                connection.send(toSend);
            });

            /* execute the event on current machine */
            onData(deviceId, toSend);
            evt.preventDefault();
            evt.stopPropagation();
        }
    };

    document.addEventListener("click", eventHandler);
    document.addEventListener("mousedown", eventHandler);
    document.addEventListener("mousemove", eventHandler);
    document.addEventListener("mouseup", eventHandler);
    document.addEventListener("touchstart", eventHandler);
    document.addEventListener("touchmove", eventHandler);
    document.addEventListener("touchend", eventHandler);

    //mousedown mousemove mouseup touchmove touchstart touchend

    /* toggle to open up PolyChrome feedback */
    $("#polychrome-toggle").click(function () {
        $('#polychrome-toggle').toggleClass('active');
        $("#polychrome-actions").slideToggle("slow");
    });

    //login management
    $("#login_submit").click(function () {
        // var username = $("#username").val();
        // var password = $("#password").val();
        // var message = [];
        // message.push({id: username, password: password});	
        // console.log(message);

        // var http = new XMLHttpRequest();
        // var url = 'http://' + hostname + ':' + port + '/login';
        // http.open('post', url, true);
        // http.setRequestHeader('Content-Type', 'application/json');
        // http.send(message);
        var form = $('#login_form');

        // var url = 'http://' + hostname + ':' + port + '/login';
        // form.setAttribute("method", "post");
        // form.setAttribute("action", url);
        // form.submit();

    });
});
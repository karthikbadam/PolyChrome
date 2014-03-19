

var screenCount = 1;
var screenIndex = 1;
var deviceId = "";
var screenWidth = 10;
var screenHeight = 10;
var hostname = '';
var port = '';

var idealWidth = 1920;
var idealHeight = 1080;

/* parse page URL to get peerId and screen details*/
var selfUrl = document.URL;
var idCheck = /[?&]peerId=([^&]+)/i;
var spaceCheck = /[?&]spaceConfig=([^&]+)/i;
var displayCheck = /[?&]displayConfig=([^&]+)/i;
var hostCheck = /[?&]host=([^&]+)/i;
var portCheck = /[?&]port=([^&]+)/i;

/* get peerId */
var match = idCheck.exec(selfUrl);
if (match != null) {
    deviceId = match[1];
} else {
    deviceId = randomString(10);
}

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

match = hostCheck.exec(selfUrl);
if (match != null) {
    hostname = match[1];
} else {
    hostname = window.location.hostname.split(":")[0];
}

match = portCheck.exec(selfUrl);
if (match != null) {
    port = '' + match[1];
} else {
    port = "3000";
}

/* define event capture states */
var eventCapture = {};
eventCapture.click = true;
eventCapture.touchstart = true;
eventCapture.touchmove = true;
eventCapture.touchend = true;
eventCapture.mousedown = true;
eventCapture.mousemove = true;
eventCapture.mouseup = true;


/* simulate the Mouse event */
function simulateMouseEvent(element, eventType, options) {
    var oEvent = null;

    if (document.createEvent) {
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
function simulateHTMLEvent(element, eventType, options) {
    var oEvent = null;

    if (document.createEvent) {
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

/* Method for adding event details to UI */
var addEventFeedback = function (connectedClientId, eventType, posX, posY) {
    $('#polychrome-events-dump').prepend('<div class="polychrome-event-element">' + eventType + ' for ' + connectedClientId + ' at ' + posX + ", " + posY + ' </div>');
}

/* Method to add new peer details to the UI when connected */
var addNewPeer = function (connectedPeer) {
    $('#polychrome-events-list').append('<div class="polychrome-event-button" id="polychrome-' + connectedPeer + '-tab">' + connectedPeer + '</div>');
    $('#polychrome-display-list').append('<div class="polychrome-display-button" id="polychrome-' + connectedPeer + '-tab">' + connectedPeer + '</div>');
}

/* sockets to connect to server */
var socket = io.connect('http://' + hostname + ":" + port);

/* socket handle incoming messages */
socket.on('MouseEvents', function (data) {

});


var peerConnection = {
    peer: new Peer(deviceId, { host: hostname, port: '8000' }),

    init: function () {
        var _self = this;

        _self.peer.on('open', function (id, clientIds) {
            $('#polychrome-id').text("CLIENT ID: " + id);

            if (clientIds) {
                var peers = clientIds.split(",");
                peers.forEach(function (peerid) {
                    var conn = peer.connect(peerid);
                    conn.on('open', function () {
                        connections.push(conn);
                        addNewPeer(conn.peer);
                    });

                    conn.on('data', function (data) {
                        if (data != null)
                            _self.onData(conn.peer, data);
                    });
                });
            }
        });

        /* make sure that peerjs connections are handled by the connect function */
        peer.on('connection', connect);

        /* on connection */
        function connect(conn) {
            conn.on('open', function () {
                connections.push(conn);
                addNewPeer(conn.peer);
            });

            conn.on('data', function (data) {
                if (data != null)
                    _self.onData(conn.peer, data);
            });
        }
    },

    onData: function (connectedDeviceId, data) {
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
            var posX = data.posX * screenWidth / idealWidth - document.body.scrollLeft;
            var posY = data.posY * screenHeight / idealHeight - document.body.scrollTop;
            var globalX = data.globalX;
            var globalY = data.globalY;
            var targetId = data.targetId;

            executeEventOnPosition(eventType, eventName, posX, posY, targetName, targetId);
            addEventFeedback(connectedDeviceId, eventType, parseInt(posX), parseInt(posY));

        } else {
            /* It is not an event but a message*/
        }
    }
}

var PolyChromeEventHandler = {
    event: null,

    polyChromify: function () {

        /* assign unique ids to each dom element -- for retrieval */
        var items = document.getElementsByTagName("*");
        for (var i = 0; i < items.length; i++) {
            elem = items[i];
            if (elem.id == null || elem.id == "") {
                elem.id = "pchrome" + i;
            }
        }
    },

    wrapEvent: function (eventType, posX, posY, element, nativeEvent) {
        var deviceId = deviceId;
        var _self = this;

        _self.event = new PolyChromeEvent({
            deviceId: deviceId,
            posX: posX,
            posY: posY,
            eventType: eventType,
            element: element,
            nativeEvent: nativeEvent,
            pageWidth: pageWidth,
            pageHeight: pageHeight,
            isNative: true
        });
    },

    shareCurrentEvent: function () {
        event.shareEvent();
    },

    createCustomEvent: function (eventName) {

    }

}
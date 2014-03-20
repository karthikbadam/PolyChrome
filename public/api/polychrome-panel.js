

var screenCount = 1;
var screenIndex = 1;
var deviceId = "";
var pageWidth = 10;
var pageHeight = 10;
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

/* define event capture states */
var eventCapture = {};
eventCapture.click = true;
eventCapture.touchstart = true;
eventCapture.touchmove = true;
eventCapture.touchend = true;
eventCapture.mousedown = true;
eventCapture.mousemove = true;
eventCapture.mouseup = true;


var FeedbackPanel = {

    init: function () {
        $('#polychrome-display-dump').css({ 'background-color': 'rgba(100, 100, 100, 1)' });
        $('#polychrome-display-dump').css('background-image', 'none');
    },

    setDisplayBackground: function () {

        $('#polychrome-display-dump').empty();

        html2canvas(document.body, {
            onrendered: function (canvas) {
                var ctx = canvas.getContext('2d'),
                rect = {},
                drag = false;

                var width = 200; 
                var height = 100;
                $(canvas).attr("width", width);
                $(canvas).attr("height", height);
                $(canvas).css("background-color", "#FFF");
                
                ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.lineWidth = '5';

                $('#polychrome-display-dump').append(canvas);

                canvas.addEventListener('mousedown', mouseDown, false);
                canvas.addEventListener('mouseup', mouseUp, false);
                canvas.addEventListener('mousemove', mouseMove, false);
                
                function getMousePos(canvas, evt) {
                    var rect1 = canvas.getBoundingClientRect();
                    return {
                      x: evt.clientX - rect1.left,
                      y: evt.clientY - rect1.top
                    };
                  }

                function mouseDown(e) {
                    var mousePos = getMousePos(canvas, e);
                    rect.startX = mousePos.x;
                    rect.startY = mousePos.y ;
                    drag = true;
                }

                function mouseUp() {
                    
                  
                    drag = false;
                }

                function mouseMove(e) {
                    var mousePos = getMousePos(canvas, e);
                    if (drag) {
                        rect.w = (mousePos.x - rect.startX);
                        rect.h = (mousePos.y - rect.startY);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillRect(rect.startX, rect.startY, rect.w , rect.h);
                    }
                }


            },
            allowTaint: true
        });


    },

    /* Method for adding event details to UI */
    addNewPeer: function (connectedPeer) {
        $('#polychrome-events-list').append('<div class="polychrome-event-button" id="polychrome-' + connectedPeer + '-tab">' + connectedPeer + '</div>');
        $('#polychrome-display-list').append('<div class="polychrome-display-button" id="polychrome-' + connectedPeer + '-tab">' + connectedPeer + '</div>');
    },

    /* Method to add new peer details to the UI when connected */
    addEventFeedback: function (connectedClientId, eventType, posX, posY) {
        $('#polychrome-events-dump').prepend('<div class="polychrome-event-element">' + eventType + ' for ' + connectedClientId + ' at ' + posX + ", " + posY + ' </div>');
    }
}

/* Link to the server */
var ServerConnection = {
    socket: null,
    url: null,

    init: function (url) {

        var _self = this;
        _self.url = url;
        _self.socket = io.connect('http://' + hostname + ":" + port);

        _self.socket.on('MouseEvent', function (data) {



        });

        _self.socket.on('MouseEvents', function (events) {
            _self.replayEvents(events);
            events.splice(events.length - 1, 1);

        });
    },

    send: function (event) {
        var _self = this;
        var toSend = event.getPacket();
        toSend['url'] = _self.url;
        _self.socket.emit('MouseEvents', toSend);
    },

    get: function () {
        var _self = this;
        var toSend = new Object();
        toSend.url = _self.url;
        _self.socket.emit('getMouseEvents', toSend);
    },

    replayEvents: function (events) {
        console.log("got events " + events.length);
        for (var i = 0; i < events.length; i++) {
            var data = events[i];
            var posX = data.posX * screenWidth / idealWidth - document.body.scrollLeft;
            var posY = data.posY * screenHeight / idealHeight - document.body.scrollTop;
            var targetId = data.targetId;
            var targetName = data.target;
            var element = document.getElementById(targetId);
            var eventType = data.eventType;

            var event = new PolyChromeEvent({
                deviceId: data.deviceId,
                posX: posX,
                posY: posY,
                eventType: eventType,
                element: element,
                pageWidth: screenWidth,
                pageHeight: screenHeight,
                name: "MouseEvents",
                isNative: true
            });

            event.execute();
        }
    },

    replayEvent: function (event) {

    }

}


/* Link to other clients */
var PeerConnection = {
    peer: null,
    connections: [],

    init: function () {
        var _self = this;

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

        _self.peer = new Peer(deviceId, { host: hostname, port: '8000' });

        _self.peer.on('open', function (id, clientIds) {
            $('#polychrome-id').text("CLIENT ID: " + id);

            if (clientIds) {
                var peers = clientIds.split(",");
                peers.forEach(function (peerid) {
                    var conn = _self.peer.connect(peerid);
                    conn.on('open', function () {
                        _self.connections.push(conn);
                        FeedbackPanel.addNewPeer(conn.peer);
                        alert("Connected to -" + conn.peer);
                        console.log("connected to " + conn.peer);
                    });

                    conn.on('data', function (data) {
                        if (data != null)
                            _self.onData(conn.peer, data);
                    });
                });
            }
        });

        /* make sure that peerjs connections are handled by the connect function */
        _self.peer.on('connection', connect);

        /* on connection */
        function connect(conn) {
            conn.on('open', function () {
                _self.connections.push(conn);
                FeedbackPanel.addNewPeer(conn.peer);
                console.log("connected to " + conn.peer);
                alert("Connected to -" + conn.peer);
            });

            conn.on('data', function (data) {
                if (data != null)
                    _self.onData(conn.peer, data);
            });
        }
    },

    send: function (toSend) {
        var _self = this;
        _self.connections.forEach(function (connection) {
            connection.send(toSend);
        });
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
            var posX = data.posX * screenWidth / idealWidth - document.body.scrollLeft;
            var posY = data.posY * screenHeight / idealHeight - document.body.scrollTop;
            var targetId = data.targetId;
            var targetName = data.target;
            var element = document.getElementById(targetId);

            var event = new PolyChromeEvent({
                deviceId: connectedDeviceId,
                posX: posX,
                posY: posY,
                eventType: eventType,
                element: element,
                pageWidth: screenWidth,
                pageHeight: screenHeight,
                isNative: true
            });

            event.execute();
            
        } else {

        }
    }
}

var PolyChromeEventHandler = {
    event: null,
   
    init: function () {

    },

    polyChromify: function () {
        /* get screen width and height */
        screenWidth = $(window).width();
        screenHeight = $(window).height();

        /* toggle to open up PolyChrome feedback */
        $("#polychrome-toggle").click(function () {
            $('#polychrome-toggle').toggleClass('active');
            $("#polychrome-actions").slideToggle("slow");
        });


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
        
        var _self = this;

        _self.event = new PolyChromeEvent({
            deviceId: deviceId,
            posX: posX,
            posY: posY,
            eventType: eventType,
            element: element,
            nativeEvent: nativeEvent,
            pageWidth: screenWidth,
            pageHeight: screenHeight,
            isNative: true
        });
    },

    shareEvent: function () {
        var _self = this;
        _self.event.shareEvent();
        _self.event.execute();
        ServerConnection.send(_self.event);

    },

    createCustomEvent: function (eventName) {

    }

}


var Display = {
    MIRROR : 0,
    SPLIT : 1
}

var SCREEN = {
    NW: 0,
    NM: 1,
    NW: 2,
    SW: 3,
    SM: 4,
    SW: 5
}

/* Display modules */
var DisplayConfiguration = {
    spaceType: 0,
    screenType: 0,

    init: function (space, type) {
        var _self = this;

        if (space && type) {
            _self.spaceType = DISPLAY[space];
            _self.screenType = SCREEN[type];
        
        } else {
            
            /* prepare the canvas in display configuration */



        }
    }

}

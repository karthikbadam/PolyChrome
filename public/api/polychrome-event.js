
/* event types */
var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
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

function PolyChromeEvent(options) {

    var _self = this;

    //_self.nativeEvent = options.nativeEvent;
    _self.pageWidth = options.pageWidth;
    _self.pageHeight = options.pageHeight;
    _self.eventType = options.eventType;
    _self.peerId = options.deviceId;
    _self.posX = options.posX;
    _self.posY = options.posY;
    _self.element = element; 
    
    if (options.isNative == null) {
        /* raise error */
    }

    _self.isNative = options.isNative;

    /* check if eventType is known type */
    var eventName = _self.checkEvent(_self.eventType);

    if (eventName == null) {
        /* raise error */
    }

    _self.eventName = eventName.name;

    /* if custom event */
    if (options.isNative == false) {
        _self.customContent = options.customContent;
    }

}

PolyChromeEvent.prototype.checkEvent = function (eventType) {

    var _self = this;
    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventType)) {
            return { "name": name };
        }
    }

    return null;
}

PolyChromeEvent.prototype.shareEvent = function () {
    var _self = this;

    var toSend = new Object();
    toSend.posX = (_self.posX) * idealWidth / screenWidth;
    toSend.posY = (_self.posY) * idealHeight / screenHeight;
    toSend.eventType = _self.eventType;
    toSend.targetId = _self.element.id;
    toSend.target = _self.nodeName;
    toSend.deviceId = deviceId;

    PeerConnection.send(toSend);
}

PolyChromeEvent.prototype.shareEventToSelected = function () {
    var _self = this;

}

PolyChromeEvent.prototype.shareWithServer = function () {
    var _self = this;

}

/* A custom event -- can be a combination of native events or a totally new sort of event */
PolyChromeEvent.prototype.CustomEventBehavior = function (Handler) {
    var _self = this;
    Handler(_self.customContent);
}


function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}


PolyChromeEvent.prototype.execute = function () {
    var _self = this;
    var oEvent = null;

    var options = new Object();
    options = extend(options, defaultOptions);

    if (_self.eventType == "MouseEvents") {
        
        if (document.createEvent) {
            oEvent = document.createEvent("MouseEvents");

            /* recognize that this is PolyChrome event */
            oEvent.isPolyChrome = true;

            oEvent.initMouseEvent(eventType, options.bubbles, options.cancelable, document.defaultView,
            1, _self.posX, _self.posY, _self.posX, _self.posY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, _self.element);

            _self.element.dispatchEvent(oEvent);
            return true;

        } else {

            options.clientX = _self.posX;
            options.clientY = _self.posY;
            var evt = document.createEventObject();
            evt.isPolyChrome = true;
            oEvent = extend(evt, options);
            element.fireEvent('on' + eventType, oEvent);
            return true;
        }

    } else if (_self.eventType == "HTMLEvents") {

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
    }

    return false;
}

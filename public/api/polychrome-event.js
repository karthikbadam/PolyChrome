
/* event types */
var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}

function PolyChromeEvent (options) {
    
    var _self = this; 
    
    _self.nativeEvent = options.nativeEvent;
    _self.pageWidth = options.pageWidth;
    _self.pageHeight = options.pageHeight;
    _self.eventType = options.eventType;
    _self.peerId = options.deviceId;
    _self.posX = options.posX;
    _self.posY = options.posY;

    if (options.isNative == null) {   
        /* raise error */
    }

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


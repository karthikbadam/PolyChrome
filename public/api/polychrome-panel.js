

var PolyChromeEventHandler = {

    event: null,

    create: function (eventType, posX, posY, element, nativeEvent) {
        var deviceId = deviceId;
        event = new PolyChromeEvent({
                    deviceId : deviceId,
                    posX : posX,
                    posY : posY,
                    eventType: eventType,
                    element: element,
                    nativeEvent: nativeEvent,
                    pageWidth: pageWidth,
                    pageHeight: pageHeight 
            });

    },

    polyChromify: function () {

    }

}
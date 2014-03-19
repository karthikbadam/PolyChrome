

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

    createcustomEvent: function () {
        
    }

}
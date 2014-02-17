
/**
 * Definition class for a PolyChrome session   
**/
var http = require('http');
var url = require('url');
var page = require('webpage');

function PolyChromeSession (options) {
    var _self = this;
    _self.page = options.page;
    _self.peerId = options.peerId;
    _self.username = options.login.username;
    _self.password = options.login.password;
}

/* get the session for the peer */
PolyChromeSession.prototype.getPageDetails = function (peerId) {
    var _self = this; 
    if (_self.peerId === peerId) {
        return _self.page;
    }
    return null;
};

exports.PolyChromeSession = PolyChromeSession;


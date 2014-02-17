
/**
 * Definition class for any webpage   
**/
var http = require('http');
var url = require('url');

function WebPage (options) {
	var _self = this; 
	_self.url = options.url;
	_self.spaceConfig = options.spaceConfig;
	_self.displayConfig = options.displayConfig;
	_self.isValid = true; 
}

WebPage.prototype.getUrl = function () {
	var _self = this; 
	return _self.url;
};

WebPage.prototype.parseUrl = function () {
    var _self = this;

    _self.urlObject = url.parse(_self.url, true);

    if (!_self.urlObject.protocol) {
        _self.urlObject.protocol = "http:";
    }

    if (_self.urlObject.hostname) {

        var port = 80;
        if (_self.urlObject.port) {
            port = _self.urlObject.port;
        }

        http.get({
            host: _self.urlObject.hostname,
            port: port
        }, function (res) {
            console.log("success " + res);
            _self.isValid = true;
        }).on("error", function (e) {
            _self.isValid = false;
            throw new Error('invalid URL');
        });

    } else {
        _self.isValid = false;
        throw new Error('invalid URL');
    }

    return url.format(_self.urlObject);
};

WebPage.prototype.getbaseUrl = function () {
    var _self = this;
    var url = _self.parseUrl();
    var path = _self.urlObject.pathname;
    var returnString = url.replace("/"+_self.urlObject.pathname, '');
    returnString = url.replace(_self.urlObject.pathname, '');
    return returnString;
};

exports.WebPage = WebPage;


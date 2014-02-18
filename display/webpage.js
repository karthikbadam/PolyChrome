
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
	_self.isCached = false; 
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
            //console.log("success " + res);
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

/* set the content for the page - caching! */
WebPage.prototype.setContent = function (body) {
    var _self = this;
    _self.body = body;
    _self.isCached = true; 
};

/* get the content after caching */
WebPage.prototype.getContent = function () {
    var _self = this;
    if (_self.isCached) {
        return _self.body;
    }
    return;
};

/* append path */
WebPage.prototype.appendPath = function (path) {
    var _self = this;
    //return function (callback, errback) {
    //    
    //    var baseUrl = _self.getbaseUrl();
    //    var url = _self.getUrl();
    //    
    //    http.get({
    //        host: hostname,
    //        port: port
    //    }, function (res) {
    //        //console.log("success " + res);
    //        _self.isValid = true;
    //        callback(hostname)
    //    }).on("error", function (e) {
    //    });
    //    
    //    
    //} 
}

/* A typical asynchronous method example */
//function fileWrite (filename, data) { return function (callback, errback) {
//  fs.open(filename, "w", 0666)(function (fd) {
//    var totalWritten = 0;
//    function doWrite (_data) {
//      fs.write(fd, _data, 0, 'utf8')(
//        function (written) {
//          totalWritten += written
//          if (totalWritten === _data.length) {
//            fs.close(fd);
//            callback(totalWritten);
//          } else {
//            doWrite(_data.slice(totalWritten));
//          }
//        }, errback);
//    }
//    doWrite(data);
//  }, errback);
//}}
// Use it!
//fileWrite('test', "Hello")(
//  function (written) {
//    console.log(written + " bytes successfully written");
//  },
//  function (err) {
//    throw err;
//  }
//);


exports.WebPage = WebPage;


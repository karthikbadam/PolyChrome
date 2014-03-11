
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var connect = require('connect');
var jsdom = require('jsdom');
var request = require('request');
var url = require('url');
var cheerio = require('cheerio');
var mime = require('mime');
var querystring = require('querystring');

/* cache file for all html files */
var cache = {};

/* display web page class */
var pageclass = require('./display/webpage');
var WebPage = pageclass.WebPage;
var currentPage = null;

/* session control */
var sessionclass = require('./display/polychrome-session');
var PolyChromeSession = sessionclass.PolyChromeSession;
var sessions = {};
var peerIds = [];

/* peer server to give unique id to each peer */
var peer = require('./peer/server');
var PeerServer = peer.PeerServer;

var app = express();
app.engine('.html', require('ejs').__express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

/* opening page */
app.get('/', routes.index);

/* app1 drawing */
app.get('/drawing', routes.drawing);

/* requests for data */
app.get('/data/*', function (req, res) {
    console.log("data request captured: " + req.url);
    var urlString = currentPage.url + req.url;
    if (req.url.charAt(0) === '/') {
        var baseUrl = currentPage.getCurrentBaseUrl();
        urlString = baseUrl + req.url;
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
            urlString = baseUrl + req.url.substr(1);
        }
    }
    request({
        uri: urlString
    }, function (err, response, body) {
        if (err) {
            res.writeHead(400);
        } else {
            res.writeHead(200);
        }
        res.write(response.body);
        res.end();
    });
});

/* image requests captured */
app.get('/images/*', function (req, res) {
    console.log("image request captured: " + req.url);
    var urlString = currentPage.url + req.url;
    if (req.url.charAt(0) === '/') {
        var baseUrl = currentPage.getCurrentBaseUrl();
        urlString = baseUrl + req.url;
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
            urlString = baseUrl + req.url.substr(1);
        }
    }
    request({ uri: urlString }, function (err, response, body) {
        if (err) {
            res.writeHead(400);
        } else {
            res.writeHead(200);
        }
        res.write(response.body);
        res.end();
    });

});

app.get('/img/*', function (req, res) {
    console.log("image request captured: " + req.url);
    var urlString = currentPage.url + req.url;
    if (req.url.charAt(0) === '/') {
        var baseUrl = currentPage.getCurrentBaseUrl();
        urlString = baseUrl + req.url;
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
            urlString = baseUrl + req.url.substr(1);
        }
    }
    console.log("Requesting for " + urlString + ", " + ValidURL(urlString));
    request({
        uri: urlString
    }, function (err, response, body) {
        if (err) {
            res.writeHead(400);
            return;
        } else {
            res.writeHead(200, { "Content-Type": 'image/png', 'Content-Length': body.size }); // Pass in the mime-type
            res.end(body, "binary"); //Stream the file down
        }
    });

});

/* js files requested by the webpage */
app.get('/js/*', function (req, res) {

    console.log("JS request captured: " + req.url);
    var urlString = currentPage.url + req.url;
    if (req.url.charAt(0) === '/') {
        var baseUrl = currentPage.getCurrentBaseUrl();
        urlString = baseUrl + req.url;
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
            urlString = baseUrl + req.url.substr(1);
        }
    }
    request({
        uri: urlString
    }, function (err, response, body) {
        if (err) {
            res.writeHead(400);
        } else {
            res.writeHead(200);
        }
        res.write(response.body);
        res.end();
    });

});

/* load url from login page */
app.post('/loadUrl', function (req, res) {

    var selectedUrl = String(req.body.url);
    console.log("Requested URL -" + selectedUrl);
    var spaceConfiguration = parseInt(req.body.space);
    var displayConfiguration = parseInt(req.body.display);
    var peerId = String(req.body.peerId);

    var page = new WebPage({
        url: selectedUrl,
        spaceConfig: spaceConfiguration,
        displayConfig: displayConfiguration,
        peerId: "blah"
    });

    page.parseUrl();
    currentPage = page;

    var session = new PolyChromeSession({
        page: page,
        peerId: "blah",
        username: "chrome",
        password: "chrome"
    });

    sessions[peerId] = session;
    peerIds.push(peerId);

    var urlEncoding = { 'url': selectedUrl, 'peerId': peerId };
    var toOpen = 'http://localhost:3000/polychrome?' + querystring.stringify(urlEncoding);

    res.write(toOpen);
    res.end();
});

//app.get('/getPage', function (req, res) {

//    var parsedUrl = url.parse(req.url, true); // true to get query as object
//    var params = parsedUrl.query;

//    var selectedUrl = "";

//    var peerId = "";
//    if (JSON.stringify(params) !== '{}') {
//        selectedUrl = String(params.url);
//        peerId = String(params.peerId);
//    }

//    //var parsedUrl = url.parse(req.url, true); // true to get query as object
//    //var params = parsedUrl.query;

//    //var selectedUrl = "http://multiviz.gforge.inria.fr/scatterdice/oscars/";
//    //var spaceConfiguration = 1;
//    //var displayConfiguration = 1;

//    ////var selectedUrl = String(req.body.url);
//    //console.log("Requested URL -" + selectedUrl);
//    ////var spaceConfiguration = parseInt(req.body.space);
//    //var displayConfiguration = parseInt(req.body.display);

//    var page = new WebPage({
//        url: selectedUrl,
//        spaceConfig: 1,
//        displayConfig: 1
//    });

//    page.parseUrl();
//    currentPage = page;

//    var currentPageCache = cache[page.parseUrl()];
//    if (currentPageCache) {
//        console.log('Served from Cache '+page.parseUrl());
//        res.write(currentPageCache);
//        res.end();

//    } else {
//        //request for the webpage content
//        request({ uri: page.parseUrl() }, function (err, response, body) {
//            var isBlocked = 'No';

//            console.log('Served from Internet '+page.parseUrl());
//        
//            // If the page was found...
//            if (!err && response.statusCode == 200) {
//                // Grab the headers
//                var headers = response.headers;

//                // Grab the x-frame-options header if it exists
//                var xFrameOptions = headers['x-frame-options'] || '';

//                // Normalize the header to lowercase
//                xFrameOptions = xFrameOptions.toLowerCase();

//                // Check if it's set to a blocking option
//                if (
//     			xFrameOptions === 'sameorigin' ||
//     			xFrameOptions === 'deny'
//     			) {
//                    isBlocked = 'Yes';
//                }

//            } else {
//                res.end("PAGE NOT FOUND");
//            }


//            /* using cheerio to manipulate the DOM */
//            $ = cheerio.load(body);

//            $('script').each(function () {
//                var link = $(this).attr('src');
//                if (link !== undefined && link.indexOf("http") == -1) {
//                    var url = selectedUrl + link;
//                    if (link.charAt(0) === '/') {
//                        var baseUrl = page.getbaseUrl();
//                        page.setCurrentBaseUrl(baseUrl);
//                        url = baseUrl + link;
//                        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
//                            url = baseUrl + link.substr(1);
//                        }
//                    } else {
//                        if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
//                            url = selectedUrl + "/" + link;
//                        }
//                    }
//                    console.log(url);
//                    $(this).attr('src', url);
//                }
//            });

//            $('link').each(function () {
//                var css = $(this).attr('href');
//                if (css.indexOf(".com") == -1) {
//                    var url = selectedUrl + css;
//                    if (css.charAt(0) === '/') {
//                        var baseUrl = page.getbaseUrl();
//                        currentPage.setCurrentBaseUrl(baseUrl);
//                        url = baseUrl + css;
//                        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
//                            url = baseUrl + css.substr(1);
//                        }
//                    } else {
//                        if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
//                            url = selectedUrl + "/" + css;
//                        }
//                    }
//                    console.log(url);
//                    $(this).attr('href', url);
//                }
//            });

//            $('image').each(function () {
//                var image = $(this).attr('href');
//                if (image !== undefined && image.indexOf(".com") == -1) {
//                    var url = selectedUrl + image;
//                    if (image.charAt(0) === '/') {
//                        var baseUrl = page.getbaseUrl();
//                        currentPage.setCurrentBaseUrl(baseUrl);
//                        url = baseUrl + image;
//                        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
//                            url = baseUrl + image.substr(1);
//                        }
//                    } else {
//                        if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
//                            url = selectedUrl + "/" + image;
//                        }
//                    }
//                    console.log(url);
//                    $(this).attr('href', url);
//                }
//            });

//            $('a').each(function () {
//                var hyperlink = $(this).attr('href');
//                if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
//                    var url = selectedUrl + hyperlink;
//                    if (hyperlink.charAt(0) === '/') {
//                        var baseUrl = page.getbaseUrl();
//                        currentPage.setCurrentBaseUrl(baseUrl);
//                        url = baseUrl + hyperlink;
//                        if (baseUrl.charAt(baseUrl.length - 1) === '/') {
//                            url = baseUrl + hyperlink.substr(1);
//                        }
//                    } else {
//                        if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
//                            url = selectedUrl + "/" + hyperlink;
//                        }
//                    }
//                    console.log(url);
//                    $(this).attr('href', url);
//                }
//            });

//            $('body').prepend('<link rel="stylesheet" href="stylesheets/polychrome_style.css"></link>');
//            $('head').append('<link rel="shortcut icon" href="images/polychrome-icon.png" />');
//            $('body').prepend('<script type="text/javascript" src="javascripts/polychrome-peer.js"></script>');
//            $('body').prepend('<script type="text/javascript" src="javascripts/polychrome-accesspanel.js"></script>');
//            $('body').attr('id', 'chrome_body');

//            var polychrome_panel = fs.readFileSync("public/renderings/accesspanel.txt", 'utf8');
//            $('body').append(polychrome_panel.toString());

//            cache[page.parseUrl()] = '<html>' + $.html() + '</html>';
//            res.write('<html>' + $.html() + '</html>');
//            res.end();
//        });
//    }
//});


app.get('/polychrome', function (req, res) {

    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var params = parsedUrl.query;

    var selectedUrl = "";

    var peerId = "";
    if (JSON.stringify(params) !== '{}') {
        selectedUrl = String(params.url);
        peerId = String(params.peerId);
    }

    var page = new WebPage({
        url: selectedUrl,
        spaceConfig: 1,
        displayConfig: 1
    });

    page.parseUrl();
    currentPage = page;

    var currentPageCache = cache[page.parseUrl()];
    if (currentPageCache) {
        console.log('Served from Cache ' + page.parseUrl());
        res.write(currentPageCache);
        res.end();

    } else {

        //Tell the request that we want to fetch youtube.com, send the results to a callback function
        request({ uri: selectedUrl }, function (err, response, body1) {
            var isBlocked = 'No';

            // If the page was found...
            if (!err && response.statusCode == 200) {
                // Grab the headers
                var headers = response.headers;

                // Grab the x-frame-options header if it exists
                var xFrameOptions = headers['x-frame-options'] || '';

                // Normalize the header to lowercase
                xFrameOptions = xFrameOptions.toLowerCase();

                // Check if it's set to a blocking option
                if (
					xFrameOptions === 'sameorigin' ||
					xFrameOptions === 'deny'
					) {
                    isBlocked = 'Yes';
                }

            } else {

                res.end("Page NOT FOUND");
            }

            //Just a basic error check
            if (err && response.statusCode !== 200) {
                console.log('Request error');
            }

            body1 = response.body;

            jsdom.env({
                html: body1,
                scripts: ['http://code.jquery.com/jquery.js', 'http://localhost:3000/javascripts/polychrome-peer.js', 'http://localhost:3000/javascripts/polychrome-accesspanel.js'],
                done: function (err, window) {

                    var $ = window.jQuery;

                    $('script').each(function () {
                        var link = $(this).attr('src');
                        if (link !== undefined && link.indexOf("http") == -1) {
                            var url = selectedUrl + link;
                            if (link.charAt(0) === '/') {
                                var baseUrl = page.getbaseUrl();
                                page.setCurrentBaseUrl(baseUrl);
                                url = baseUrl + link;
                                if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                                    url = baseUrl + link.substr(1);
                                }
                            } else {
                                if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
                                    url = selectedUrl + "/" + link;
                                }
                            }
                            console.log(url);
                            $(this).attr('src', url);
                        }
                    });

                    $('link').each(function () {
                        var css = $(this).attr('href');
                        if (css.indexOf(".com") == -1) {
                            var url = selectedUrl + css;
                            if (css.charAt(0) === '/') {
                                var baseUrl = page.getbaseUrl();
                                currentPage.setCurrentBaseUrl(baseUrl);
                                url = baseUrl + css;
                                if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                                    url = baseUrl + css.substr(1);
                                }
                            } else {
                                if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
                                    url = selectedUrl + "/" + css;
                                }
                            }
                            console.log(url);
                            $(this).attr('href', url);
                        }
                    });

                    $('image').each(function () {
                        var image = $(this).attr('href');
                        if (image !== undefined && image.indexOf(".com") == -1) {
                            var url = selectedUrl + image;
                            if (image.charAt(0) === '/') {
                                var baseUrl = page.getbaseUrl();
                                currentPage.setCurrentBaseUrl(baseUrl);
                                url = baseUrl + image;
                                if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                                    url = baseUrl + image.substr(1);
                                }
                            } else {
                                if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
                                    url = selectedUrl + "/" + image;
                                }
                            }
                            console.log(url);
                            $(this).attr('href', url);
                        }
                    });

                    $('a').each(function () {
                        var hyperlink = $(this).attr('href');
                        if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
                            var url = selectedUrl + hyperlink;
                            if (hyperlink.charAt(0) === '/') {
                                var baseUrl = page.getbaseUrl();
                                currentPage.setCurrentBaseUrl(baseUrl);
                                url = baseUrl + hyperlink;
                                if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                                    url = baseUrl + hyperlink.substr(1);
                                }
                            } else {
                                if (selectedUrl.charAt(selectedUrl.length - 1) !== '/') {
                                    url = selectedUrl + "/" + hyperlink;
                                }
                            }
                            console.log(url);
                            $(this).attr('href', url);
                        }
                    });

                    $('body').prepend('<link rel="stylesheet" href="stylesheets/polychrome-style.css"></link>');
                    $('head').prepend('<link rel="shortcut icon" href="images/polychrome-icon.png" />');
                    $('body').attr('id', 'chrome_body');

                    var polychrome_panel = fs.readFileSync("public/renderings/PolyChrome-feedback.html", 'utf8');
                    $('body').append(polychrome_panel.toString());
                    //$('body').append('<script>var peerId = "' + peerId + '"; </script>');
                    
                    /* caching the page */
                    //cache[page.parseUrl()] = '<html>' + $('html').html() + '</html>';            
                    
                    res.write('<html>' + $('html').html() + '</html>');
                    res.end();

                }
            });
        });
    }
});

/* wild card for any other requests */
app.get('/*', function (req, res) {

    if (currentPage && req.url.indexOf("polychrome") === -1) {
        console.log("request captured by wildcard: " + req.url);
        var urlString = currentPage.url + req.url;
        if (req.url.charAt(0) === '/') {
            var baseUrl = currentPage.getCurrentBaseUrl();
            urlString = baseUrl + req.url;
            if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                urlString = baseUrl + req.url.substr(1);
            }
        }

        console.log("Requesting for " + urlString + ", " + ValidURL(urlString));
        request({
            uri: urlString
        }, function (err, response, body) {
            if (err) {
                res.writeHead(400);
                console.log("400- request failed");
            } else {
                res.writeHead(200);
            }
            res.write(response.body);
            res.end();
        });
    }
});


/* pattern check a URL */
var ValidURL = function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    if (!pattern.test(str)) {
        alert("Please enter a valid URL.");
        return false;
    } else {
        return true;
    }
}


/* polychrome listen */
var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


/* peer server */
new PeerServer({
    port: 8000
});

/* socket io */
var io = require('socket.io').listen(httpserver);

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {

        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });
});

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

/* display web page class */
var pageclass = require('./display/webpage');
var WebPage = pageclass.WebPage;
var currentPage = null;


/* peer server to give unique id to each peer */
var peer = require('./peer/server');
var PeerServer = peer.PeerServer;

/* Mapping between client ID and session */


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

app.get('/', routes.index);
app.get('/users', user.list);

/* requests for data */
app.get('/data/*', function (req, res) {
    console.log("data request captured: " + req.url);
    request({
        uri: currentPage.url + req.url
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
    request({ uri: currentPage.url + req.url }, function (err, response, body) {
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
    console.log("Requesting for " + urlString + ", " + ValidURL(urlString));
    request({
        uri: urlString
    }, function (err, response, body) {
        if (err) {
            res.writeHead(400);
            return;
        } else {
            res.writeHead(200, { "Content-Type": 'image/png',  'Content-Length': body.size }); // Pass in the mime-type
            res.end(body, "binary"); //Stream the file down
        }
    });

});

/* js files requested by the webpage */
app.get('/js/*', function (req, res) {
    console.log("JS request captured: " + req.url);
    request({
        uri: currentPage.getbaseUrl() + req.url
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

    var page = new WebPage({
        url: selectedUrl,
        spaceConfig: spaceConfiguration,
        displayConfig: displayConfiguration
    });

    page.parseUrl();
    currentPage = page;

    //request for the webpage content
    request({ uri: page.parseUrl() }, function (err, response, body) {
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
            res.end("PAGE NOT FOUND");
        }


        /* using cheerio to manipulate the DOM */
        $ = cheerio.load(body);
        console.log(body);

        $('script').each(function () {
            var link = $(this).attr('src');
            if (link !== undefined && link.indexOf("http") == -1) {
                var url = selectedUrl + link;
                console.log(url);
                $(this).attr('src', url);
            }
        });

        $('link').each(function () {
            var css = $(this).attr('href');
            if (css.indexOf(".com") == -1) {
                var url = selectedUrl + css;
                console.log(url);
                $(this).attr('href', url);
            }
        });

        $('image').each(function () {
            var image = $(this).attr('href');
            if (image !== undefined && image.indexOf(".com") == -1) {
                var url = selectedUrl + image;
                console.log(url);
                $(this).attr('href', url);
            }
        });

        $('a').each(function () {
            var hyperlink = $(this).attr('href');
            if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
                var url = selectedUrl + hyperlink;
                console.log(url);
                $(this).attr('href', url);
            }
        });


        $('head').append('<link rel="stylesheet" href="/stylesheets/pc.css"></link>');
        $('head').append('<link rel="stylesheet" href="/stylesheets/polychrome_style.css"></link>');
        $('body').append('<script type="text/javascript" src="/javascripts/peer.js"></script>');
        $('body').append('<script type="text/javascript" src="/javascripts/polychrome-accesspanel.js"></script>');
        $('body').attr('id', 'chrome_body');
        var polychrome_panel = fs.readFileSync("public/renderings/accesspanel.txt", 'utf8');
        $('body').append(polychrome_panel.toString());

        console.log($.html());
        res.write('<html>' + $.html() + '</html>');
        res.end();

        //Send the body param as the HTML code we will parse in jsdom
        //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
        //jsdom.env({
        //    html: response.body,
        //    scripts: ['http://code.jquery.com/jquery.js', 'http://localhost:3000/javascripts/peer.js', 'http://localhost:3000/javascripts/polychrome-accesspanel.js'],
        //    done: function (err, window) {
        //        //Use jQuery just as in a regular HTML page
        //        var $ = window.jQuery;


        //          $('script').each(function() {
        //           	var link = $(this).attr('src');
        //           	if (link!== undefined && link.indexOf("http") == -1) {
        //         	  var url = selectedUrl+link;
        //         	  console.log(url);
        //         	  $(this).attr('src', url);
        //         	}
        //         });	

        //         $('link').each(function () {
        //            var css = $(this).attr('href');
        //            if (css.indexOf(".com") == -1) {
        //                var url = selectedUrl + css;
        //                console.log(url);
        //                $(this).attr('href', url);
        //            }
        //        });

        //        $('image').each(function () {
        //            var image = $(this).attr('href');
        //            if (image !== undefined && image.indexOf(".com") == -1) {
        //                var url = selectedUrl + image;
        //                console.log(url);
        //                $(this).attr('href', url);
        //            }
        //        });

        //        $('a').each(function () {
        //            var hyperlink = $(this).attr('href');
        //            if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
        //                var url = selectedUrl + hyperlink;
        //                console.log(url);
        //                $(this).attr('href', url);
        //            }
        //        });

        //        //$('a').each(function () {
        //        //    var hyperlink = $(this).attr('href');
        //        //    if (hyperlink !== undefined && hyperlink.indexOf(".co.uk") == -1 && hyperlink.indexOf(".com") == -1 && hyperlink.indexOf(".net") == -1 && hyperlink.indexOf(".org") == -1) {
        //        //        var url = selectedUrl + hyperlink;
        //        //        console.log(url);
        //        //        $(this).attr('href', url);
        //        //    }
        //        //});

        //        //var appendScript1 = fs.readFileSync("/public/javasripts/polychrome-accesspanel.js");
        //        //var appendScript = '<script>var myclick = false; $(document).on("click", function(evt) { if (evt.target.nodeName !== "circle") { return;} alert("captured event "+myclick); var elem = document.elementFromPoint(evt.pageX, evt.pageY); if (!myclick) { var clickevt = document.createEvent("MouseEvents"); clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null); alert("generated event "+ myclick); myclick = true; /* elem.dispatchEvent(clickevt); */ } else {myclick = false;} }); </script>'
        //        //$('head').append('<meta name="viewport" content="width=1320" />');

        //        //console.log("Head is " + $('head').toString());
        //        //$('body').append('<script type="text/javascript" src="/javascripts/polychrome-accesspanel.js"></script>');
        //        $('body').append('<link rel="stylesheet" href="/stylesheets/pc.css"></link>');
        //        $('body').append('<link rel="stylesheet" href="/stylesheets/polychrome_style.css"></link>');
        //        $('body').attr('id', 'chrome_body');
        //        var polychrome_panel = fs.readFileSync("public/renderings/accesspanel.txt", 'utf8');
        //        $('body').append(polychrome_panel.toString());
        //        res.write('<html>' + $('html').html() + '</html>');
        //        res.end();

        //    }
        //});
    });
});

app.get('/getPage', function (req, res) {
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var params = parsedUrl.query;

    var selectedUrl = "http://multiviz.gforge.inria.fr/scatterdice/oscars/";
    var spaceConfiguration = 1;
    var displayConfiguration = 1;

    //var selectedUrl = String(req.body.url);
    console.log("Requested URL -" + selectedUrl);
    //var spaceConfiguration = parseInt(req.body.space);
    //var displayConfiguration = parseInt(req.body.display);

    var page = new WebPage({
        url: selectedUrl,
        spaceConfig: spaceConfiguration,
        displayConfig: displayConfiguration
    });

    page.parseUrl();
    currentPage = page;

    //request for the webpage content
    request({ uri: page.parseUrl() }, function (err, response, body) {
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
            res.end("PAGE NOT FOUND");
        }


        /* using cheerio to manipulate the DOM */
        $ = cheerio.load(body);
        console.log(body);

        $('script').each(function () {
            var link = $(this).attr('src');
            if (link !== undefined && link.indexOf("http") == -1) {
                var url = selectedUrl + link;
                console.log(url);
                $(this).attr('src', url);
            }
        });

        $('link').each(function () {
            var css = $(this).attr('href');
            if (css.indexOf(".com") == -1) {
                var url = selectedUrl + css;
                console.log(url);
                $(this).attr('href', url);
            }
        });

        $('image').each(function () {
            var image = $(this).attr('href');
            if (image !== undefined && image.indexOf(".com") == -1) {
                var url = selectedUrl + image;
                console.log(url);
                $(this).attr('href', url);
            }
        });

        $('a').each(function () {
            var hyperlink = $(this).attr('href');
            if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
                var url = selectedUrl + hyperlink;
                console.log(url);
                $(this).attr('href', url);
            }
        });


        $('head').append('<link rel="stylesheet" href="/stylesheets/pc.css"></link>');
        $('head').append('<link rel="stylesheet" href="/stylesheets/polychrome_style.css"></link>');
        $('body').append('<script type="text/javascript" src="/javascripts/peer.js"></script>');
        $('body').append('<script type="text/javascript" src="/javascripts/polychrome-accesspanel.js"></script>');
        $('body').attr('id', 'chrome_body');
        var polychrome_panel = fs.readFileSync("public/renderings/accesspanel.txt", 'utf8');
        $('body').append(polychrome_panel.toString());

        console.log($.html());
        res.write('<html>' + $.html() + '</html>');
        res.end();
    });
});


//app.get('/polychrome', function (req, res) {

//    var parsedUrl = url.parse(req.url, true); // true to get query as object
//    var params = parsedUrl.query;

//    var selected_url = "http://www.youtube.com/";
//    var screen_count = 1;
//    var screen_index = 1;

//    if (JSON.stringify(params) !== '{}') {
//        selected_url = String(params.selected_url);
//        screen_count = params.screen_count;
//        screen_index = params.screen_index;
//    }

//    if (selected_url.indexOf("http://") <= -1) {
//        res.end("Page NOT FOUND!!");

//    }

//    if (selected_url.indexOf(".com") <= -1 && selected_url.indexOf(".org") <= -1 && selected_url.indexOf(".edu") <= -1) {
//        res.end("Page NOT FOUND!!");
//    }


//    console.log("selected URl is " + selected_url);

//    //Tell the request that we want to fetch youtube.com, send the results to a callback function
//    request({ uri: selected_url }, function (err, response, body1) {
//        var isBlocked = 'No';

//        // If the page was found...
//        if (!err && response.statusCode == 200) {
//            // Grab the headers
//            var headers = response.headers;

//            // Grab the x-frame-options header if it exists
//            var xFrameOptions = headers['x-frame-options'] || '';

//            // Normalize the header to lowercase
//            xFrameOptions = xFrameOptions.toLowerCase();

//            // Check if it's set to a blocking option
//            if (
//					xFrameOptions === 'sameorigin' ||
//					xFrameOptions === 'deny'
//					) {
//                isBlocked = 'Yes';
//            }

//        } else {

//            res.end("Page NOT FOUNd");
//        }

//        console.log('Blocked --' + isBlocked);

//        //Just a basic error check
//        if (err && response.statusCode !== 200) {
//            console.log('Request error');
//        }
//        body1 = response.body;


//        //Send the body param as the HTML code we will parse in jsdom
//        //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
//        jsdom.env({
//            html: body1,
//            scripts: ['http://code.jquery.com/jquery.js', '/javascripts/peer.js', '/javascripts/polychrome-accesspanel.js'],
//            done: function (err, window) {
//                //Use jQuery just as in a regular HTML page
//                var $ = window.jQuery;

//                // $('script').each(function() {
//                //   	var link = $(this).attr('src');
//                //   	if (link!== undefined && link.indexOf("http") == -1) {
//                // 	  var url = "http://vis.movievis.com/"+link;
//                // 	  console.log(url);
//                // 	  $(this).attr('src', url);
//                // 	}
//                // });	

//                $('link').each(function () {
//                    var css = $(this).attr('href');
//                    if (css.indexOf(".com") == -1) {
//                        var url = selected_url + css;
//                        console.log(url);
//                        $(this).attr('href', url);
//                    }
//                });

//                $('image').each(function () {
//                    var image = $(this).attr('href');
//                    if (image !== undefined && image.indexOf(".com") == -1) {
//                        var url = selected_url + image;
//                        console.log(url);
//                        $(this).attr('href', url);
//                    }
//                });

//                $('a').each(function () {
//                    var hyperlink = $(this).attr('href');
//                    if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
//                        var url = selected_url + hyperlink;
//                        console.log(url);
//                        $(this).attr('href', url);
//                    }
//                });

//                //var appendScript1 = fs.readFileSync("/public/javasripts/polychrome-accesspanel.js");
//                //var appendScript = '<script>var myclick = false; $(document).on("click", function(evt) { if (evt.target.nodeName !== "circle") { return;} alert("captured event "+myclick); var elem = document.elementFromPoint(evt.pageX, evt.pageY); if (!myclick) { var clickevt = document.createEvent("MouseEvents"); clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null); alert("generated event "+ myclick); myclick = true; /* elem.dispatchEvent(clickevt); */ } else {myclick = false;} }); </script>'

//                $('head').append('<link rel="stylesheet" href="/stylesheets/pc.css"></link>');
//                $('head').append('<link rel="stylesheet" href="/stylesheets/polychrome_style.css"></link>');

//                $('body').attr('id', 'chrome_body');
//                var polychrome_panel = fs.readFileSync("public/renderings/accesspanel.txt", 'utf8');
//                $('body').append(polychrome_panel.toString());
//                res.write('<html>' + $('html').html() + '</html>');
//                res.end();

//            }
//        });
//    });
//});

/* wild card for any other requests */
app.get('/*', function (req, res) {

    if (currentPage) {
        console.log("request captured by wildcard: " + req.url);
        req.url = req.url.substr(1);
        var urlString = currentPage.url + req.url;
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

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

new PeerServer({
    port: 8000
});

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var connect = require('connect');


var peer = require('./peer/server');
var PeerServer = peer.PeerServer;

var jsdom = require('jsdom');
var request = require('request');
var url = require('url');

var app = express();
app.engine('.html', require('ejs').__express);

var polychrome_append = '<button id="toggle" class="normal"></button>				<div id="actions">						<div id="login">				<form action="http://localhost:3000/login" method="post">			 <input type="text" name="username" id="username" placeholder="[Username]"/>			 <input type="password" name="password" id="password" placeholder="[Password]">			 <input type="submit" value="Log In" id="login_submit"/>			 <input type="button" value="Sign Up" id="signup_submit"/>				</form>			</div>			<div id: "url_info">					<ul>				<input type="text" id="url" placeholder="[Enter URL here]">				<button id="url_submit"></button>				</ul>				<ul>					Your PeerJS ID is <span id="pid"></span>				</ul>				<!-- <ul>					Connect to a peer:					<input type="text" id="rid" placeholder="Someone elses id">					<input class="button" type="button" id="connect">				</ul> -->				<ul id="results"></ul>			</div>			<div id="screen-options">				<ul>					<p> Select Screen Type:</p>				</ul>	 				<div id="multiple-screen">					<ul>					<input type="button" id="one-screen">					</ul>					</div>				<div id="multiple-screen">					<ul>					<input type="button" class="multiple-screen-element" id="two-screen-left">					<input type="button" class="multiple-screen-element" id="two-screen-right">					</ul>					</div>				<div id="multiple-screen">						<ul id="multiple-screens">					<input type="button" class="multiple-screen-element" id="four-screen-left-top">					<input type="button" class="multiple-screen-element" id="four-screen-right-top">					</ul>						<ul id="multiple-screens">					<input type="button" class="multiple-screen-element" id="four-screen-left-bottom">					<input type="button" class="multiple-screen-element" id="four-screen-right-bottom">					</ul>					</div>				<div id="multiple-screen">							<ul id="multiple-screens">					<input type="button" class="multiple-screen-element" id="six-screen-left-top">					<input type="button" class="multiple-screen-element" id="six-screen-middle-top">					<input type="button" class="multiple-screen-element" id="six-screen-right-top">					</ul>											<ul id="multiple-screens">					<input type="button" class="multiple-screen-element" id="six-screen-left-bottom">					<input type="button" class="multiple-screen-element" id="six-screen-middle-bottom">					<input type="button" class="multiple-screen-element" id="six-screen-right-bottom">					</ul>					</div>			</div>		</div>';

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

app.get('/data/*', function(req, res) {
	console.log("request captured: " + req.url);
	request({
		uri: 'http://vis.movievis.com' + req.url
	}, function(err, response, body) {
		res.writeHead(200);
		res.write(response.body);
		res.end();
	});
});


// app.get('/images/*', function (req, res) {
// 	console.log("request captured: "+ req.url);
//   	request({uri: 'http://vis.movievis.com'+req.url}, function(err, response, body) {
//   		res.writeHead(200); 
// 		res.write(response.body); 
// 		res.end(); 
//   	});

// });


app.get('/js/*', function(req, res) {
	console.log("request captured: " + req.url);
	request({
		uri: 'http://vis.movievis.com' + req.url
	}, function(err, response, body) {
		res.writeHead(200);
		res.write(response.body);
		res.end();
	});

});


app.get('/polychrome', function(req, res) {

	var parsedUrl = url.parse(req.url, true); // true to get query as object
	var params = parsedUrl.query;

	var selected_url = "http://vis.movievis.com/";
	var screen_count = 1;
	var screen_index = 1;

	if (JSON.stringify(params) !== '{}') {
		selected_url = String(params.selected_url);
		screen_count = params.screen_count;
		screen_index = params.screen_index;
	}

	if (selected_url.indexOf("http://") <= -1) {
		res.end("Page NOT FOUND!!");

	}

	if (selected_url.indexOf(".com") <= -1 && selected_url.indexOf(".org") <= -1 && selected_url.indexOf(".edu") <= -1) {
		res.end("Page NOT FOUND!!");
	}


	console.log("selected URl is " + selected_url);

	//Tell the request that we want to fetch youtube.com, send the results to a callback function
	request({
		uri: selected_url
	}, function(err, response, body1) {
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
			res.end("Page NOT FOUNd");
		}

		console.log('Blocked --' + isBlocked);


		var self = this;

		self.items = new Array();
		//Just a basic error check
		if (err && response.statusCode !== 200) {
			console.log('Request error');
		}
		body1 = response.body;


		//Send the body param as the HTML code we will parse in jsdom
		//also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
			html: body1,
			scripts: ['http://code.jquery.com/jquery.js', '/javascripts/peer.js', '/javascripts/polychrome-accesspanel.js'],
			done: function(err, window) {
				//Use jQuery just as in a regular HTML page
				var $ = window.jQuery;

				// 	        $('script').each(function() {
				//   	var link = $(this).attr('src');
				//   	if (link!== undefined && link.indexOf("http") == -1) {
				// 	  var url = "http://vis.movievis.com/"+link;
				// 	  console.log(url);
				// 	  $(this).attr('src', url);
				// 	}
				// });	

				$('link').each(function() {
					var css = $(this).attr('href');
					if (css.indexOf(".com") == -1) {
						var url = selected_url + css;
						console.log(url);
						$(this).attr('href', url);
					}
				});

				$('image').each(function() {
					var image = $(this).attr('href');
					if (image !== undefined && image.indexOf(".com") == -1) {
						var url = selected_url + image;
						console.log(url);
						$(this).attr('href', url);
					}
				});

				$('a').each(function() {
					var hyperlink = $(this).attr('href');
					if (hyperlink !== undefined && hyperlink.indexOf(".com") == -1) {
						var url = selected_url + hyperlink;
						console.log(url);
						$(this).attr('href', url);
					}
				});

				//var appendScript1 = fs.readFileSync("/public/javasripts/polychrome-accesspanel.js");
				//var appendScript = '<script>var myclick = false; $(document).on("click", function(evt) { if (evt.target.nodeName !== "circle") { return;} alert("captured event "+myclick); var elem = document.elementFromPoint(evt.pageX, evt.pageY); if (!myclick) { var clickevt = document.createEvent("MouseEvents"); clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null); alert("generated event "+ myclick); myclick = true; /* elem.dispatchEvent(clickevt); */ } else {myclick = false;} }); </script>'

				$('head').append('<link rel="stylesheet" href="/stylesheets/pc.css"></link>');
				$('head').append('<link rel="stylesheet" href="/stylesheets/polychrome_style.css"></link>');

				$('body').attr('id', 'chrome_body');
				$('body').append(polychrome_append);

				//$('body').append(appendScript);

				res.write('<html>' + $('html').html() + '</html>');
				res.end();
			}
		});
	});
});



http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

new PeerServer({
	port: 9000
});
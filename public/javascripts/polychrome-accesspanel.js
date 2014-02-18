/**
 * @author Karthik Badam
 * created in November 2013
 */
 
var screenCount = 1;
var screenIndex = 1;
var myclick = false;

function makeMessage(eventType, message) {
	var data = new Object();

	//message for click events 
	if (eventType == "click") {
		data.eventType = "click";
		data.message = message;
	}

	//message for scroll events
	if (eventType == "scroll") {
		data.eventType = "scroll";
	}

	return data;
}

//arraylist of all connections
var connections = [];

function randomString(len, charSet) {
	charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
}

//once you get some data on the peerjs connection
function onData(data) {
	//alert(data);
	if (data.eventType == "click") {
		//var url = domain + data.message;
		//load_page(url);
		if (!myclick) {
			myclick = true;
			var target = data.target;
			var posX = data.posX - window.pageXOffset;
			var posY = data.posY - window.pageYOffset; 
			var elem = document.elementFromPoint(posX, posY);
			console.log(posX +", "+ posY+", "+elem);
			
			if (elem === null) {
				var items = document.getElementsByTagName("*");
				for (var i = items.length; i--;) {
				    var temp_elem = items[i];
				    var rect = temp_elem.getBoundingClientRect();
				    var rect_width = rect.right - rect.left;
				    var rect_height = rect.bottom - rect.top;
				    if (Math.abs(posX - rect.left) <= rect_width && Math.abs(posY - rect.top) <= rect_height && temp_elem.nodeName === target) {
				    	elem = temp_elem;
				    	//alert("found"+temp_elem.nodeName);	
				    }
				}
			}

			var clickevt = document.createEvent("MouseEvents");
			clickevt.initMouseEvent(data.eventType, true, true, window, 1, posX, posY, posX, posY, false, false, false, false, 0, null);
			console.log ("generated event " + myclick);
			elem.dispatchEvent(clickevt); 
			
		} else {
			myclick = false;
		}
	}
	if (data.eventType == "scroll") {
		$(window).scroll();
	}
}

//on connection 
function connect(conn) {
	conn.on('open', function() {
		connections.push(conn);
		alert("Now connected to " + conn.peer);
		//first_connection(conn);
	});

	conn.on('data', function(data) {
		if (data != null)
			onData(data);

	});
}

//TODO change me to work with a server
var randomValue = randomString(5);
var peer = new Peer({
	host: 'localhost',
	port: '8000'
});

peer.on('open', function(id, clientIds) {
	$('#pid').text(id);
	console.log(clientIds);

	var peer1 = clientIds.split(",");
	console.log(peer1[0]);
	peer1.forEach(function(peerid) {
		var conn = peer.connect(peerid);
		conn.on('open', function() {
			connections.push(conn);
			alert("Now connected to " + conn.peer);
			//first_connection(c);
		});

		conn.on('data', function(data) {
			if (data != null)
				onData(data);
		});

	})
});

//make sure that peerjs connections are handled by the connect function
peer.on('connection', connect);
var domain = null;

// function load_page(url) {

// 	if ($('#ifrm1').length == 0){
//         alert('Please select a screen option');
//         return;
//     }

//     //parse url to get domain
//     if(domain == null) {
// 		var url_parts = url.split("/");
// 	    url_parts.forEach(function(url_part) {
// 	    	if ((url_part.indexOf(".org") > 0) || (url_part.indexOf(".com") > 0) ||
// 	    			(url_part.indexOf(".edu")  > 0 ) || (url_part.indexOf(".co.") > 0)) {
// 	    		console.log(url_part);
// 	    		domain = url_part;
// 	    	}
// 	    });
// 	}

// 	var filename = null;
// 	var data = 	{
// 		str : url
// 	};

// 	$.ajax({
//         type: "POST",
//         url: "/polychrome1.0/php/downloadpage.php",
//         data: data,
//         cache: false,
//         success: function(data)
//         {
//         	filename = "/polychrome1.0/php/"+data;

//         	$('#ifrm1').attr('src', filename);

// 		    $('#ifrm1').load(function() {

// 		    	$('#ifrm1').contents().find('a').each(function() {
// 				  var href = $(this).attr('href');
// 				  $(this).click(function() { 
// 				  	var url = domain+href;
// 				  	load_page(url);

// 				  	//multicast
// 				  	var data = makeMessage("click", href);
// 				  	connections.forEach(function(connection) {
// 				  		connection.send(data);
// 				  	});		

// 				   }).removeAttr('href');
// 				});
// 		    });
// 		}
//     });

// }


//change this when deployed
var hostname = "localhost";
var port = "8000";


function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}

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
}
	
$(document).ready(function() {
	$(document).on("click", function(evt) {
		
		console.log("captured event " + myclick);
		
		var elem = document.elementFromPoint(evt.pageX, evt.pageY);

		if (!myclick) {
			//myclick = true;
			var toSend = new Object();
			toSend.eventType = "click";
			toSend.target = evt.target.nodeName;
			toSend.posX = evt.pageX;
			toSend.posY = evt.pageY; 
			connections.forEach(function(connection) {
		  		connection.send(toSend);
		  	});	

			//var clickevt = document.createEvent("MouseEvents");
			//clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null);
			//alert("generated event " + myclick);
			// /* elem.dispatchEvent(clickevt); */
		} else {
			myclick = false;
		}
	});

    $(document).on("move", function(evt) {
		
		console.log("captured event " + myclick);
		
		var elem = document.elementFromPoint(evt.pageX, evt.pageY);

		if (!myclick) {
			//myclick = true;
			var toSend = new Object();
			toSend.eventType = "move";
			toSend.target = evt.target.nodeName;
			toSend.posX = evt.pageX;
			toSend.posY = evt.pageY; 
            console.log("Move at - "+ toSend.posX+", "+toSend.posY);

			connections.forEach(function(connection) {
		  		connection.send(toSend);
		  	});	

			//var clickevt = document.createEvent("MouseEvents");
			//clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null);
			//alert("generated event " + myclick);
			// /* elem.dispatchEvent(clickevt); */
		} else {
			myclick = false;
		}
	});

    $(document).on("click", function(evt) {
		
		console.log("captured event " + myclick);
		
		var elem = document.elementFromPoint(evt.pageX, evt.pageY);

		if (!myclick) {
			//myclick = true;
			var toSend = new Object();
			toSend.eventType = "click";
			toSend.target = evt.target.nodeName;
			toSend.posX = evt.pageX;
			toSend.posY = evt.pageY; 
			connections.forEach(function(connection) {
		  		connection.send(toSend);
		  	});	

			//var clickevt = document.createEvent("MouseEvents");
			//clickevt.initMouseEvent("click", true, true, window, 1, evt.pageX, evt.pageY, evt.pageX, evt.pageY, false, false, false, false, 0, null);
			//alert("generated event " + myclick);
			// /* elem.dispatchEvent(clickevt); */
		} else {
			myclick = false;
		}
	});



	$("#toggle").click(function() {
		$('#toggle').toggleClass('active');
		$("#actions").slideToggle("slow");
	});

	$("#url").keyup(function(e) {
		var code = e.which; // recommended to use e.which, it's normalized across browsers
		if (code == 13) e.preventDefault();
		if (code == 32 || code == 13 || code == 188 || code == 186) {
			//load_page($(this).val());
			//send url and screen config to polychrome nodejs server
			var send_items = {};
			send_items["selected_url"] = $(this).val();
			send_items["screen_count"] = screenCount;
			send_items["screen_index"] = screenIndex;
			$.ajax({
				url: '/polychrome',
				type: 'GET',
				data: send_items,
				contentType: "application/x-www-form-urlencoded",
				dataType: "json",
				success: function(data) {
					console.log(data);
					$('html').html(data);
				},
				error: function() {},
			});
		}
	});

	$("#url_submit").click(function() {
		//load_page($("#url").val());
		var send_items = {};
		send_items["selected_url"] = $('#url').val();
		send_items["screen_count"] = screenCount;
		send_items["screen_index"] = screenIndex;


		$.ajax({
			url: '/getPage',
			type: 'GET',
			data: send_items,
			contentType: "application/x-www-form-urlencoded",
			dataType: "json",
			success: function(data) {
				$('html').html(data);
			},
			error: function() {},
		});

		// $.get('/polychrome', JSON.stringify(send_items))
		// 	.done(function () {
		// 		console.log("changed url");
		// 	}); 
	});


	//login management
	$("#login_submit").click(function() {
		// var username = $("#username").val();
		// var password = $("#password").val();
		// var message = [];
		// message.push({id: username, password: password});	
		// console.log(message);

		// var http = new XMLHttpRequest();
		// var url = 'http://' + hostname + ':' + port + '/login';
		// http.open('post', url, true);
		// http.setRequestHeader('Content-Type', 'application/json');
		// http.send(message);
		var form = $('#login_form');

		// var url = 'http://' + hostname + ':' + port + '/login';
		// form.setAttribute("method", "post");
		// form.setAttribute("action", url);
		// form.submit();

	});

	///handle scroll events on iframe!
	function handle_scroll() {
		$(window).scroll(function() {
			console.log("scroll event");
			var data = makeMessage("scroll");
			connections.forEach(function(connection) {
				connection.send(data);
			});
		});
	}

	// //select a screen type
	// $("#one-screen").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-onescreen"></div>');
	// 		$("#polychrome-container-onescreen").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });

	// $("#two-screen-left").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-twoscreen-left"></div>');
	// 		$("#polychrome-container-twoscreen-left").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });


	// $("#two-screen-right").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-twoscreen-right"></div>');
	// 		$("#polychrome-container-twoscreen-right").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });

	// $("#four-screen-left-top").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-fourscreen-lefttop"></div>');
	// 		$("#polychrome-container-fourscreen-lefttop").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });

	// $("#four-screen-right-top").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-fourscreen-righttop"></div>');
	// 		$("#polychrome-container-fourscreen-righttop").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });

	// $("#four-screen-left-bottom").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-fourscreen-leftbottom"></div>');
	// 		$("#polychrome-container-fourscreen-leftbottom").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });

	// $("#four-screen-right-bottom").click(function() {
	// 	if ($('#ifrm1').length == 0){
	// 		$("body").append('<div id="polychrome-container-fourscreen-rightbottom"></div>');
	// 		$("#polychrome-container-fourscreen-rightbottom").append('<iframe id="ifrm1" scrolling="yes"></iframe>');
	// 		handle_scroll();
	// 	}
	// });


});
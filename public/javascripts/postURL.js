/**
 * @author Karthik Badam
 * created in Feb 2014
 */

//default clone 
var screenConfiguration = 1; 
$(document).ready(function() {

	$("#toggle").click(function() {
			$('#toggle').toggleClass('active');
			$("#actions").slideToggle("slow");
	});

	$("#url_submit").click(function () {
		var url = $("#url").val(); 	
		var sendData = {};
		sendData['url']	= url;
		sendData['config'] = screenConfiguration;

		//send data to nodejs
		// $.ajax({
		// 	url: '/loadURL',
		// 	type: 'GET',
		// 	data: sendData,
		// 	contentType: "application/x-www-form-urlencoded",
		// 	dataType: "json",
		// 	success: function(data) {
		// 		//$('html').html(data);
		// 		console.log ("done");
		// 	},
		// 	error: function() {},
		// });


	 $.post("/loadURL", sendData, function(data, error){
	   		if (error)
	   			console.log(error)             
	            
	        console.log("URL --"+ url + " loaded");    
	   	});
	});

	//Clone 
	$("#one-screen").click(function() {
		screenConfiguration = 1; 
	});


	//two screen left
	$("#two-screen-left").click(function() {
		screenConfiguration = 2; 
	});

	//two screen left
	$("#two-screen-right").click(function() {
		screenConfiguration = 3; 
	});

	//four screen left top
	$("#four-screen-left-top").click(function() {
		screenConfiguration = 4; 
	});

	//four screen right top
	$("#four-screen-right-top").click(function() {
		screenConfiguration = 5;
	});

	//four screen left bottom
	$("#four-screen-left-bottom").click(function() {
		screenConfiguration = 6;
	});

	//four screen right bottom
	$("#four-screen-right-bottom").click(function() {
		screenConfiguration = 7;
	});
});
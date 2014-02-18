    /**
 * @author Karthik Badam
 * created in Feb 2014
 */

//default clone 
var spaceConfiguration = 1; 
var displayConfiguration = 1; 

$(document).ready(function() {

	//$("#toggle").click(function() {
	//		$('#toggle').toggleClass('active');
	//		$("#actions").slideToggle("slow");
	//});

	$("#url_submit").click(function () {
		var url = $("#url").val(); 	
		var sendData = {};
		sendData['url']	= url;
		sendData['space'] = spaceConfiguration;
		sendData['display'] = displayConfiguration;
		
  //      $.ajax({
		//	url: '/getPage',
		//	type: 'GET',
		//	data: sendData,
		//	contentType: "application/x-www-form-urlencoded",
		//	dataType: "json",
		//	success: function(data) {
		//		$('html').html(data);
		//	},
		//	error: function() {}
		//});

		$.post("/loadUrl", sendData, function(data, error){
	   		if (error)
	   			console.log(error)             
	        var win=window.open(data, 'about:blank');
		    console.log("URL --"+ url + " loaded");    
	   	});
	});

	//Clone 
	$("#one-screen").click(function() {
		spaceConfiguration = 1;
		displayConfiguration = 1; 
	});

	//two screen left
	$("#two-screen-left").click(function() {
		spaceConfiguration = 2;
		displayConfiguration = 1; 
	});

	//two screen left
	$("#two-screen-right").click(function() {
		spaceConfiguration = 2;
		displayConfiguration = 2; 
	});

	//four screen left top
	$("#four-screen-left-top").click(function() {
		spaceConfiguration = 4;
		displayConfiguration = 1; 
	});

	//four screen right top
	$("#four-screen-right-top").click(function() {
		spaceConfiguration = 4;
		displayConfiguration = 2; 
	});

	//four screen left bottom
	$("#four-screen-left-bottom").click(function() {
		spaceConfiguration = 4;
		displayConfiguration = 3; 
	});

	//four screen right bottom
	$("#four-screen-right-bottom").click(function() {
		spaceConfiguration = 4;
		displayConfiguration = 4; 
	});
});
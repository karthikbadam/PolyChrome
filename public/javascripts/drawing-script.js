$(function () {

    // This demo depends on the canvas element
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }

    // The URL of your web server (the port is set in app.js)
    var url = 'http://localhost:3000';

    var doc = $(document),
        win = $(window),
        instructions = $('#instructions');

    // get the canvas element and its context
    var canvas = document.getElementById('paper');
    var ctx = canvas.getContext('2d'), context = canvas.getContext('2d');

    // Generate an unique ID
    var id = Math.round($.now() * Math.random());

    // A flag for drawing activity
    var drawing = false;

    var clients = {};
    var cursors = {};

    //var socket = io.connect(url);

    //socket.on('moving', function (data) {

    //    if(! (data.id in clients)){
    //        // a new user has come online. create a cursor for them
    //        cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
    //    }

    //    // Move the mouse pointer
    //    cursors[data.id].css({
    //        'left' : data.x,
    //        'top' : data.y
    //    });

    //    // Is the user drawing?
    //    if(data.drawing && clients[data.id]){

    //        // Draw a line on the canvas. clients[data.id] holds
    //        // the previous position of this user's mouse pointer

    //        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
    //    }

    //    // Saving the current client state
    //    clients[data.id] = data;
    //    clients[data.id].updated = $.now();
    //});

    var prev = {};

    // create a drawer which tracks touch movements
    var drawer = {
        touchstart: function (coors) {
            context.beginPath();
            context.moveTo(coors.x, coors.y);
            drawing = true;
        },
        touchmove: function (coors) {
            if (drawing) {
                context.lineTo(coors.x, coors.y);
                context.stroke();
            }
        },
        touchend: function (coors) {
            if (this.isDrawing) {
                this.touchmove(coors);
                drawing = false;
            }
        }
    };

    // create a function to pass touch events and coordinates to drawer
    function draw(event) {
        // get the touch coordinates
        var coors = {
            x: event.targetTouches[0].pageX,
            y: event.targetTouches[0].pageY
        };
        // pass the coordinates to the appropriate handler
        drawer[event.type](coors);
        event.preventDefault();
    }

    // attach the touchstart, touchmove, touchend event listeners.
    document.body.addEventListener('touchstart', draw, false);
    document.body.addEventListener('touchmove', draw, false);
    document.body.addEventListener('touchend', draw, false);

    // end body:touchmove

    /* old code */
    //canvas.addEventListener('touchstart',function(e){
    //    e.preventDefault();
    //    drawing = true;
    //    prev.x = e.pageX;
    //    prev.y = e.pageY;

    //    // Hide the instructions
    //    instructions.fadeOut();
    //}, false);

    $('#paper').on('mousedown', function (e) {
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;

        // Hide the instructions
        instructions.fadeOut();
    });

    //canvas.on('touchstart',function(e){
    //    e.preventDefault();
    //    drawing = true;
    //    prev.x = e.pageX;
    //    prev.y = e.pageY;

    //    // Hide the instructions
    //    instructions.fadeOut();
    //});

    doc.on('mouseup', function () {
        drawing = false;
    });

    //var lastEmit = $.now();

    doc.on('mousemove', function (e) {
        //if($.now() - lastEmit > 30){
        //    socket.emit('mousemove',{
        //        'x': e.pageX,
        //        'y': e.pageY,
        //        'drawing': drawing,
        //        'id': id
        //    });
        //    lastEmit = $.now();
        //}

        // Draw a line for the current user's movement, as it is
        // not received in the socket.on('moving') event above

        if (drawing) {

            drawLine(prev.x, prev.y, e.pageX, e.pageY);

            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });

    // Remove inactive clients after 10 seconds of inactivity
    setInterval(function () {

        for (ident in clients) {
            if ($.now() - clients[ident].updated > 10000) {

                // Last update was more than 10 seconds ago.
                // This user has probably closed the page

                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
        }

    }, 10000);

    function drawLine(fromx, fromy, tox, toy) {
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

});
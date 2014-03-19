
var Panel = {
    panel: null,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    zoomScale: 0.8,
    annotations: null,
    hostvis: null,
    width: 0,
    height: 0,
    bbox: null,
    start: null,
    inUse: false,

    init: function (svg, width, height) {
        var _self = this;
        _self.panel = svg.append("g");
        _self.width = width;
        _self.height = height;

        /* viewport polychrome rectangle */
        _self.panel.append("rect")
                   .attr("width", width)
                   .attr("height", height)
                   .attr("id", "polychrome-rect-panel")
                   .style("fill", "transparent")
                   .style("stroke", "rgba(0, 0, 0, 0.1")
                   .style("z-index", 100);

        var clipped = _self.panel.append("g").attr("clip-path", "url(#panel)");

        // Set the clip path for the new panel
        var clip = _self.panel.append("clipPath").attr("id", "panel");
        clip.append("rect").attr("width", width).attr("height", height);

        // Create the viewport
        _self.viewport = clipped.append("g").attr("id", "polychrome-Port");
        _self.hostvis = _self.viewport.append("g");

        return _self.hostvis;
    },

    install: function () {
        Panel.panel.on("mousedown", Panel.mousedown);
    },

    uninstall: function () {
        Panel.panel.on("mouseup", null);
        Panel.panel.on("mousemove", null);
        Panel.panel.on("mousedown", null);
    },

    getBoundingBox: function (curr) {
        var minX = Math.min(curr[0], Panel.start[0]);
        var maxX = Math.max(curr[0], Panel.start[0]);
        var minY = Math.min(curr[1], Panel.start[1]);
        var maxY = Math.max(curr[1], Panel.start[1]);
        return [minX, minY, maxX - minX, maxY - minY];
    },

    mousedown: function () {

        // Prevent Browser's default behaviour
        d3.event.preventDefault();
        Panel.start = d3.mouse(this);

        var event = d3.event;

        if (event.isPolyChrome) {
            // bounding box
            Panel.bbox = Panel.panel.append("rect")
                                    .attr("id", "polychrome-selection")
                                    .attr("x", Panel.start[0])
                                    .attr("y", Panel.start[1])
                                    .attr("width", "5")
                                    .attr("height", "5")
                                    .style("fill", "#aaa")
                                    .style("fill-opacity", 0.4);
            Panel.inUse = true;

            // Install event handlers
            Panel.panel.on("mousemove", function () {

                var event = d3.event; 

                if (event.isPolyChrome) {
                     if (Panel.inUse) {
                        // Update the selection
                        var box = Panel.getBoundingBox(d3.mouse(this));
                        if (Panel.bbox)
                            Panel.bbox.attr("x", box[0]).attr("y", box[1]).attr("width", box[2]).attr("height", box[3]);
                    }
                } else {
                    
                    /* recycle event and send it to other peers */
                    PolyChromeEventHandler.wrapEvent(event.type, event.pageX, event.pageY, event.target, event);
                    PolyChromeEventHandler.shareEvent();
                       
                }
               
            });


            Panel.panel.on("mouseup", function () {

                var event = d3.event;

                if (event.isPolyChrome) {
                     if (Panel.inUse) {

                        // Forward the selection
                        var box = Panel.getBoundingBox(d3.mouse(this));
                        Toolbox.select([[(box[0] - Panel.x), (box[1] - Panel.y)], [(box[0] - Panel.x), (box[1] - Panel.y) + box[3]], [(box[0] - Panel.x) + box[2], (box[1] - Panel.y) + box[3]], [(box[0] - Panel.x) + box[2], (box[1] - Panel.y)]], Toolbox.inclusive);

                        // Remove the bounding box
                        Panel.bbox.remove();
                        Panel.bbox = null;
                        Panel.inUse = false;                     
                     }
                }
                
                else {
                    
              
                    /* recycle event and send it to other peers */
                    PolyChromeEventHandler.wrapEvent(event.type, event.pageX, event.pageY, event.target, event);
                    PolyChromeEventHandler.shareEvent();

                }
            });

        } else {

            
            /* recycle event and send it to other peers */
            PolyChromeEventHandler.wrapEvent(event.type, event.pageX, event.pageY, event.target, event);
            PolyChromeEventHandler.shareEvent();
        }

    }
};


var Toolbox = {
    svg: null,
    viewport: null,
    captured: null,
    inclusive: true,

    init: function (svg, viewport) {
        var _self = this;
        _self.svg = svg;
        _self.viewport = viewport;
    },

    select: function (points, inclusive) {
        var _self = this;
        var shapebound = new createPolygon(points);
        _self.captured = shapebound.intersectPath(d3.selectAll(".counties").selectAll("path")[0], inclusive);

        var hits = _self.captured;
        for (var i = 0; i < hits.length; i++) {
            var str = hits[i].getAttributeNS(null, "d")
            d3.selectAll(".counties").append("path").attr("d", str).attr("style", "fill: " + "#FFA700" + "; opacity: 0.5; pointer-events: none");
        }
    }
}

$(document).ready(function () {

    var width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight;

    var rateById = d3.map();

    var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function (i) { return "q" + i + "-9"; }));

    var path = d3.geo.path();

    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

    var viewport = Panel.init(svg, width, height);
    Panel.install();
    PolyChromeEventHandler.init();
    PeerConnection.init();

    queue()
    .defer(d3.json, "http://localhost:3000/polychrome-datasets/us.json")
    .defer(d3.tsv, "http://localhost:3000/polychrome-datasets/unemployment.tsv", function (d) { rateById.set(d.id, +d.rate); })
    .await(ready);

    function ready(error, us) {
        viewport.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function (d) { return quantize(rateById.get(d.id)); })
            .attr("d", path);

        viewport.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);


        /* call polychromify */
        PolyChromeEventHandler.polyChromify();
        ServerConnection.init();

    }
});



// Map Setup

var osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {"attribution": "OpenStreetMap", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
);

var otm = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var aga = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var baseMaps = {
  "Aerial": aga,
  "OpenTopoMap": otm,
  "OpenStreetMap": osm
};


var m = L.map(
    "m",
    {
        center: [39.833333, -98.583333],
        crs: L.CRS.EPSG3857,
        zoom: 4,
        zoomControl: true,
        preferCanvas: false,
        layers:[aga]
    }
);



var options = {
  position: "topleft",
  draw: {'polyline': {'allowIntersection': false}},
  edit: {'poly': {'allowIntersection': false}},
}
// FeatureGroup is to store editable layers.
var drawnItems = new L.featureGroup().addTo(m);
options.edit.featureGroup = drawnItems;
var draw_control = new L.Control.Draw(
    options
).addTo(m);

var drawLayers = {
    "drawings": drawnItems
};

L.control.layers(baseMaps, drawLayers).addTo(m);


var geoptions = {
    collapsed: true, /* Whether its collapsed or not */
    position: 'topleft', /* The position of the control */
    text: 'Search', /* The text of the submit button */
    placeholder: 'Find Location...', /* The text of the search input placeholder */
}
var osmGeocoder = new L.Control.OSMGeocoder(geoptions);
m.addControl(osmGeocoder);


// Events

m.on(L.Draw.Event.CREATED, function(e) {
    var layer = e.layer,
        type = e.layerType;
    //drawnItems.addLayer(e.layer);
    var coords = layer.toGeoJSON();
    console.log(coords.geometry.coordinates);
    //$( "#target" ).click(function() {
    layer.on('click', function() {
      // Show loader on click
      //$('#load').show();
      $('body').addClass("loading"); 
      var jqXHR = $.ajax({
        url: "/background_process",
        type: "POST",
        data: JSON.stringify(coords),
        contentType: 'application/json;charset=UTF-8',
      }).done(function (response, status, jqXHR) {
        $('#main').text(response);
        drawnItems.addLayer(e.layer);
        window.location = response;
      }).fail(function (jqXHR, status, err) {
        alert("Request Failed.");
      }).always(function () {
        //alert("Promise completion callback.");
        // Hide loader on completion
        //$('#load').hide();
        $('body').removeClass("loading");
        drawnItems.removeLayer(e.layer);
      });
      return false;
    });


    // Tooltip/pop-up solution for providing coords

    //layer.bindTooltip(JSON.stringify(coords));

    // Prefer pop-up as this allows for copying
    layer.on('mouseover', function(e) {
      var center = layer.getBounds().getCenter();
      //open popup;
      var popup = L.popup()
       .setLatLng(center) 
       .setContent(JSON.stringify(coords))
       .openOn(m);
       e.target.removeEventListener(e.type, arguments.callee);
    });


 });

m.on('draw:drawstart', function(e) {
    drawnItems.clearLayers();
});

m.on('draw:created', function(e) {
    drawnItems.addLayer(e.layer);
});
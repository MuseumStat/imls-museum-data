/// Leaflet JS base map
///

var map = L.map('map', { zoomControl:false, scrollWheelZoom: false }).setView([39.9500, -75.1667], 4);

L.tileLayer ('http://{s}.tiles.mapbox.com/v3/mpwilliams89.lodmp50l/{z}/{x}/{y}.png', 
	{
   	attribution: 'IMLS | Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
	}).addTo(map);

L.control.zoom ({
	position: 'topright',
}).addTo(map);

/*
 * Leaflet Module
 * Custom map expand control
 */
var mapExpand = L.control();

mapExpand.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'mapExpand leaflet-bar'); // create a div with a class "mapExpand"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
mapExpand.update = function () {
  this._div.innerHTML = '<a class="leaflet-control-map-expand"><i class="md-icon-resize-full"></i></a>';
};

mapExpand.addTo(map);


/*
 * Leaflet Module
 * Fake layer control
 */
var mapExpand = L.control();

mapExpand.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'mapLayers leaflet-bar'); // create a div with a class "mapExpand"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
mapExpand.update = function () {
  this._div.innerHTML = '<a class="leaflet-control-map-layers"><i class="md-icon-layers"></i></a>';
};

mapExpand.addTo(map);
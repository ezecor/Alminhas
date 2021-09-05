var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
});
var osm_mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var map = L.map('mapCanvas', {
    center: [40.85, -8.41],
    zoom: 7,
    layers: [CartoDB_Positron]
});
var baseMaps = {
    "CartoDB": CartoDB_Positron,
    "OpenStreetMap": osm_mapnik,
    "Satélite": Esri_WorldImagery
};
L.control.layers(baseMaps, null, {
    collapsed: false
}).addTo(map);
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);
var lc = L.control.locate({
    strings: {
        title: "A minha posição!"
    }
});
lc.addTo(map);
var counter = 0;
var freg = [];
var markers;
var realce;
var geojson = L.geoJSON(alminhas, {
    onEachFeature: atributos
});
markers = L.markerClusterGroup({
    showCoverageOnHover: false
});
markers.addLayer(geojson);
map.addLayer(markers);
map.fitBounds(markers.getBounds());
document.getElementById('contador').innerHTML = "Nº de alminhas: " + counter;
var selectbox = document.getElementById('selbox');
var uniqueNames = [];
$.each(freg, function (i, el) {
    if ($.inArray(el, uniqueNames) === -1) {
        uniqueNames.push(el);
    }
});
uniqueNames.sort(function(a, b) {
    return a.localeCompare(b);
});
var i;
for (i = 0; i < uniqueNames.length; i++) {
    var opt = document.createElement('option');
    opt.value = uniqueNames[i];
    opt.innerHTML = uniqueNames[i];
    selectbox.appendChild(opt);
}
var scale = L.control.scale();
scale.addTo(map);
map.attributionControl.setPrefix(
    '&copy; <a href="https://sites.google.com/view/fmtcultura/projeto">Projecto Alminhas</a>' + ' &copy; Mapa Interactivo: <a href="mailto:ezcorreia@gmail.com">Ezequiel Correia</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
);
sidebar.on('hidden', function () {
    map.removeLayer(realce);
    realce = null;
});
function atributos(feature, layer) {
    counter++;
    layer.bindTooltip(feature.properties.name + "<br>" + feature.properties.FREGUESIA);
    layer.on({
        click:
            function populate() {
                var obs = feature.properties["OBS"];
                if (obs == null) {
                    obs = "";
                } else {
                    obs = "<a href='" + feature.properties["OBS"] + "' target='popup'><b>Ficha de inventário</b></a>";
                }
                sidebar.setContent("<img height='200' src=" + feature.properties["gx_media_links"] + " >" + "<br>LUGAR: " + feature.properties.name + "<br>FREGUESIA: " + feature.properties.FREGUESIA + "<br>PAINEL: " + feature.properties.PAINEL + "<br> DESCRIÇÃO DO ORATÓRIO: " + feature.properties["DESCRIÇÃO DO ORATÓRIO"] + "<br><br>" + obs);
                if (realce == null) {
                    realce = L.circleMarker([feature.properties.LAT, feature.properties.LONG], {
                        "radius": 15,
                        "fillColor": "#9c5f1f",
                        "color": "red",
                        "weight": 1,
                        "opacity": 1
                    }).addTo(map);
                } else {
                    realce.setLatLng([feature.properties.LAT, feature.properties.LONG]);
                }
                sidebar.show();
            }
    });
    freg.push(feature.properties.FREGUESIA);
}
function selFreg() {
    map.removeLayer(markers);
    if (realce != null) {
        map.removeLayer(realce);
        realce = null;
    }
    if (sidebar.isVisible() == true) {
        sidebar.hide();
    }
    counter = 0;
    var miFreg = document.getElementById('selbox').value;
    var geojson = L.geoJSON(alminhas, {
        filter: function (feature, layer) {
            if (miFreg != "Todas") {
                return (feature.properties.FREGUESIA == miFreg);
            } else {
                return true;
            }
        },
        onEachFeature: atributos
    });
    markers = L.markerClusterGroup({
        showCoverageOnHover: false
    });
    markers.addLayer(geojson);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
    document.getElementById('contador').innerHTML = "Nº de alminhas: " + counter;
}

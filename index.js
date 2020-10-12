import Map from 'ol/Map';
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Snap, Modify } from 'ol/interaction'
import { Collection, Feature } from 'ol';
import LineString from 'ol/geom/LineString';
const mapElement = document.getElementById('map');

const map = new Map({
    target: mapElement,
    view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
    }),
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ]
});

const sourceA = new VectorSource()
const featureA = new Feature(new LineString([
    [0, 0],
    [30, 20],
    [20, 30],
    [40, 40]
]))
const featureA2 = new Feature(new LineString([
    [40, 45],
    [60, 45],
]))
sourceA.addFeature(featureA)

sourceA.addFeature(featureA2)

map.getView().fit(sourceA.getExtent(), { padding: [200, 20, 200, 20] });
const layerA = new VectorLayer({ source: sourceA })

const sourceB = new VectorSource();
const featureB = new Feature(new LineString([
    [10, 10],
    [10, 30],
    [10, 40]
]))
const layerB = new VectorLayer({ source: sourceB });
sourceB.addFeature(featureB)
map.addLayer(layerA);

map.addLayer(layerB);

const modify = new Modify({
    features: new Collection([featureA]),
});
map.addInteraction(modify);

const snapA = new Snap({
    source: sourceA
});
map.addInteraction(snapA);

const snapB = new Snap({
    source: sourceB
});
map.addInteraction(snapB);






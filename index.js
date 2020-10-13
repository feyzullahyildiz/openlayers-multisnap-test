import Map from 'ol/Map';
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Snap, Modify } from 'ol/interaction'
import { Collection, Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import GeometryLayout from 'ol/geom/GeometryLayout';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Point from 'ol/geom/Point';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
const mapElement = document.getElementById('map');


const vertexZStyle = (feature) => {
    const pointStyles = feature.getGeometry().getCoordinates().map(geom => {
        const [x, y, z] = geom;
        const p = new Point([x, y], GeometryLayout.XY);
        const pointStyle = new Style({
            geometry: p,
            text: new Text({
                text: z.toString(),
                scale: 2,
                fill: new Fill({
                    color: 'white'
                }),
                stroke: new Stroke({
                    color: 'blue'
                })
            })
        });
        return pointStyle;
    });
    pointStyles.unshift(new Style({
        stroke: new Stroke({
            color: 'red',
            width: 2,
        }),
    }))
    return pointStyles;
}
const sourceA = new VectorSource();
const layerA = new VectorLayer({ source: sourceA, style: vertexZStyle });
const featureA = new Feature(new LineString([
    [0, 0, 0],
    [30, 20, 0],
    [20, 30, 0],
    [40, 40, 0]
], GeometryLayout.XYZ));
const featureA2 = new Feature(new LineString([
    [40, 45, 20],
    [60, 45, 20],
], GeometryLayout.XYZ))
sourceA.addFeatures([featureA, featureA2]);



const sourceB = new VectorSource();
const featureB = new Feature(new LineString([
    [10, 10, 100],
    [10, 40, 100]
], GeometryLayout.XYZ))
const layerB = new VectorLayer({ source: sourceB, style: vertexZStyle });
sourceB.addFeature(featureB)
const map = new Map({
    target: mapElement,
    view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
        // extent: sourceA.getExtent()
    }),
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        layerA,
        layerB
    ]
});
map.getView().fit(sourceA.getExtent(), { padding: [200, 20, 200, 20] });


const modify = new Modify({
    features: new Collection([featureA]),
});
map.addInteraction(modify);

const pixelTolerance = 20;
const edge = true;
const snapA = new Snap({
    source: sourceA,
    pixelTolerance,
    edge,
});
map.addInteraction(snapA);

const snapB = new Snap({
    source: sourceB,
    pixelTolerance,
    edge,
});
map.addInteraction(snapB);
const sourceList = [sourceA, sourceB];
modify.on('modifyend', (event) => {
    const orjPixel = map.getEventPixel(event.mapBrowserEvent.originalEvent);
    const maybeSnappedPixel = event.mapBrowserEvent.pixel;
    if (orjPixel[0] === maybeSnappedPixel[0] && orjPixel[1] === maybeSnappedPixel[1]) {
        console.log('NOT snapped');
        return;
    }
    console.log('SNAPPED');
    const feature = event.features.item(0);

    const features = sourceList.map(s => s.getFeaturesAtCoordinate(event.mapBrowserEvent.coordinate))
        .flat()
        .filter(f => f !== feature);
    if (features.length !== 1) {
        return;
    }

    const [lon, lat] = event.mapBrowserEvent.coordinate;

    // const snapped2DCoordinate = map.getCoordinateFromPixel(maybeSnappedPixel);
    const snappedFeature = features[0];
    // console.log('snappedFeature', snappedFeature);
    const snappedVertexList = snappedFeature.getGeometry().getCoordinates();
    const snappedVertex = snappedVertexList.find(a => a[0] === lon && a[1] === lat);
    if (!snappedVertex) {
        console.log('snappedVertex not found', snappedVertex);
        return;
    }
    const modifiedGeometry = feature.getGeometry();
    const modifiedCoordinates = modifiedGeometry.getCoordinates();
    const modifiedVertexIndex = modifiedCoordinates.findIndex(a => a[0] === lon && a[1] === lat);
    if(modifiedVertexIndex === -1) {
        console.log('modifiedVertexIndex -1')
        return;
    }
    modifiedCoordinates[modifiedVertexIndex][2] = snappedVertex[2];
    modifiedGeometry.setCoordinates(modifiedCoordinates, modifiedGeometry.getLayout());

});


window.sourceA = sourceA;
window.sourceB = sourceB;


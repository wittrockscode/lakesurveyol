import './style.css';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import TileWMS from 'ol/source/TileWMS.js';
import Overlay from 'ol/Overlay.js';
import {transform} from 'ol/proj.js';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});


closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const lakeSurveys = new TileWMS({
  url: "http://localhost:8080/geoserver/lakesurveys/wms",
  params: {
    "LAYERS" : "lakesurveys"
  },
  serverType: 'geoserver'
})

const view = new View({
  center: transform([7.6261, 51.9607], 'EPSG:4326', 'EPSG:3857'),
  zoom: 15,
})

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new TileWMS({
        url: "https://www.wms.nrw.de/geobasis/wms_nw_dtk100",
        params: {
          "LAYERS": "nw_dtk100_col"
        }
      }),
      opacity: 0.5
    }),
    new TileLayer({
      source: lakeSurveys
    })
  ],
  overlays: [overlay],
  view,
});


map.on('singleclick', function (evt) {
  const viewResolution = /** @type {number} */ (view.getResolution());
  const url = lakeSurveys.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'application/json'}
  );
  console.log(url)
  if (url) {
    fetch(url)
      .then((response) => response.text())
      .then((json) => {
        //console.log(json)
        const coordinate = evt.coordinate;

        const jsonParsed = JSON.parse(json)


        if(jsonParsed.features.length > 0){
          
          const featureProps = jsonParsed.features[0].properties
          console.log(featureProps)
          const name = featureProps.Name
          const area = featureProps.Area
          const depth = featureProps.Depth
          const volume = featureProps.Volume
          const surveys = JSON.parse(featureProps.surveys)

          let surveyHtml = ""

          surveys.forEach(survey => {
              surveyHtml += `<p>Surveyor: ${survey.Surveyor}</p><p>Date: ${survey.Date}</p><p>Results: ${survey.Results}</p><hr>` 
          });

          let html = `<div class="surveyContent">
          <u><h4 class="lakename">${name}</h4></u>
          <p>Area: ${area}</p>
          <p>Depth: ${depth}</p>
          <p>Volume: ${volume}</p>
          <hr>
          <u><h4>Surveys</h5></u>
          ${surveyHtml}
          </div>`
          content.innerHTML = html;
          overlay.setPosition(coordinate);
        }

        
      });
  }
});


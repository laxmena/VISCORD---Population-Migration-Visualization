import { environment } from '../../environments/environment.prod';
import { DataService } from '../data.service';
import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Map, View } from 'ol';
import { Image as ImageLayer, Tile as TileLayer, Vector } from 'ol/layer';
import { transform } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Circle, Style, Text } from 'ol/style';
import { interpolateBlues } from 'd3-scale-chromatic';
import { Draw, Select, Translate, defaults, Interaction } from 'ol/interaction';
import { TranslateEvent } from 'ol/interaction/Translate';
import GeometryType from 'ol/geom/GeometryType';
import { shiftKeyOnly, click } from 'ol/events/condition';
import OSM from 'ol/source/OSM';
import * as d3 from 'd3';
import Polygon from 'ol/geom/Polygon';
import { ConditionalExpr } from '@angular/compiler';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements AfterViewInit {
  private map: Map = new Map({});
  coordinates: any;
  mousePosition: number[] = [0, 0];
  date = "2020-08-01";
  count = 100;
  values: any = { 'Winter': 0, 'Summer': 0, 'Fall/Spring': 0 };
  @Output() onValues = new EventEmitter<string>();

  constructor(private dataService: DataService) { }

  private interactionSource = new VectorSource({ useSpatialIndex: true })
  selectedFeatures: any;
  myStyle = new Style({
    image: new Circle({
      radius: 2,
      fill: new Fill({color: 'black'}),
    })
  })
  // Create Chicago Map
  chicagoMap = new TileLayer({
    source: new XYZ({
      url: 'https://api.maptiler.com/maps/positron/256/{z}/{x}/{y}.png?key=7EpFZTFkvcQ9zDad03lC'
    }),
    className: "mapLayer",
    zIndex: 0,
  })

  boundaries = new VectorLayer({
    source: new VectorSource({
    format: new GeoJSON(),
    url: environment.filesurl + 'boundaries?date=' + this.date,
  }),
  })
  // Create Street Network Layer
  streetNetwork = new VectorLayer({
    source: new VectorSource({
      url: environment.filesurl + 'network?date=' + this.date + '&count=' + this.count,
      format: new GeoJSON(),
    }),

  })
  stations = new VectorLayer({
    source:new VectorSource({
      url:environment.filesurl+'stations',
      format:new GeoJSON(),
    }),
    
    style:this.myStyle,
    className:"stations",
    zIndex:2,
    
  })

  // Create Interaction Layer
  interactionLayer = new Vector({
    source: this.interactionSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.6)',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.5)',
        width: 3
      })
    }),
    zIndex: 2
  })

  private select: Select = new Select({
    layers: [this.interactionLayer]
  });
  private translate: Translate = new Translate({
    features: this.select.getFeatures(),
    layers: [this.interactionLayer]
  });

  submit() {
    this.date = (<HTMLInputElement>document.getElementById("date")).value;
    let count = (<HTMLInputElement>document.getElementById("count")).value;
    this.count = Number(count);
    this.updateValues();
  }

  addInteractions(source: any) {
    let draw: Draw;
    let select: Select = this.select;
    let translate: Translate = this.translate;
    let streetNetworkLayer = this.streetNetwork;
    let interactionLayer = this.interactionLayer;

    let map = this.map;
    this.selectedFeatures = select.getFeatures()
    let selectedFeatures = this.selectedFeatures;
    let app =this

    draw = new Draw({
      source: source,
      type: GeometryType.POLYGON,
    });

    draw.on('drawstart', function (event: any) {
      source.clear();
      select.setActive(false);
      selectedFeatures.clear();
    });

    draw.on('drawend', function (event: any) {
      map.removeInteraction(draw);
      map.addInteraction(select);
      map.addInteraction(translate);

      selectedFeatures.clear();
      delaySelectActivate();

      let polygon = event.feature.getGeometry()
      
      let features: any = streetNetworkLayer.getSource().getFeatures()
      for (var i = 0; i < features.length; i++) {
        if (polygon.intersectsExtent(features[i].getGeometry().getExtent())) {
          selectedFeatures.push(features[i]);
        }
      }
      app.updateValues();
    });

    map.addInteraction(draw);

    translate.on('translateend', function (event: TranslateEvent) {
      selectedFeatures.clear();
      let polygon: any = interactionLayer.getSource().getFeatures()[0].getGeometry();

      let features: any = streetNetworkLayer.getSource().getFeatures();
      for (var i = 0; i < features.length; i++) {
        if (polygon.intersectsExtent(features[i].getGeometry().getExtent())) {
          selectedFeatures.push(features[i]);
        }
      }
      app.updateValues();
    });

    let delaySelectActivate = function () {
      setTimeout(function () {
        select.setActive(true)
      }, 300)
    }
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      interactions: defaults().extend([this.select, this.translate]),
      layers: [
        this.chicagoMap,
        this.boundaries,
        this.stations,
        this.streetNetwork,
        this.interactionLayer,
      ],
      view: new View({
        center: transform([-87.6298, 41.8781], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      }),
      target: 'map'
    })
    this.fillColors();
    // this.addInteractions(this.interactionSource)
  }

  fillColors() {
    this.boundaries.getSource().getFeatures().map(feature => {
      // get properties
      // check if property 'color' exists in feature
      if (feature.get('color')) {
        // get color
          feature.setStyle(new Style({
              fill: new Fill({
                color: feature.getProperties().color
              })
          }))
         }
      });

      this.streetNetwork.getSource().getFeatures().map(feature => {
        // get properties
        // check if property 'color' exists in feature
        if (feature.get('color')) {
          // get color
            console.log(feature.getProperties().color)
            feature.setStyle(new Style({
                fill: new Fill({
                  color: feature.getProperties().color
                })
            }))
           }
        });
  }
  updateValues() {
    let date = this.date;
    let count = this.count;
    this.dataService.getNetwork(date, count)
      .subscribe(data => {
        // Update network open layers vector soruce to data
        this.streetNetwork.getSource().clear();
        
        // Change features to features from data
        let features = new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        this.streetNetwork.getSource().addFeatures(features);
        // this.onValues.emit(data);
        this.fillColors();
      });

      this.dataService.getBoundaries(date)
      .subscribe(data => {
        // Update getBoundaries open layers vector soruce to data
        this.boundaries.getSource().clear();
        
        // Change features to features from data
        let features = new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        this.boundaries.getSource().addFeatures(features);
        this.fillColors();
      });

  }

}

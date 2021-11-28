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
  values: any = { 'Winter': 0, 'Summer': 0, 'Fall/Spring': 0 };
  @Output() onValues = new EventEmitter<string>();

  constructor(private dataService: DataService) { }

  private interactionSource = new VectorSource({ useSpatialIndex: true })
  selectedFeatures: any;
  myStyle = new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({color: 'black'}),
      // stroke: new Stroke({
      //   color: [255,0,0], width: 2
      // })
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
//   chicagoMap = new VectorLayer({
//     source: new VectorSource({
//     format: new GeoJSON(),
//    url: environment.filesurl + 'stations',
// }),
//   })
  boundaries = new VectorLayer({
    source: new VectorSource({
    format: new GeoJSON(),
   url: environment.filesurl + 'boundaries',
}),
style: new Style({
  stroke: new Stroke({
    color: 'rgba(255, 0, 0, 0.5)',
    width: 2
  })
}),
  })
  // Create Street Network Layer
  streetNetwork = new VectorLayer({
    source: new VectorSource({
      url: environment.filesurl + 'network',
      format: new GeoJSON(),
    }),
    // className: "streetNetwork",
    // zIndex: 1,
    // style: function (feature) {
    //   var weight = (feature.get("chi-jun-21") / 360 + feature.get("chi-sep-22") / 540 + feature.get("chi-dec-21") / 720) / 3
    //   const style = new Style({
    //     stroke: new Stroke({
    //       color: interpolateBlues(weight),
    //       width: 3
    //     }),
    //   })
    //   return style;
    // }
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
  // boundaries = new VectorLayer({
  //   source:new VectorSource({
  //     url:environment.filesurl+'boundaries',
  //     format:new GeoJSON(),
  //   }),
  //   className:"boundaries",
  //   zIndex:3,
  // })

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

  addInteractions(source: VectorSource) {
    let draw: Draw;
    let select: Select = this.select;
    let translate: Translate = this.translate;
    let streetNetworkLayer = this.streetNetwork;
    let interactionLayer = this.interactionLayer;

    let map = this.map;
    this.selectedFeatures = select.getFeatures()
    let selectedFeatures = this.selectedFeatures;
    let updateValues = this.updateValues;
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

    this.addInteractions(this.interactionSource)
  }

  updateValues() {
    let data = this.selectedFeatures;
    console.log(data)
    console.log("Update values");
    this.dataService.getDistribution(data)
      .subscribe(data => {
        console.log(data);
        this.onValues.emit(data);
      });
  }

}

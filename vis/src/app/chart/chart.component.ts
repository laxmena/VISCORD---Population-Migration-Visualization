import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements AfterViewInit {
  boxPlot: any;
  @Input() values: any;

  private host!: d3.Selection<d3.BaseType, {}, d3.BaseType, any>;
  private svg: any;
  private width!: number;
  private height!: number;
  private htmlElement!: HTMLElement;
  private margin: any;
  top10: any = [];

  constructor() { }

  private setup(): void {
    this.margin = { top: 30, right: 30, bottom: 40, left: 50 };
    this.width = 300 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
  }

  ngAfterViewInit(): void {
    this.setup();
    this.updateValues(this.values);
  }

  updateValues(values: any) {
    if(values == null) return;
    let dataValues: any = values['features'];
    // Take First 10 elements from the dataValues
    let dataList = dataValues.slice(0, 10);
    
    // Create array of objects with start, end and count
    this.top10 = dataList.map(function(d: any) {
      return {
        start: d['properties']['start'],
        end: d['properties']['end'],
        count: d['properties']['count']
      };
    });
  }

}

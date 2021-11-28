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

  constructor() { }

  private setup(): void {
    this.margin = { top: 30, right: 30, bottom: 40, left: 50 };
    this.width = 300 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
  }

  private buildSVG(): void {
    this.host.html("");
    this.svg = this.host.append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
  }


  ngAfterViewInit(): void {
    //
    this.host = d3.select("#boxplot");
    this.setup();
    this.updateValues(this.values);
  }

  buildChart() {
    let dataValues: any = this.values;
    if(dataValues == null) return;
    let dataList = dataValues.values;
    let svg = this.svg;
    let height = this.height;
    let palette = ["#fac025", "#9bddf9", "#e09f32"]
    let margin = this.margin;
    if(dataList != null)

    dataList.forEach(function(data: any, idx: number) {

    var q1: any = data['q1']
    var q2: any = data['q2']
    var q3: any = data['q3']
    var interQuartileRange = data['q3'] - data['q1'];
    var min = data['min']
    var max = data['max']

    var y = d3.scaleLinear()
      .domain([0, 720])
      .range([height, 0])

    svg.call(d3.axisLeft(y))
    var center = (idx)*40 + 40
    var width = 30

    // Show the main vertical line
    svg
      .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "black")

    // Show the box
    svg
      .append("rect")
      .attr("x", center - width / 2)
      .attr("y", y(q3))
      .attr("height", (y(q1) - y(q3)))
      .attr("width", width)
      .attr("stroke", "black")
      .style("fill", palette[idx])

    svg
      .selectAll("toto")
      .data([min, q2, max])
      .enter()
      .append("line")
      .attr("x1", center - width / 2)
      .attr("x2", center + width / 2)
      .attr("y1", function (d: any) { return (y(d)) })
      .attr("y2", function (d: any) { return (y(d)) })
      .attr("stroke", "black")
    })
  }

  updateValues(values: any) {
    this.values = values;
    this.buildSVG();
    this.buildChart();
  }

}

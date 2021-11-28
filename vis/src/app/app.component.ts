import { Component, ViewChild } from '@angular/core';
import { ChartComponent } from './chart/chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'shadow-maps';
  values: any;

  @ViewChild(ChartComponent) private chart!: ChartComponent;

  updateValues(event: any) {
    this.values = event;
    this.chart.updateValues(this.values);
  }
}

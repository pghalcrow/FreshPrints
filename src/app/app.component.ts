import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsService } from './services/analytics.service';
import { TrafficService } from './services/traffic.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FreshPrints';

  constructor(analytics: AnalyticsService, traffic: TrafficService) {
    analytics.trackPhoneClicks();
    traffic.start();
  }
}

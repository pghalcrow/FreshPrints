import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-flyers',
  imports: [],
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.css'
})
export class FlyersComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
    title: 'Same-Day & Rush Flyer Printing in San Diego, CA | Get it ASAP',
    description: 'Get same-day or rush flyer printing in San Diego, CA. High-quality, fast turnaround, and local delivery. Perfect for promotions, events, and grand openings.'
  });
  }
}

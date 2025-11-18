import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
    title: 'Emergency Printing in San Diego, CA | Get Your Prints ASAP',
    description: 'Need printing fast? Fresh Prints delivers emergency printing in San Diego, CA, and beyond when you need prints ASAP.'
  });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-kearny-postcards',
  imports: [RouterLink],
  templateUrl: './kearny-postcards.component.html',
  styleUrl: './kearny-postcards.component.css'
})
export class KearnyPostcardsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Same-Day Postcard Printing in Kearny Mesa | Fresh Prints',
      description: 'Same-day and next-day postcard printing for Kearny Mesa and San Diego businesses. Up to 10,000 postcards, free delivery, custom sizes. Call 619-500-1959.',
      keywords: 'postcard printing Kearny Mesa, same-day postcard printing San Diego, rush postcard printing San Diego, direct mail printing Kearny Mesa',
      canonical: 'https://realfreshprints.com/kearny-postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp',
      breadcrumb: 'Kearny Mesa Postcard Printing',
      service: 'Same-Day Postcard Printing'
    });
  }
}

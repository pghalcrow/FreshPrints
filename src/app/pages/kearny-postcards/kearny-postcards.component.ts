import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-kearny-postcards',
  imports: [],
  templateUrl: './kearny-postcards.component.html',
  styleUrl: './kearny-postcards.component.css'
})
export class KearnyPostcardsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: '10,000 Postcards, Same Day or Next Day | Kearny Mesa Printing | Fresh Prints',
      description: 'Same-day and next-day postcard printing for Kearny Mesa and San Diego businesses. Up to 10,000 postcards, free delivery, standard and custom sizes. Call 619-500-1959.',
      keywords: 'postcard printing Kearny Mesa, same-day postcard printing San Diego, rush postcard printing San Diego, direct mail printing Kearny Mesa',
      canonical: 'https://realfreshprints.com/kearny-postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp'
    });
  }
}

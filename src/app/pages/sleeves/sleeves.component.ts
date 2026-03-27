import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-sleeves',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './sleeves.component.html',
  styleUrl: './sleeves.component.css'
})
export class SleevesComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Sleeve Printing in San Diego, CA | Same-Day Packaging Sleeves',
      description: 'Need custom packaging sleeves printed fast? Fresh Prints offers emergency sleeve printing in San Diego, CA for jars, boxes, bottles, and clothing.',
      keywords: 'emergency sleeve printing San Diego, rush packaging sleeves, same-day sleeve printing San Diego, custom product sleeves San Diego',
      canonical: 'https://realfreshprints.com/sleeves',
      ogImage: 'https://realfreshprints.com/assets/images/sleeves_02.jpg'
    });
  }
}

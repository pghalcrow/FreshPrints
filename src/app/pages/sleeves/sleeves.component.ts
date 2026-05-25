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
      title: 'Emergency Packaging Sleeve Printing San Diego | Rush Sleeves for Jars, Bottles, Boxes | Fresh Prints',
      description: 'Fresh Prints delivers emergency packaging sleeve printing for San Diego businesses. Custom sleeves for jars, bottles, boxes and apparel. Same-day and next-day turnaround available. Call 619-500-1959 now.',
      keywords: 'emergency sleeve printing San Diego, rush packaging sleeves, same-day sleeve printing San Diego, custom product sleeves San Diego',
      canonical: 'https://realfreshprints.com/sleeves',
      ogImage: 'https://realfreshprints.com/assets/images/sleeves_02.jpg'
    });
  }
}

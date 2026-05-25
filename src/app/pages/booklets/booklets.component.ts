import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-booklets',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './booklets.component.html',
  styleUrl: './booklets.component.css'
})
export class BookletsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Booklet Printing San Diego | Same-Day and Rush Booklets | Fresh Prints',
      description: 'Fresh Prints delivers emergency booklet printing for San Diego businesses. Booklets, product catalogs, training manuals and more. Same-day and next-day turnaround available. Call 619-500-1959 now.',
      keywords: 'emergency booklet printing San Diego, rush booklet printing, same-day booklet printing San Diego, custom booklets San Diego',
      canonical: 'https://realfreshprints.com/booklets',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp'
    });
  }
}

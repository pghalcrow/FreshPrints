import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-booklets',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './booklets.component.html',
  styleUrl: './booklets.component.css'
})
export class BookletsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Booklet Printing San Diego | Fresh Prints',
      description: 'Emergency booklet printing for San Diego businesses: booklets, catalogs and training manuals with same-day and next-day turnaround. Call 619-500-1959.',
      keywords: 'emergency booklet printing San Diego, rush booklet printing, same-day booklet printing San Diego, custom booklets San Diego',
      canonical: 'https://realfreshprints.com/booklets',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp'
    });
  }
}

import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-postcards',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './postcards.component.html',
  styleUrl: './postcards.component.css'
})
export class PostcardsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Postcard Printing San Diego | Fresh Prints',
      description: 'Emergency postcard printing in San Diego. Rush and same-day custom postcards for direct mail, promotions and corporate campaigns. Call 619-500-1959.',
      keywords: 'emergency postcard printing San Diego, rush postcard printing, same-day postcard printing San Diego, custom postcards San Diego',
      canonical: 'https://realfreshprints.com/postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp',
      breadcrumb: 'Postcard Printing',
      service: 'Emergency Postcard Printing'
    });
  }
}

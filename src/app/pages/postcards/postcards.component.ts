import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-postcards',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './postcards.component.html',
  styleUrl: './postcards.component.css'
})
export class PostcardsComponent {
  faqs = PRODUCT_FAQS['postcards'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Business Postcard Printing, San Diego | Fresh Prints',
      description: 'Businesses only. Emergency postcard printing in San Diego: rush and same-day postcards for promotions and campaigns, with free delivery. Call 619-500-1959.',
      keywords: 'emergency postcard printing San Diego, rush postcard printing, same-day postcard printing San Diego, custom postcards San Diego',
      canonical: 'https://realfreshprints.com/postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp',
      breadcrumb: 'Postcard Printing',
      service: 'Emergency Postcard Printing'
    });
  }
}

import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-booklets',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './booklets.component.html',
  styleUrl: './booklets.component.css'
})
export class BookletsComponent {
  faqs = PRODUCT_FAQS['booklets'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Business Booklet Printing, San Diego | Fresh Prints',
      description: 'Businesses only. Emergency booklet printing in San Diego: booklets, catalogs and training manuals in 1 to 3 days, with free delivery. Call 619-500-1959.',
      keywords: 'emergency booklet printing San Diego, rush booklet printing, fast booklet printing San Diego, custom booklets San Diego',
      canonical: 'https://realfreshprints.com/booklets',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp',
      breadcrumb: 'Booklet Printing',
      service: 'Emergency Booklet Printing'
    });
  }
}

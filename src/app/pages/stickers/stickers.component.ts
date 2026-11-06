import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-stickers',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './stickers.component.html',
  styleUrl: './stickers.component.css'
})
export class StickersComponent {
  faqs = PRODUCT_FAQS['stickers'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Business Sticker Printing, San Diego | Fresh Prints',
      description: 'Businesses only. Emergency sticker printing in San Diego. Stickers are our fastest item, same-day on most orders, with free delivery. Call 619-500-1959.',
      keywords: 'emergency sticker printing San Diego, rush sticker printing, same-day sticker printing San Diego, custom stickers San Diego',
      canonical: 'https://realfreshprints.com/stickers',
      ogImage: 'https://realfreshprints.com/assets/images/stickers.webp',
      breadcrumb: 'Sticker Printing',
      service: 'Emergency Sticker Printing'
    });
  }
}

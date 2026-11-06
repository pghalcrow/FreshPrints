import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-sleeves',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './sleeves.component.html',
  styleUrl: './sleeves.component.css'
})
export class SleevesComponent {
  faqs = PRODUCT_FAQS['sleeves'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Business Packaging Sleeves, San Diego | Fresh Prints',
      description: 'Businesses only. Emergency packaging sleeve printing in San Diego: custom sleeves for jars, bottles, boxes and apparel in about 7 working days. Call 619-500-1959.',
      keywords: 'emergency sleeve printing San Diego, rush packaging sleeves, fast sleeve printing San Diego, custom product sleeves San Diego',
      canonical: 'https://realfreshprints.com/sleeves',
      ogImage: 'https://realfreshprints.com/assets/images/sleeves_02.jpg',
      breadcrumb: 'Packaging Sleeve Printing',
      service: 'Emergency Packaging Sleeve Printing'
    });
  }
}

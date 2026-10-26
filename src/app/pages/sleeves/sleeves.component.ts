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
      title: 'Emergency Packaging Sleeve Printing San Diego | Fresh Prints',
      description: 'Emergency packaging sleeve printing in San Diego. Custom sleeves for jars, bottles, boxes and apparel in approximately 7 working days. Call 619-500-1959.',
      keywords: 'emergency sleeve printing San Diego, rush packaging sleeves, fast sleeve printing San Diego, custom product sleeves San Diego',
      canonical: 'https://realfreshprints.com/sleeves',
      ogImage: 'https://realfreshprints.com/assets/images/sleeves_02.jpg',
      breadcrumb: 'Packaging Sleeve Printing',
      service: 'Emergency Packaging Sleeve Printing'
    });
  }
}

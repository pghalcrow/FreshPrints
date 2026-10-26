import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-catalogs',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.css'
})
export class CatalogsComponent {
  faqs = PRODUCT_FAQS['catalogs'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Catalog Printing San Diego | Fresh Prints',
      description: 'Emergency catalog printing for San Diego businesses. Professional, color-accurate catalogs with same-day and next-day turnaround. Call 619-500-1959.',
      keywords: 'emergency catalog printing San Diego, rush catalog printing, same-day catalog printing San Diego, custom catalogs San Diego',
      canonical: 'https://realfreshprints.com/catalogs',
      ogImage: 'https://realfreshprints.com/assets/images/catalogs.webp',
      breadcrumb: 'Catalog Printing',
      service: 'Emergency Catalog Printing'
    });
  }
}

import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductFaqComponent } from '../../components/product-faq/product-faq.component';
import { PRODUCT_FAQS } from '../../data/product-faqs';

@Component({
  selector: 'app-flyers',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent, ProductFaqComponent],
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.css'
})
export class FlyersComponent {
  faqs = PRODUCT_FAQS['flyers'];

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Business Flyer Printing, San Diego | Fresh Prints',
      description: 'Businesses only. Emergency flyer printing in San Diego: same-day and next-day rush flyers in full color, with free delivery. Call 619-500-1959.',
      keywords: 'emergency flyer printing San Diego, rush flyer printing, same-day flyer printing San Diego, custom flyers San Diego',
      canonical: 'https://realfreshprints.com/flyers',
      ogImage: 'https://realfreshprints.com/assets/images/flyers.webp',
      breadcrumb: 'Flyer Printing',
      service: 'Emergency Flyer Printing'
    });
  }
}

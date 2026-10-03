import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-labels',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './labels.component.html',
  styleUrl: './labels.component.css'
})
export class LabelsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Label Printing San Diego | Fresh Prints',
      description: 'Emergency label printing in San Diego: product, barcode, food and beverage, medical and shipping labels, same-day or next-day. Call 619-500-1959.',
      keywords: 'emergency label printing San Diego, rush label printing, same-day label printing San Diego, custom labels San Diego, roll labels San Diego',
      canonical: 'https://realfreshprints.com/labels',
      ogImage: 'https://realfreshprints.com/assets/images/labels.webp'
    });
  }
}

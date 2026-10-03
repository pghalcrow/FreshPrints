import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-packaging',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './packaging.component.html',
  styleUrl: './packaging.component.css'
})
export class PackagingComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Packaging Printing San Diego | Fresh Prints',
      description: 'Emergency packaging printing for San Diego businesses. Custom boxes, cartons, folding packaging and sleeves on rush timelines. Call 619-500-1959.',
      keywords: 'emergency packaging printing San Diego, rush packaging printing, same-day packaging San Diego, custom packaging San Diego',
      canonical: 'https://realfreshprints.com/packaging',
      ogImage: 'https://realfreshprints.com/assets/images/packaging.webp',
      breadcrumb: 'Packaging Printing',
      service: 'Emergency Packaging Printing'
    });
  }
}

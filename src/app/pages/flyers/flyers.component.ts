import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-flyers',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.css'
})
export class FlyersComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Flyer Printing San Diego | Fresh Prints',
      description: 'Emergency flyer printing for San Diego businesses. Same-day and next-day rush flyers in full color, multiple sizes and finishes. Call 619-500-1959.',
      keywords: 'emergency flyer printing San Diego, rush flyer printing, same-day flyer printing San Diego, custom flyers San Diego',
      canonical: 'https://realfreshprints.com/flyers',
      ogImage: 'https://realfreshprints.com/assets/images/flyers.webp'
    });
  }
}

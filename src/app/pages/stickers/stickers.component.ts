import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';

@Component({
  selector: 'app-stickers',
  imports: [FadeImageDirective, SlideInDirective, RelatedProductsComponent],
  templateUrl: './stickers.component.html',
  styleUrl: './stickers.component.css'
})
export class StickersComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Sticker Printing San Diego | Fresh Prints',
      description: 'Emergency sticker printing for San Diego businesses. Custom stickers are our fastest item, with same-day turnaround on most orders. Call 619-500-1959.',
      keywords: 'emergency sticker printing San Diego, rush sticker printing, same-day sticker printing San Diego, custom stickers San Diego',
      canonical: 'https://realfreshprints.com/stickers',
      ogImage: 'https://realfreshprints.com/assets/images/stickers.webp'
    });
  }
}

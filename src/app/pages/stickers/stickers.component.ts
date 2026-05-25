import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-stickers',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './stickers.component.html',
  styleUrl: './stickers.component.css'
})
export class StickersComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Sticker Printing San Diego | Same-Day and Rush Custom Stickers | Fresh Prints',
      description: 'Fresh Prints delivers emergency sticker printing for San Diego businesses. Custom stickers are our fastest production item. Same-day turnaround available on most orders. Call 619-500-1959 now.',
      keywords: 'emergency sticker printing San Diego, rush sticker printing, same-day sticker printing San Diego, custom stickers San Diego',
      canonical: 'https://realfreshprints.com/stickers',
      ogImage: 'https://realfreshprints.com/assets/images/stickers.webp'
    });
  }
}

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
      title: 'Emergency Sticker Printing in San Diego, CA | Same-Day Rush Orders',
      description: 'Need custom stickers printed fast? Fresh Prints offers emergency sticker printing in San Diego, CA with same-day turnaround. Call us now.',
      keywords: 'emergency sticker printing San Diego, rush sticker printing, same-day sticker printing San Diego, custom stickers San Diego',
      canonical: 'https://realfreshprints.com/stickers',
      ogImage: 'https://realfreshprints.com/assets/images/stickers.webp'
    });
  }
}

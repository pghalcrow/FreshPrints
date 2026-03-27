import { Component } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-flyers',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.css'
})
export class FlyersComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Same-Day & Rush Flyer Printing in San Diego, CA | Get it ASAP',
      description: 'Get same-day or rush flyer printing in San Diego, CA. High-quality, fast turnaround, and local delivery. Perfect for promotions, events, and grand openings.',
      keywords: 'emergency flyer printing San Diego, rush flyer printing, same-day flyer printing San Diego, custom flyers San Diego',
      canonical: 'https://realfreshprints.com/flyers',
      ogImage: 'https://realfreshprints.com/assets/images/flyers.webp'
    });
  }
}

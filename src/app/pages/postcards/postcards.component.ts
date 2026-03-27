import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-postcards',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './postcards.component.html',
  styleUrl: './postcards.component.css'
})
export class PostcardsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Postcard Printing in San Diego, CA | Rush Turnaround',
      description: 'Need postcards printed today? Fresh Prints delivers emergency postcard printing in San Diego, CA. Fast turnaround, precise quality. Call us now.',
      keywords: 'emergency postcard printing San Diego, rush postcard printing, same-day postcard printing San Diego, custom postcards San Diego',
      canonical: 'https://realfreshprints.com/postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp'
    });
  }
}

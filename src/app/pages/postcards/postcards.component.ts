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
      title: 'Emergency Postcard Printing San Diego | Same-Day and Rush Postcards | Fresh Prints',
      description: 'Fresh Prints delivers emergency postcard printing for San Diego businesses. Rush and same-day turnaround on custom postcards for direct mail, promotions and corporate campaigns. Call 619-500-1959 now.',
      keywords: 'emergency postcard printing San Diego, rush postcard printing, same-day postcard printing San Diego, custom postcards San Diego',
      canonical: 'https://realfreshprints.com/postcards',
      ogImage: 'https://realfreshprints.com/assets/images/postcards.webp'
    });
  }
}

import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-packaging',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './packaging.component.html',
  styleUrl: './packaging.component.css'
})
export class PackagingComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Packaging Printing San Diego | Rush Custom Packaging | Fresh Prints',
      description: 'Fresh Prints delivers emergency packaging printing for San Diego businesses. Custom boxes, cartons, folding packaging and product sleeves on rush timelines. Call 619-500-1959 now.',
      keywords: 'emergency packaging printing San Diego, rush packaging printing, same-day packaging San Diego, custom packaging San Diego',
      canonical: 'https://realfreshprints.com/packaging',
      ogImage: 'https://realfreshprints.com/assets/images/packaging.webp'
    });
  }
}

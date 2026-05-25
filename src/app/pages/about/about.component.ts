import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'About Fresh Prints | Emergency B2B Printing Specialists in San Diego',
      description: 'Fresh Prints specializes exclusively in emergency B2B printing in San Diego. Decades of commercial printing experience. When other printers say no, we deliver. Learn who we are.',
      keywords: 'emergency printing San Diego, rush printing company San Diego, same-day printing San Diego, about Fresh Prints',
      canonical: 'https://realfreshprints.com/about',
      ogImage: 'https://realfreshprints.com/assets/images/about_prints.webp'
    });
  }
}

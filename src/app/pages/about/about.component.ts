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
      title: 'About Fresh Prints | San Diego Emergency Printing',
      description: 'Fresh Prints specializes in emergency B2B printing in San Diego, with decades of commercial printing experience. When other printers say no, we deliver.',
      keywords: 'emergency printing San Diego, rush printing company San Diego, same-day printing San Diego, about Fresh Prints',
      canonical: 'https://realfreshprints.com/about',
      ogImage: 'https://realfreshprints.com/assets/images/about_prints.webp'
    });
  }
}

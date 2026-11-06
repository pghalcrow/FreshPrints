import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';


@Component({
  selector: 'app-home',
  imports: [FadeImageDirective, SlideInDirective, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency & Same-Day Business Printing in San Diego | Fresh Prints',
      description: 'B2B emergency printing in San Diego: packaging, labels, stickers and booklets, same-day or next-day, with free delivery. Businesses only. Call 619-500-1959.',
      keywords: 'emergency printing San Diego, rush printing San Diego, same-day printing San Diego, fast printing San Diego CA',
      canonical: 'https://realfreshprints.com',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp'
    });
  }
}

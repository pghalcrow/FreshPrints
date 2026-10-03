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
      title: 'Emergency & Same-Day Printing in San Diego | Fresh Prints',
      description: 'Emergency printing for San Diego businesses: packaging, labels, stickers, booklets and marketing materials, same-day or next-day. Call 619-500-1959.',
      keywords: 'emergency printing San Diego, rush printing San Diego, same-day printing San Diego, fast printing San Diego CA',
      canonical: 'https://realfreshprints.com',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp'
    });
  }
}

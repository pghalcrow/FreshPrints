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
      title: 'Emergency Printing Services in San Diego | Same-Day and Rush Print Jobs | Fresh Prints',
      description: 'Fresh Prints delivers emergency printing for San Diego businesses. Packaging, labels, stickers, booklets, marketing materials and more. When your deadline is yesterday, we deliver. Call now.',
      keywords: 'emergency printing San Diego, rush printing San Diego, same-day printing San Diego, fast printing San Diego CA',
      canonical: 'https://realfreshprints.com',
      ogImage: 'https://realfreshprints.com/assets/images/booklets.webp'
    });
  }
}

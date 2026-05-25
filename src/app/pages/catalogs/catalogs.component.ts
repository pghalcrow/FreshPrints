import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-catalogs',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.css'
})
export class CatalogsComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'Emergency Catalog Printing San Diego | Rush Catalog Printing | Fresh Prints',
      description: 'Fresh Prints delivers emergency catalog printing for San Diego businesses. Professional, color-accurate catalogs on same-day and next-day turnaround. Call 619-500-1959 now.',
      keywords: 'emergency catalog printing San Diego, rush catalog printing, same-day catalog printing San Diego, custom catalogs San Diego',
      canonical: 'https://realfreshprints.com/catalogs',
      ogImage: 'https://realfreshprints.com/assets/images/catalogs.webp'
    });
  }
}

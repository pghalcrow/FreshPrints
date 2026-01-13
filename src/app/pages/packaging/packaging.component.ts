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
      title: 'Emergency Package Printing in San Diego, CA | Printing Done ASAP',
      description: 'Need packaging printed fast? Fresh Prints offers emergency package printing in San Diego, CA with fast turnarounds. Call today.'
    });
    }
}

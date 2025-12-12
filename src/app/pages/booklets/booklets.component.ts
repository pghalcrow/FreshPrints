import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-booklets',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './booklets.component.html',
  styleUrl: './booklets.component.css'
})
export class BookletsComponent {
  constructor(private seo: SeoService) {
      this.seo.updatePageMeta({
      title: 'Emergency Booklet Printing in San Diego, CA | Rush Orders',
      description: 'Get high-quality custom booklets fast with Fresh Prints. We offer rush printing for catalogs, manuals, and marketing booklets in San Diego, CA.'
    });
    }
}

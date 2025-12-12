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
      title: 'Emergency Catalog Printing in San Diego, CA | Rush Order Printing',
      description: 'Need catalogs printed fast in San Diego, CA? When deadlines are tight, we get your catalogs done on time. Call us now.'
    });
    }

}

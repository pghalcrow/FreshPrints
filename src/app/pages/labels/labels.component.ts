import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-labels',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './labels.component.html',
  styleUrl: './labels.component.css'
})
export class LabelsComponent {
  constructor(private seo: SeoService) {
      this.seo.updatePageMeta({
      title: 'Emergency Label Printing in San Diego, CA | Fast Turnaround',
      description: 'Need labels printed ASAP, call Fresh Prints for emergency label printing in San Diego, CA. We will meet your deadlines.'
    });
    }
}

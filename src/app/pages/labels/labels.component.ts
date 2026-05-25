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
      title: 'Emergency Label Printing San Diego | Rush Labels, Rolls and Cut Sheets | Fresh Prints',
      description: 'Fresh Prints delivers emergency label printing for San Diego businesses. Product labels, barcode labels, food and beverage, medical, shipping and more. Same-day and next-day turnaround. Call 619-500-1959 now.',
      keywords: 'emergency label printing San Diego, rush label printing, same-day label printing San Diego, custom labels San Diego, roll labels San Diego',
      canonical: 'https://realfreshprints.com/labels',
      ogImage: 'https://realfreshprints.com/assets/images/labels.webp'
    });
  }
}

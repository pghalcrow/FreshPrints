import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';


@Component({
  selector: 'app-home',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent{


  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
    title: 'Emergency Printing in San Diego, CA | Get Your Prints ASAP',
    description: 'Need printing fast? Fresh Prints delivers emergency printing in San Diego, CA, and beyond when you need prints ASAP.'
    });
  }
}

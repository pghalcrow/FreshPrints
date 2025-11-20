import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-about',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}

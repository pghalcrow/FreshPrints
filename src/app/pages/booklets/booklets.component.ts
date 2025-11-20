import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-booklets',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './booklets.component.html',
  styleUrl: './booklets.component.css'
})
export class BookletsComponent {

}

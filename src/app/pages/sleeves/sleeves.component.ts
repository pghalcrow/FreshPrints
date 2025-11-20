import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-sleeves',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './sleeves.component.html',
  styleUrl: './sleeves.component.css'
})
export class SleevesComponent {

}

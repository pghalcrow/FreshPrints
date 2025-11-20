import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-labels',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './labels.component.html',
  styleUrl: './labels.component.css'
})
export class LabelsComponent {

}

import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-packaging',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './packaging.component.html',
  styleUrl: './packaging.component.css'
})
export class PackagingComponent {

}

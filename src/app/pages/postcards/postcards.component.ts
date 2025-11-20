import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-postcards',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './postcards.component.html',
  styleUrl: './postcards.component.css'
})
export class PostcardsComponent {

}

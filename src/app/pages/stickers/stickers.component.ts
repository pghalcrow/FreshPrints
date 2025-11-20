import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-stickers',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './stickers.component.html',
  styleUrl: './stickers.component.css'
})
export class StickersComponent {

}

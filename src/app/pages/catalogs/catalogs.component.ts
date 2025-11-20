import { Component } from '@angular/core';
import { FadeImageDirective } from '../../directives/fade-image.directive';
import { SlideInDirective } from '../../directives/slide-in.directive';

@Component({
  selector: 'app-catalogs',
  imports: [FadeImageDirective, SlideInDirective],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.css'
})
export class CatalogsComponent {

}

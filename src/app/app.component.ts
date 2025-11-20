import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FadeImageDirective } from './directives/fade-image.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FadeImageDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FreshPrints';
}

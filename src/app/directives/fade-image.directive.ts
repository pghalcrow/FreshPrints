import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFadeImage]',
  standalone: true
})
export class FadeImageDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const img: HTMLImageElement = this.el.nativeElement;
    if (img.complete) {
      this.renderer.addClass(img, 'loaded');
    } else {
      img.addEventListener('load', () => this.renderer.addClass(img, 'loaded'));
    }
  }
}


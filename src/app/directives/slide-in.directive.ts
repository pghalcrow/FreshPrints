import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[slideIn]',
  standalone: true
})
export class SlideInDirective implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target); // only trigger once
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(this.el.nativeElement);
  }
}


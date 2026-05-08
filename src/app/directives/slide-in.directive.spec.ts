import { SlideInDirective } from './slide-in.directive';

describe('SlideInDirective', () => {
  it('should create an instance', () => {
    const directive = new SlideInDirective({
      nativeElement: document.createElement('div')
    });

    expect(directive).toBeTruthy();
  });

  it('does not throw when IntersectionObserver is unavailable', () => {
    const originalIntersectionObserver = window.IntersectionObserver;
    const directive = new SlideInDirective({
      nativeElement: document.createElement('div')
    });

    delete (window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;

    expect(() => directive.ngAfterViewInit()).not.toThrow();

    window.IntersectionObserver = originalIntersectionObserver;
  });
});

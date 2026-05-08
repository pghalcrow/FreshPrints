import { FadeImageDirective } from './fade-image.directive';
import { Renderer2 } from '@angular/core';

describe('FadeImageDirective', () => {
  it('should create an instance', () => {
    const renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['addClass']);
    const directive = new FadeImageDirective({
      nativeElement: document.createElement('img')
    }, renderer);

    expect(directive).toBeTruthy();
  });
});

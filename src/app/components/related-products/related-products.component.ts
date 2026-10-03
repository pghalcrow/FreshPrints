import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-related-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './related-products.component.html',
  styleUrl: './related-products.component.css'
})
export class RelatedProductsComponent {
  // Route of the page this is shown on, so it is left out of the list
  @Input() current = '';

  private readonly products = [
    { label: 'Emergency booklet printing', url: '/booklets' },
    { label: 'Emergency catalog printing', url: '/catalogs' },
    { label: 'Emergency flyer printing', url: '/flyers' },
    { label: 'Emergency label printing', url: '/labels' },
    { label: 'Emergency packaging printing', url: '/packaging' },
    { label: 'Emergency postcard printing', url: '/postcards' },
    { label: 'Packaging sleeve printing', url: '/sleeves' },
    { label: 'Emergency sticker printing', url: '/stickers' },
  ];

  get links() {
    return this.products.filter(product => product.url !== this.current);
  }
}

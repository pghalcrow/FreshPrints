import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { FaqItem } from '../../data/product-faqs';

@Component({
  selector: 'app-product-faq',
  imports: [RouterLink],
  templateUrl: './product-faq.component.html',
  styleUrl: './product-faq.component.css'
})
export class ProductFaqComponent implements OnChanges, OnDestroy {
  @Input() heading = 'Frequently Asked Questions';
  @Input() items: FaqItem[] = [];

  constructor(private seo: SeoService) {}

  ngOnChanges(): void {
    this.seo.setJsonLd('faq-schema', this.items.length ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    } : null);
  }

  ngOnDestroy(): void {
    this.seo.setJsonLd('faq-schema', null);
  }
}

import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updatePageMeta(config: {
    title: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
  }) {
    this.title.setTitle(config.title);

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Fresh Prints' });

    if (config.canonical) {
      this.meta.updateTag({ property: 'og:url', content: config.canonical });
      this.setCanonicalUrl(config.canonical);
    }

    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
      this.meta.updateTag({ name: 'twitter:image', content: config.ogImage });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    if (config.description) {
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
  }

  private setCanonicalUrl(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

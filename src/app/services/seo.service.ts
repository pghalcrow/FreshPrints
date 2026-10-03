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
    breadcrumb?: string;
    service?: string;
  }) {
    this.title.setTitle(config.title);
    this.setJsonLd('page-schema', this.pageSchema(config));

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

  // Adds or replaces a JSON-LD block in <head>. Passing no data removes it.
  setJsonLd(id: string, data: object | object[] | null): void {
    const existing = this.document.getElementById(id);
    const isEmpty = !data || (Array.isArray(data) && data.length === 0);

    if (isEmpty) {
      existing?.remove();
      return;
    }

    const script = existing ?? this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    script.textContent = JSON.stringify(data);
    if (!existing) this.document.head.appendChild(script);
  }

  private pageSchema(config: {
    description?: string;
    canonical?: string;
    breadcrumb?: string;
    service?: string;
  }): object[] {
    const schema: object[] = [];
    if (!config.canonical) return schema;

    if (config.service) {
      schema.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: config.service,
        serviceType: config.service,
        description: config.description,
        url: config.canonical,
        provider: { '@id': this.businessId },
        areaServed: { '@type': 'AdministrativeArea', name: 'San Diego County, CA' }
      });
    }

    if (config.breadcrumb) {
      schema.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: this.siteUrl },
          { '@type': 'ListItem', position: 2, name: config.breadcrumb, item: config.canonical }
        ]
      });
    }

    return schema;
  }

  private readonly siteUrl = 'https://realfreshprints.com';
  private readonly businessId = 'https://realfreshprints.com/#business';

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

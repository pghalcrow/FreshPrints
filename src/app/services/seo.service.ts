import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private title: Title, private meta: Meta) {}

  updatePageMeta(config: {
    title: string;
    description?: string;
    keywords?: string;
  }) {
    this.title.setTitle(config.title);

    if (config.description) {
      this.meta.updateTag({
        name: 'description',
        content: config.description
      });
    }

    if (config.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: config.keywords
      });
    }
  }
}
